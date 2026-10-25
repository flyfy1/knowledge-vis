"""Prepared operation only. Explicit reviewed root dispatch is mandatory; never auto-retry."""
import argparse
import contextlib
import copy
import fcntl
import hashlib
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time

ROOT = Path('/home/songyy/projects')
REPO = ROOT / 'leetcode-hard-campaign-20261018'
STATE = ROOT / 'leetcode-hard-campaign-state-20261018'
OWNER = 'import960964-reopen818964-20261026-c740a1e6'
DISPATCH = 'root-reviewed-import960964-reopen818964-20261026'
SOURCE = '7236925f69c0e7183a313c02e123b5d68a8e91f6'
IDS = ('960', '964')
SOURCE964 = 'ca4622c7af1d498ab4fa02dc76a40b44161d715f'
REOPEN_IDS = ('818', '964')
REQUESTS = {'818': 'specs/reviews/818-review-resource-improvement-request-20261026.md', '964': 'specs/reviews/964-review-normalization-request-20261026.md'}
ALLOWLIST = ('specs/reviews/818-review-resource-improvement-design-20261026.md', REQUESTS['818'], REQUESTS['964'])
PINS_SHA = '41b1113194004167423e42f20ac9f2c4d2f8069709dc0187c5525c433e2f6d93'
RECEIPT = STATE / (OWNER + '.json')
imp = None
pins = None


def require(ok, message):
    if not ok:
        raise RuntimeError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read(path):
    return json.loads(path.read_text())


def save(path, value, exclusive=False):
    """Durable JSON without mutating any ordinary state field, including updated_at."""
    data = (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode()
    if exclusive:
        with path.open('xb') as out:
            out.write(data)
            out.flush()
            os.fsync(out.fileno())
    else:
        fd, name = tempfile.mkstemp(prefix='.maintenance-', dir=path.parent)
        try:
            with os.fdopen(fd, 'wb') as out:
                out.write(data)
                out.flush()
                os.fsync(out.fileno())
            os.replace(name, path)
        finally:
            if os.path.exists(name):
                os.unlink(name)
    fd = os.open(path.parent, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def git(*args):
    return imp.git(REPO, *args)



def canonical(value):
    return sha(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode())


def hashes_unchanged():
    for path, digest in pins['policy'].items():
        require(sha((REPO/path).read_bytes()) == digest, 'Policy/runtime changed: ' + path)
    require(sha((STATE/'launch.py').read_bytes()) == pins['launcher_sha256'], 'External launcher changed')


def accepted818_guard(state):
    require(len(state['queue']) == 984 and canonical(state['queue']) == pins['queue_sha256'], 'Finite queue changed')
    entry, frozen = state['problems']['818'], pins['accepted818']
    require(entry == frozen['entry'] and canonical(entry) == frozen['entry_sha256'], 'Historical 818 entry changed')
    require(entry['status'] == 'accepted_local' and entry['phase'] == 'done' and 0 < entry['rounds'] < 6 and entry['rounds'] == len(entry['reviews']), '818 acceptance/budget incompatible')
    require(canonical([r for r in state['runs'] if r['problem_id'] == '818']) == frozen['runs_sha256'], 'Historical 818 runs changed')
    require(git('rev-parse', 'HEAD:leetcode/818') == frozen['lesson_git_tree'], '818 lesson tree changed')
    require(sha((REPO/entry['prior_report']).read_bytes()) == frozen['report_sha256'], '818 historical review changed')
    for name, digest in frozen['runtime_sha256'].items():
        require(sha((REPO/'leetcode/818'/name).read_bytes()) == digest, '818 runtime changed: ' + name)


def boundary_guard():
    procs = processes()
    require(not workers(procs) and not any(pid != os.getpid() and x['cwd'] == str(REPO) for pid, x in procs.items()), 'Central writer/native/preview remains at boundary')


def processes():
    result = {}
    for pr in Path('/proc').iterdir():
        if not pr.name.isdigit():
            continue
        try:
            args = [a.decode(errors='replace') for a in (pr/'cmdline').read_bytes().split(b'\0') if a]
            status = dict(line.split(':', 1) for line in (pr/'status').read_text().splitlines())
            result[int(pr.name)] = {'args': args, 'ppid': int(status['PPid']), 'cwd': str((pr/'cwd').resolve())}
        except OSError:
            pass
    return result


def workers(procs):
    return {p: x for p, x in procs.items() if any(a.endswith('/scripts/leetcode_campaign.py') for a in x['args'])}


def fresh_events(run):
    path = Path(run['directory'])/'events.jsonl'
    events = []
    if path.exists():
        for line in path.read_text().splitlines():
            try:
                e = json.loads(line)
            except ValueError:
                continue  # The last JSONL record may still be in flight.
            if e.get('type') in ('thread.started', 'turn.started'):
                events.append(e)
    return events


def native_children(procs, runner):
    result = []
    for pid, info in procs.items():
        ancestor, seen = info['ppid'], set()
        while ancestor in procs and ancestor not in seen and ancestor != runner:
            seen.add(ancestor)
            ancestor = procs[ancestor]['ppid']
        args = info['args']
        if ancestor == runner and args and '/vendor/' in args[0] and args[0].endswith('/codex') and info['cwd'] == str(REPO):
            result.append(pid)
    return result


def new_run_evidence(state, old_ids, old_sessions, expected, procs, runner):
    current = state.get('current') or {}
    if state.get('status') != 'running' or current.get('problem_id') != expected or current.get('run_id') in old_ids:
        return None
    run = next((r for r in state['runs'] if r['id'] == current.get('run_id')), None)
    if not run or run['status'] != 'running':
        return None
    events = fresh_events(run)
    threads = [e.get('thread_id') for e in events if e.get('type') == 'thread.started']
    children = native_children(procs, runner)
    if len(threads) != 1 or not threads[0] or threads[0] in old_sessions or not children or not any(e.get('type') == 'turn.started' for e in events):
        return None
    return {'current': current, 'session_id': threads[0], 'native_codex_pids': children, 'events': events}


def payload_valid(payload):
    require(set(payload) == set(ALLOWLIST) == set(pins['documents']), 'Document allowlist differs')
    for path, data in payload.items():
        require(sha(data) == pins['documents'][path], 'Fixed request bytes differ: ' + path)


def document_tree_valid(before, after):
    changed = {p for p in before.keys() | after.keys() if before.get(p) != after.get(p)}
    require(changed == set(ALLOWLIST) and not set(ALLOWLIST) & set(before), 'Request commit changed/overwrote unexpected paths')
    require(all(after[p].split()[0] == '100644' for p in ALLOWLIST), 'Request file mode differs')


def transition(before, head, maintenance):
    after = copy.deepcopy(before)
    for pid in REOPEN_IDS:
        entry = after['problems'][pid]
        require(entry['status'] == 'accepted_local' and entry['phase'] == 'done', 'Only accepted targets may reopen')
        require(0 < entry['rounds'] < 6 and entry['rounds'] == len(entry['reviews']), 'Retain review budget')
        for key in ('accepted_at', 'registration_commit'):
            entry.pop(key, None)
        entry.update(status='changes_required', phase='fix', prior_report=REQUESTS[pid])
    after.update(status='stopped', current=None, expected_head=head)
    after.setdefault('maintenance', []).append(copy.deepcopy(maintenance))
    return after


def publication_bound(state, ledger, incoming=()):
    """Read-only publisher eligibility plus a conservative deduplicated upper bound."""
    require(ledger['pending'] is None, 'Pending release requires inspection')
    from leetcode_registry import read_registry
    from leetcode_publish import _reviewed
    registry = {str(r['id']): r for r in read_registry(REPO/'leetcode/problems.config.js')}
    prospective = {pid for pid, e in state['problems'].items() if e['status'] == 'accepted_local' and ledger['released'].get(pid, {}).get('candidate') != e.get('candidate')}
    accepted = _reviewed(REPO, state, registry, imp.head(REPO), prospective)
    require(not any(ledger['released'].get(pid, {}).get('digest') == item['digest'] for pid, item in accepted.items()), 'Startup would refresh same-digest release pointers')
    eligible = {pid for pid in state['queue'] if pid in accepted and ledger['released'].get(pid, {}).get('digest') != accepted[pid]['digest']}
    registering = {pid for pid, e in state['problems'].items() if e.get('phase') == 'register'}
    require(all(state['problems'][pid]['status'] == 'review_passed' for pid in registering), 'Invalid pending registration')
    released_registering = registering & set(ledger['released'])
    if released_registering:
        # Throwaway status projection only. Existing registry must already match;
        # _reviewed refuses incompatible metadata. No future registry simulation.
        projected = copy.deepcopy(state)
        for pid in released_registering:
            projected['problems'][pid]['status'] = 'accepted_local'
        pending = _reviewed(REPO, projected, registry, imp.head(REPO), released_registering)
        require(set(pending) == released_registering, 'Pending registration projection incomplete')
        require(not any(ledger['released'][pid].get('digest') == item['digest'] and ledger['released'][pid].get('candidate') != state['problems'][pid].get('candidate') for pid, item in pending.items()), 'Pending registration would refresh same-digest release pointer')
    # Retain both reopened IDs in the conservative bound even after reopening.
    upper = eligible | set(incoming) | registering | set(REOPEN_IDS)
    require(len(upper) < 20, 'Conservative startup publication bound reaches 20; inspect, do not resume')
    return {'eligible': sorted(eligible), 'incoming': sorted(set(incoming)), 'registration_ids': sorted(registering), 'reopened_upper_bound_ids': list(REOPEN_IDS), 'upper_bound_ids': sorted(upper), 'upper_bound': len(upper)}


def resume_plan(state, ledger, incoming=()):
    from leetcode_campaign import TERMINAL
    registrations, next_problem = [], None
    for pid in state['queue']:
        entry = state['problems'].get(pid, {})
        if entry.get('status') in TERMINAL:
            continue
        if entry.get('phase') == 'register':
            require(entry.get('status') == 'review_passed', 'Invalid registration prefix')
            registrations.append(pid)
            continue
        next_problem = pid
        break
    require(next_problem is not None, 'No next agent; ordinary completion requires separate handling')
    require(not set(incoming) & set(state['problems']), 'Incoming lane already present')
    return {'next_problem_id': next_problem, 'registration_ids': registrations, 'publication_bound': publication_bound(state, ledger, incoming)}


def verify_registered_resume(before, resumed, policy_head, plan, fresh_run):
    """Validate ordinary registration effects; never perform registration ourselves."""
    from leetcode_campaign import REGISTER_PATHS
    cursor = policy_head
    commits = []
    initial_tree = imp.tree(REPO, policy_head)
    for pid in plan['registration_ids']:
        previous = before['problems'][pid]
        actual = resumed['problems'][pid]
        require(previous['status'] == 'review_passed' and previous['phase'] == 'register', 'Registration was not pending')
        expected = copy.deepcopy(previous)
        require(isinstance(actual.get('accepted_at'), str) and actual['accepted_at'], 'Registration acceptance time missing')
        expected.update(status='accepted_local', phase='done', accepted_at=actual['accepted_at'])
        if 'leetcode/'+pid+'/lesson-entry.json' in initial_tree:
            registered = actual.get('registration_commit')
            require(isinstance(registered, str) and registered, 'Registration commit missing')
            expected['registration_commit'] = registered
            if registered != cursor:
                require(git('rev-list', '--parents', '-n', '1', registered).split()[1:] == [cursor], 'Registration commit has unexpected ancestry')
                first, second = imp.tree(REPO, cursor), imp.tree(REPO, registered)
                changed = {p for p in first.keys() | second.keys() if first.get(p) != second.get(p)}
                require(changed and changed <= REGISTER_PATHS, 'Registration commit changed unrelated content')
                message = git('show', '-s', '--format=%B', registered)
                require(message.splitlines()[0] == 'Register independently reviewed LeetCode '+pid+' locally', 'Unexpected registration commit subject')
                for trailer in ('Campaign-Status: accepted_local', 'Review-Candidate: '+previous['candidate'], 'Review-Report: '+previous['prior_report']):
                    require(trailer in message.splitlines(), 'Registration provenance trailer missing')
                old_registry = imp.read_registry_from_commit(REPO, cursor, STATE)
                new_registry = {str(row['id']): row for row in imp.read_registry_from_commit(REPO, registered, STATE)}
                require(all(new_registry.get(str(row['id'])) == row for row in old_registry), 'Registration altered prior registry entries')
                cursor = registered
            commits.append({'problem_id': pid, 'head': registered})
        require(actual == expected, 'Registration changed prior candidate/review/ordinary problem metadata')
    next_id = plan['next_problem_id']
    require(set(resumed['problems']) == set(before['problems']) | {next_id}, 'Resume created unexpected problem records')
    for pid, previous in before['problems'].items():
        if pid not in plan['registration_ids']:
            expected = copy.deepcopy(previous)
            if pid == next_id and previous['phase'] == 'review':
                expected['candidate'] = cursor  # The ordinary runner freezes a new whole-tree review candidate.
            require(resumed['problems'][pid] == expected, 'Resume changed an existing problem record')
    if next_id not in before['problems']:
        entry = resumed['problems'][next_id]
        initial_keys = {'status','rounds','new','phase','reviews','author_runs','prior_report'}
        if entry.get('phase') == 'review':
            initial_keys.add('candidate')
            require(entry.get('candidate') == cursor, 'Fresh reviewer candidate differs')
        require(set(entry) == initial_keys and
                entry['status'] == 'pending' and entry['rounds'] == 0 and entry['phase'] in ('author','review') and
                type(entry['new']) is bool and entry['reviews'] == [] and entry['author_runs'] == [] and entry['prior_report'] == '', 'Unexpected fresh problem initialization')
    require(resumed['runs'][:len(before['runs'])] == before['runs'] and resumed['runs'][len(before['runs']):] == [fresh_run], 'Resume changed historical runs or started an extra agent')
    natural = {'status','updated_at','expected_head','current','runs','problems','error'}
    require({k:v for k,v in before.items() if k not in natural} == {k:v for k,v in resumed.items() if k not in natural}, 'Resume changed unrelated campaign metadata')
    require(fresh_run['candidate'] == cursor and resumed['expected_head'] == cursor and imp.head(REPO) == cursor, 'Fresh agent candidate is not the proven policy/registration head')
    return {'registration_commits': commits, 'agent_candidate': cursor, 'prior_reviews_and_runs_preserved': True}


def import_metadata_preserved(before, after):
    allowed = {'expected_head', 'updated_at', 'problems', 'runs', 'lane_imports'}
    require({k:v for k,v in before.items() if k not in allowed} ==
            {k:v for k,v in after.items() if k not in allowed}, 'Import altered ordinary metadata')
    require(set(after['problems']) == set(before['problems']) | set(IDS), 'Unexpected imported problem keys')
    require(all(after['problems'][k] == v for k,v in before['problems'].items()), 'Prior problem records changed')
    require(after['runs'][:len(before['runs'])] == before['runs'], 'Prior run records changed')
    require(all(r['problem_id'] in IDS for r in after['runs'][len(before['runs']):]), 'Unexpected imported run')
    require(after.get('lane_imports', [])[:len(before.get('lane_imports', []))] == before.get('lane_imports', []), 'Import history changed')


def owned_stop(raw):
    require((STATE/'STOP').read_bytes() == raw and json.loads(raw)['owner'] == OWNER, 'STOP ownership/content changed')


def lane_paths(pid):
    return ROOT/f'leetcode-hard-lane-{pid}-20261026', ROOT/f'leetcode-hard-lane-state-{pid}-20261026'


def lane_preflight(central):
    from leetcode_publish import _reviewed
    from leetcode_registry import read_registry
    result = []
    with contextlib.ExitStack() as locks:
        for pid in IDS:
            repo, directory = lane_paths(pid)
            locks.enter_context(imp.ownership(repo, directory))
            lane = imp.validate_checkout(repo, directory)
            require(lane['status'] == 'completed' and lane.get('current') is None and lane['queue'] == [pid], 'Lane is not complete')
            require(pid not in central['problems'] and all(r['problem_id'] != pid for r in central['runs']), 'Central already started lane ID')
            runner = int((directory/'runner.pid').read_text())
            require(not (Path('/proc')/str(runner)).exists(), 'Lane runner still exists')
            require(not any(x['cwd'] == str(repo) for x in processes().values()), 'Lane still has a process in its checkout')
            entry = lane['problems'][pid]
            frozen = pins['lanes'][pid]
            require(imp.head(repo) == frozen['head'] and entry == frozen['entry'] and canonical(entry) == frozen['entry_sha256'], 'Lane acceptance differs from reviewed pins')
            require(canonical(lane['runs']) == frozen['runs_sha256'] and sha((directory/'progress.json').read_bytes()) == frozen['progress_sha256'], 'Lane progress/run history changed')
            require(sha((repo/entry['prior_report']).read_bytes()) == frozen['report_sha256'], 'Pinned lane report changed')
            require(entry['status'] == 'accepted_local' and entry['phase'] == 'done', 'Lane not independently accepted')
            runs = imp.validate_runs(lane, directory, pid, central)
            registry = {str(r['id']): r for r in read_registry(repo/'leetcode/problems.config.js')}
            _reviewed(repo, lane, registry, imp.head(repo), {pid})
            imp.same_shared(REPO, imp.head(REPO), entry['candidate'])
            imp.same_shared(REPO, imp.head(REPO), imp.head(repo))
            reservation = read(STATE/f'lane-{pid}-reservation.json')
            require(reservation == frozen['reservation'], 'Pinned reservation changed')
            require(reservation['status'] == 'started' and reservation['repo'] == str(repo) and reservation['state_dir'] == str(directory), 'Reservation mismatch')
            result.append({'id': pid, 'lane_head': imp.head(repo), 'candidate': entry['candidate'], 'score': entry['reviews'][-1]['weighted_score'], 'required_open': entry['reviews'][-1]['required_open'], 'run_ids': [r['id'] for r in runs]})
    return result


def adopt_and_reopen(payload, record, stop_raw):
    before = imp.validate_checkout(REPO, STATE)
    require(before['status'] == 'stopped', 'Request adoption requires stopped state')
    owned_stop(stop_raw)
    hashes_unchanged()
    accepted818_guard(before)
    payload_valid(payload)
    require(before['problems']['964'] == pins['lanes']['964']['entry'], 'Imported 964 acceptance changed before reopening')
    old_head, old_tree = before['expected_head'], imp.tree(REPO, before['expected_head'])
    require(not set(ALLOWLIST) & set(old_tree), 'Request already tracked')
    ledger_raw, progress_raw = (STATE/'releases.json').read_bytes(), (STATE/'progress.json').read_bytes()
    backup = STATE/(OWNER+'-before-reopen.json')
    save(backup, before, exclusive=True)
    maintenance = {'kind': 'reopen-resource-and-normalization', 'request_ids': ['818-RESOURCE-R1', '964-NORMALIZE-R1'], 'selected_advisory': '964-R1-A1', 'at': imp.now(), 'document_sources': pins['document_sources'], 'before': old_head, 'backup': str(backup), 'previous_current': copy.deepcopy(before.get('current')), 'prior_acceptance': {pid: {k: before['problems'][pid][k] for k in ('accepted_at','registration_commit','prior_report') if k in before['problems'][pid]} for pid in REOPEN_IDS}}
    record.update(status='adopting-request', maintenance=maintenance, request_before={'head': old_head, 'progress_sha256': sha(progress_raw), 'ledger_sha256': sha(ledger_raw)})
    save(RECEIPT, record)
    for path, data in payload.items():
        target = REPO/path
        require(not target.exists() and not target.is_symlink(), 'Request path already exists')
        with target.open('xb') as out:
            out.write(data)
        target.chmod(0o644)
    require(imp.changed_paths(REPO) == set(ALLOWLIST), 'Unexpected request worktree changes')
    git('diff', '--check')
    git('add', '--', *ALLOWLIST)
    require(set(git('diff', '--cached', '--name-only').splitlines()) == set(ALLOWLIST), 'Unexpected staged paths')
    require((STATE/'progress.json').read_bytes() == progress_raw and (STATE/'releases.json').read_bytes() == ledger_raw, 'State/ledger changed before request commit')
    owned_stop(stop_raw)
    git('commit', '-m', 'Prepare ordinary LeetCode 818 resource and 964 explanation revisions\n\nAdopt three reviewed request documents after independent lane imports. Preserve prior acceptance and all review/run history; no runtime improvement or new acceptance claimed.\n\nRequest-Source: '+SOURCE+'\nNormalization-Request-Source: '+SOURCE964+'\nBuilt-By: guarded one-off import and revision operator\nVerified-By: independently reviewed request and transition; fresh lesson review remains required')
    head = imp.head(REPO)
    require(git('rev-list', '--parents', '-n', '1', head).split()[1:] == [old_head], 'Unexpected request commit parents')
    document_tree_valid(old_tree, imp.tree(REPO, head))
    require(not imp.changed_paths(REPO) and all(imp.blob(REPO, head, p) == b for p, b in payload.items()), 'Committed document bytes differ or dirty checkout')
    hashes_unchanged()
    require((STATE/'progress.json').read_bytes() == progress_raw and (STATE/'releases.json').read_bytes() == ledger_raw, 'State/ledger changed before transition')
    maintenance['after'] = head
    after = transition(before, head, maintenance)
    save(STATE/'progress.json', after)
    require(read(STATE/'progress.json') == transition(before, head, maintenance), 'Unexpected reopening state delta')
    require((STATE/'releases.json').read_bytes() == ledger_raw, 'Reopening altered ledger')
    record.update(status='reopened-still-stopped', maintenance=maintenance, request_commit=head, reopened_ids=list(REOPEN_IDS))
    save(RECEIPT, record)
    return after


def execute():
    require(not RECEIPT.exists(), 'Existing transaction receipt: inspect; no blind retry')
    record = {'owner': OWNER, 'status': 'preflight', 'document_sources': pins['document_sources'], 'created_at': imp.now()}
    stop_raw = None
    with (STATE/(OWNER+'.lock')).open('a') as operator:
        fcntl.flock(operator, fcntl.LOCK_EX | fcntl.LOCK_NB)
        require(not RECEIPT.exists(), 'Transaction was started concurrently')
        save(RECEIPT, record, exclusive=True)
        try:
            hashes_unchanged()
            require(git('branch', '--show-current') == 'codex/all-hard-20261018', 'Unexpected central branch before maintenance')
            require(not (STATE/'STOP').exists(), 'Existing STOP must not be replaced')
            central = read(STATE/'progress.json')
            require(central['status'] == 'running' and central['expected_head'] == imp.head(REPO), 'Central is not at a saved active checkpoint')
            accepted818_guard(central)
            record['lanes'] = lane_preflight(central)
            # Fetch only the fixed reviewed object; no checkout, merge, or policy replacement.
            for revision in (SOURCE, SOURCE964):
                git('fetch', '--no-tags', 'origin', revision)
                require(git('rev-parse', revision+'^{commit}') == revision, 'Source revision mismatch')
            payload = {p: imp.blob(REPO, pins['document_sources'][p], p) for p in ALLOWLIST}
            payload_valid(payload)
            require(all(p not in imp.tree(REPO, imp.head(REPO)) for p in ALLOWLIST), 'Review path already exists centrally')
            latest = read(STATE/'progress.json')
            require(latest['status'] == 'running' and latest['expected_head'] == imp.head(REPO), 'Central checkpoint changed inconsistently')
            require(all(pid not in latest['problems'] and not any(r['problem_id'] == pid for r in latest['runs']) for pid in IDS), 'Central started a reserved ID')
            accepted818_guard(latest)
            central_pid = int((STATE/'runner.pid').read_text())
            require(set(workers(processes())) == {central_pid}, 'Expected one central runner after lanes exited')
            current = latest.get('current') or {}
            active = next((r for r in latest['runs'] if r['id'] == current.get('run_id')), None)
            require(active is not None and active['status'] == 'running' and {e.get('type') for e in fresh_events(active)} == {'thread.started', 'turn.started'} and native_children(processes(), central_pid), 'Fresh active central stage is not evidenced')
            record['pre_stop_resume_plan'] = resume_plan(latest, read(STATE/'releases.json'), incoming=IDS)
            stop = {'owner': OWNER, 'created_at': imp.now(), 'reason': 'Finish current stage; import accepted 960/964, adopt three fixed request docs, reopen 818 and 964 normally, push and resume every20/max6.', 'lane_ids': list(IDS)}
            save(STATE/'STOP', stop, exclusive=True)
            stop_raw = (STATE/'STOP').read_bytes()
            record.update(status='waiting-for-boundary', stop=stop, central_before_stop={'head': latest['expected_head'], 'current': latest['current']})
            save(RECEIPT, record)
            deadline = time.monotonic()+6000
            while (Path('/proc')/str(central_pid)).exists():
                owned_stop(stop_raw)
                require(read(STATE/'progress.json')['status'] != 'failed', 'Central failed before ordinary boundary')
                require(time.monotonic() < deadline, 'Boundary wait exceeded stage budget; preserve STOP')
                time.sleep(5)
            boundary_guard()
            require(git('branch', '--show-current') == 'codex/all-hard-20261018', 'Central branch changed before import')
            baseline = imp.validate_checkout(REPO, STATE)
            require(baseline['status'] == 'stopped', 'Central did not stop cleanly')
            accepted818_guard(baseline)
            ledger_raw = (STATE/'releases.json').read_bytes()
            record['boundary_resume_plan'] = resume_plan(baseline, json.loads(ledger_raw), incoming=IDS)
            record.update(status='importing-old-policy', boundary_head=baseline['expected_head'], imports=[], ledger_sha256=sha(ledger_raw))
            save(RECEIPT, record)
            with (STATE/'release.lock').open('a') as release:
                fcntl.flock(release, fcntl.LOCK_EX | fcntl.LOCK_NB)
                for pid in IDS:
                    owned_stop(stop_raw)
                    require(not workers(processes()), 'Campaign runner appeared during import')
                    repo, directory = lane_paths(pid)
                    lane = read(directory/'progress.json')
                    frozen = next(x for x in record['lanes'] if x['id'] == pid)
                    require(imp.head(repo) == frozen['lane_head'] and lane['problems'][pid]['candidate'] == frozen['candidate'], 'Lane changed after preflight')
                    hashes_unchanged()
                    boundary_guard()
                    imported = imp.import_lane(REPO, STATE, repo, directory, pid)
                    record['imports'].append(imported)
                    save(RECEIPT, record)
                    after = read(STATE/'progress.json')
                    require(after['problems'][pid] == lane['problems'][pid], 'Imported acceptance changed')
                    reservation_path = STATE/f'lane-{pid}-reservation.json'
                    reservation = read(reservation_path)
                    require(reservation['status'] == 'started' and reservation['repo'] == str(repo), 'Reservation changed')
                    reservation.update(status='imported', imported_head=imported['merged_head'], import_receipt=after['lane_imports'][-1]['receipt'])
                    save(reservation_path, reservation)
                with imp.ownership(REPO, STATE):
                    after = imp.validate_checkout(REPO, STATE)
                    import_metadata_preserved(baseline, after)
                    require(after['runs'][:len(baseline['runs'])] == baseline['runs'] and after['queue'] == baseline['queue'], 'Prior runs/queue changed')
                    require((STATE/'releases.json').read_bytes() == ledger_raw, 'Import changed release ledger')
                    record['post_import_resume_plan'] = resume_plan(after, json.loads(ledger_raw))
                    record.update(status='adopting-policy', prior_problems_preserved=True, prior_runs_preserved=True, queue_preserved=True)
                    save(RECEIPT, record)
                    after = adopt_and_reopen(payload, record, stop_raw)
                    final_head = after['expected_head']
                    require(git('branch', '--show-current') == 'codex/all-hard-20261018', 'Unexpected central branch')
                    git('push', 'origin', final_head+':refs/heads/codex/all-hard-20261018')
                    require(git('ls-remote', 'origin', 'refs/heads/codex/all-hard-20261018').split()[0] == final_head, 'Exact pushed head not confirmed')
                    record.update(status='pushed-still-stopped', final_head=final_head)
                    save(RECEIPT, record)
            owned_stop(stop_raw)
            hashes_unchanged()
            boundary_guard()
            require(read(STATE/'progress.json') == after and imp.head(REPO) == final_head and not imp.changed_paths(REPO), 'Checkpoint changed before resume')
            old_ids = {r['id'] for r in after['runs']}
            old_sessions = {sid for r in after['runs'] for sid in r.get('session_ids', [])}
            plan = resume_plan(after, json.loads(ledger_raw))
            expected_next = plan['next_problem_id']
            record['resume_plan'] = plan
            save(RECEIPT, record)
            (STATE/'STOP').unlink()
            launched = json.loads(subprocess.check_output([sys.executable, str(STATE/'launch.py'), '--continuous', '--max-rounds', '6'], cwd=REPO, text=True))
            record.update(status='resumed-awaiting-fresh-agent', launch=launched)
            save(RECEIPT, record)
            require(launched['continuous'] and launched['queue_count'] == len(after['queue']), 'Launch selection changed')
            evidence = None
            for _ in range(120):
                procs = processes()
                require(launched['pid'] in procs, 'Resumed runner exited')
                resumed = read(STATE/'progress.json')
                evidence = new_run_evidence(resumed, old_ids, old_sessions, expected_next, procs, launched['pid'])
                if evidence:
                    break
                time.sleep(.5)
            require(evidence is not None, 'Fresh run/thread/turn/native child not observed; do not claim resume success')
            fresh_run = next(r for r in resumed['runs'] if r['id'] == evidence['current']['run_id'])
            record['ordinary_registration_proof'] = verify_registered_resume(after, resumed, final_head, plan, fresh_run)
            live = workers(processes())
            require(set(live) == {launched['pid']}, 'Expected exactly one campaign runner')
            for flag, value in [('--publish-every','20'),('--max-rounds','6'),('--state-dir',str(STATE))]:
                args = live[launched['pid']]['args']
                require(args.count(flag)==1 and args[args.index(flag)+1]==value, 'Runner flags changed')
            require(all(resumed['problems'][pid] == after['problems'][pid] for pid in IDS), 'Resume changed imported acceptance')
            require(resumed['queue'] == after['queue'] and (STATE/'releases.json').read_bytes() == ledger_raw, 'Resume changed queue/release ledger')
            require(not (STATE/'STOP').exists(), 'STOP appeared during observation')
            agent_head = record['ordinary_registration_proof']['agent_candidate']
            if agent_head != final_head:
                git('push', 'origin', agent_head+':refs/heads/codex/all-hard-20261018')
            require(git('ls-remote', 'origin', 'refs/heads/codex/all-hard-20261018').split()[0] == agent_head, 'Exact post-registration push not confirmed')
            record['pushed_head'] = agent_head
            hashes_unchanged()
            record.update(status='completed-resumed', completed_at=imp.now(), fresh_resume=evidence, stop_removed=True, release_ledger_preserved=True)
            save(RECEIPT, record)
            print(json.dumps(record), flush=True)
        except BaseException as error:
            if stop_raw is not None and not (STATE/'STOP').exists():
                save(STATE/'STOP', json.loads(stop_raw), exclusive=True)
            record.update(status='failed-inspect-no-retry', error=str(error) or type(error).__name__, failed_at=imp.now(), owned_stop_present=stop_raw is not None and (STATE/'STOP').exists() and (STATE/'STOP').read_bytes()==stop_raw, recovery='Inspect receipt, saved/actual HEAD, importer receipts and STOP owner. Do not reset, relaunch, revert acceptance, or retry this operator. No active agent was signaled.')
            save(RECEIPT, record)
            raise


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dispatch', required=True)
    parser.add_argument('--pins', type=Path, default=Path(__file__).with_name('pins.json'))
    args = parser.parse_args(argv)
    require(args.dispatch == DISPATCH, 'Explicit independent-reviewed root dispatch required')
    global pins
    data = args.pins.read_bytes()
    require(sha(data) == PINS_SHA, 'Pins differ from independently reviewed bytes')
    pins = json.loads(data)
    require(pins['source'] == SOURCE and pins['ids'] == list(IDS) and pins['reopen_ids'] == list(REOPEN_IDS), 'Pinned scope mismatch')
    require(pins['document_sources'] == {p: (SOURCE964 if p == REQUESTS['964'] else SOURCE) for p in ALLOWLIST}, 'Document source mapping differs')
    require({pid: item['path'] for pid, item in pins['requests'].items()} == REQUESTS, 'Request mapping differs')
    os.environ.update(PATH='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin', NODE_PATH='/home/songyy/projects/integ-games/node_modules', PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome', PYTHONDONTWRITEBYTECODE='1')
    sys.path.insert(0, str(REPO/'scripts'))
    hashes_unchanged()  # Validate importer bytes before importing its Python module.
    global imp
    import import_leetcode_lane as imp
    def interrupted(signum, _frame):
        raise KeyboardInterrupt(f'Signal {signum}; no agent was signaled')
    signal.signal(signal.SIGTERM, interrupted)
    execute()


if __name__ == '__main__':
    main()

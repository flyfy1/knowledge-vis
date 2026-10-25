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
OWNER = 'import968972-search818-stage-a-20261026-4b7e902d'
HANDOFF_OWNER = OWNER + '-author-to-mac'
DISPATCH = 'root-reviewed-import968972-search818-stage-a-20261026'
SOURCE = 'a1d48550f44a65bc936de1706642a1b9ad858afd'
IDS = ('968', '972')
REOPEN_IDS = ('818',)
REQUESTS = {'818': 'specs/reviews/818-review-search-alternative-request-20261026.md'}
ALLOWLIST = ('specs/reviews/818-review-search-alternative-design-20261026.md', REQUESTS['818'])
PINS_SHA = 'd56628ded5a693e10762ef8e99595eff5bcbf04832bea6094aa94622c1db1540'
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
    require(entry['status'] == 'blocked' and entry['phase'] == 'done' and 0 < entry['rounds'] < 6 and entry['rounds'] == len(entry['reviews']), '818 acceptance/budget incompatible')
    require(canonical([r for r in state['runs'] if r['problem_id'] == '818']) == frozen['runs_sha256'], 'Historical 818 runs changed')
    require(git('rev-parse', 'HEAD:leetcode/818') == frozen['lesson_git_tree'], '818 lesson tree changed')
    require(sha((REPO/entry['reviews'][-1]['report_path']).read_bytes()) == frozen['report_sha256'], '818 historical review changed')
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
        require(entry['status'] == 'blocked' and entry['phase'] == 'done', 'Only pinned blocked 818 may reopen')
        require(0 < entry['rounds'] < 6 and entry['rounds'] == len(entry['reviews']), 'Retain review budget')
        for key in ('detail',):
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
    require((STATE/'STOP').read_bytes() == raw and json.loads(raw)['owner'] in (OWNER, HANDOFF_OWNER), 'STOP ownership/content changed')


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
    old_head, old_tree = before['expected_head'], imp.tree(REPO, before['expected_head'])
    require(not set(ALLOWLIST) & set(old_tree), 'Request already tracked')
    ledger_raw, progress_raw = (STATE/'releases.json').read_bytes(), (STATE/'progress.json').read_bytes()
    backup = STATE/(OWNER+'-before-reopen.json')
    save(backup, before, exclusive=True)
    maintenance = {'kind': 'reopen-blocked-818-search', 'request_id': '818-SEARCH-R1', 'supersedes_algorithm_choice': '818-RESOURCE-R1 distance-DP (proof unresolved)', 'at': imp.now(), 'document_sources': pins['document_sources'], 'before': old_head, 'backup': str(backup), 'previous_current': copy.deepcopy(before.get('current')), 'prior_blocked_entry': copy.deepcopy(before['problems']['818'])}
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
    git('commit', '-m', 'Prepare ordinary LeetCode 818 search revision and external measurement handoff\n\nAdopt two reviewed request documents after independent lane imports. Preserve prior acceptance and all review/run history; blocked DP investigation retained; no runtime improvement or new acceptance claimed.\n\nRequest-Source: '+SOURCE+'\nBuilt-By: guarded one-off import and revision operator\nVerified-By: independently reviewed request and transition; fresh lesson review remains required')
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


def fresh_fix_record(state, old_ids):
    current = state.get('current') or {}
    require(state['status'] == 'running', 'Runner not active while arming author handoff')
    if current.get('run_id') in old_ids or not current.get('run_id'):
        return None
    require(current.get('problem_id') == '818' and current.get('stage') == 'fix', 'Missed required 818 fix boundary; no review may start')
    run = next((r for r in state['runs'] if r['id'] == current['run_id']), None)
    require(run and run['status'] == 'running' and run['role'] == 'fix' and run['problem_id'] == '818', 'Fresh 818 fix already finished before STOP arm')
    require([r['id'] for r in state['runs'] if r['id'] not in old_ids] == [run['id']], 'Additional agent started before STOP arm')
    return run


def author_boundary_state(before_fix, stopped, run_id, frozen_head):
    require(stopped['status'] == 'stopped', 'Author did not reach ordinary stopped boundary')
    require(stopped['current'] == before_fix['current'], 'Current stage changed; possible premature review')
    require(len(stopped['runs']) == len(before_fix['runs']) and stopped['runs'][:-1] == before_fix['runs'][:-1], 'New review or unrelated run appeared')
    old_run, run = before_fix['runs'][-1], stopped['runs'][-1]
    require(run['id'] == old_run['id'] == run_id and run['role'] == 'fix' and run['problem_id'] == '818', 'Wrong author run at handoff')
    require(run['status'] == 'completed' and run.get('result', {}).get('outcome') == 'ready', 'Author blocked/failed; no measurement handoff')
    natural_run = {'status', 'finished_at', 'result', 'session_ids'}
    require({k:v for k,v in run.items() if k not in natural_run} == {k:v for k,v in old_run.items() if k not in natural_run}, 'Author run identity changed')
    expected = copy.deepcopy(before_fix)
    expected['status'] = 'stopped'
    expected['expected_head'] = frozen_head
    expected['updated_at'] = stopped.get('updated_at')
    expected['runs'][-1] = copy.deepcopy(run)
    entry = expected['problems']['818']
    entry['author_runs'].append(run_id)
    entry.update(candidate=frozen_head, phase='review', status='review_pending')
    require(stopped == expected, 'Unexpected metadata/history delta at author boundary')
    return run


def freeze_author(before_fix, stopped, evidence, record, stop_raw):
    from leetcode_campaign import allowed_path, validate_result
    frozen_head = imp.head(REPO)
    run = author_boundary_state(before_fix, stopped, evidence['current']['run_id'], frozen_head)
    require(run['session_ids'] == [evidence['session_id']], 'Completed author session differs from fresh proof')
    directory = Path(run['directory'])
    require(directory.resolve() == (STATE/'runs'/run['id']).resolve(), 'Author evidence directory differs')
    require(validate_result(read(directory/'final.json'), review=False) == run['result'], 'Author final result differs')
    events = [json.loads(line) for line in (directory/'events.jsonl').read_text().splitlines()]
    require(not any(e.get('type') in ('error','turn.failed') for e in events), 'Author events contain failure')
    require(frozen_head != run['candidate'] and git('rev-list','--parents','-n','1',frozen_head).split()[1:] == [run['candidate']], 'Author commit ancestry differs')
    changed = set(git('diff','--name-only',run['candidate'],frozen_head).splitlines())
    require(changed and all(allowed_path(path,'818') for path in changed), 'Author changed unrelated paths')
    message = git('show','-s','--format=%B',frozen_head).splitlines()
    require(message[0] == 'Develop LeetCode 818 candidate pending independent review' and 'Campaign-Status: review_pending' in message and 'Author-Run: '+run['id'] in message, 'Author commit provenance differs')
    source = imp.blob(REPO,frozen_head,'leetcode/818/solution.py')
    require(source == (REPO/'leetcode/818/solution.py').read_bytes(), 'Canonical bytes differ from committed candidate')
    require(sha(source) != pins['accepted818']['runtime_sha256']['solution.py'], 'Canonical source unchanged from old BFS; refuse high-cost measurement')
    require((STATE/'releases.json').read_bytes() == record['_ledger_raw'], 'Ledger changed before Mac handoff')
    owned_stop(stop_raw)
    backup = STATE/(OWNER+'-waiting-for-mac-state.json')
    save(backup,stopped,exclusive=True)
    git('push','origin',frozen_head+':refs/heads/codex/all-hard-20261018')
    require(git('ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0] == frozen_head, 'Frozen author head push not verified')
    return {'author_run_id':run['id'],'candidate':frozen_head,'lesson_tree':git('rev-parse',frozen_head+':leetcode/818'),'source_path':'leetcode/818/solution.py','source_sha256':sha(source),'source_bytes':len(source),'state_backup':str(backup),'state_sha256':sha((STATE/'progress.json').read_bytes()),'zero_new_818_reviews':True,'expected_measurement_report':'specs/reviews/818-review-search-resource-measurement-20261026.md','pushed_head':frozen_head}


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
            for revision in (SOURCE,):
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
            stop = {'owner': OWNER, 'created_at': imp.now(), 'reason': 'Finish current stage; import accepted 968/972, adopt two fixed search docs, reopen blocked818, then arm a second STOP during its fresh fix for Mac handoff.', 'lane_ids': list(IDS)}
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
            require(expected_next == '818' and after['problems']['818']['phase'] == 'fix', 'Next ordinary agent is not the required 818 fix; preserve STOP')
            record['resume_plan'] = plan
            save(RECEIPT, record)
            (STATE/'STOP').unlink()
            launched = json.loads(subprocess.check_output([sys.executable, str(STATE/'launch.py'), '--continuous', '--max-rounds', '6'], cwd=REPO, text=True))
            record.update(status='resumed-awaiting-fresh-agent', launch=launched)
            save(RECEIPT, record)
            require(launched['continuous'] and launched['queue_count'] == len(after['queue']), 'Launch selection changed')
            evidence, armed_run = None, None
            for _ in range(600):
                procs = processes()
                require(launched['pid'] in procs, 'Resumed runner exited before handoff arm')
                resumed = read(STATE/'progress.json')
                observed = fresh_fix_record(resumed, old_ids)
                if observed is not None and armed_run is None:
                    # Arm at the first persisted fix record, before waiting for native proof.
                    handoff_stop = {'owner':HANDOFF_OWNER,'transaction':OWNER,'created_at':imp.now(),'reason':'Finish this fresh 818 fix only; stop before independent review for immutable Mac measurement. Do not remove until reviewed Stage B.','run_id':observed['id']}
                    save(STATE/'STOP',handoff_stop,exclusive=True)
                    stop_raw = (STATE/'STOP').read_bytes()
                    armed_run = observed['id']
                    record.update(status='author-stop-written-awaiting-native-proof',handoff_stop=handoff_stop)
                    save(RECEIPT,record)
                    resumed = read(STATE/'progress.json')
                    require(fresh_fix_record(resumed,old_ids)['id'] == armed_run, 'Author completed or stage changed while arming STOP')
                if armed_run:
                    owned_stop(stop_raw)
                    evidence = new_run_evidence(resumed, old_ids, old_sessions, expected_next, procs, launched['pid'])
                    if evidence:
                        require(evidence['current']['run_id'] == armed_run and evidence['current']['stage'] == 'fix', 'Wrong fresh native stage')
                        break
                time.sleep(.1)
            require(evidence is not None and armed_run, 'Fresh fix/thread/turn/native child not proven while STOP armed')
            resumed = read(STATE/'progress.json')
            require(fresh_fix_record(resumed,old_ids)['id'] == armed_run, 'Author already left fix before armed proof')
            fresh_run = next(r for r in resumed['runs'] if r['id'] == armed_run)
            record['ordinary_registration_proof'] = verify_registered_resume(after,resumed,final_head,plan,fresh_run)
            live = workers(processes())
            require(set(live) == {launched['pid']}, 'Expected one central worker')
            for flag,value in [('--publish-every','20'),('--max-rounds','6'),('--state-dir',str(STATE))]:
                args = live[launched['pid']]['args']
                require(args.count(flag)==1 and args[args.index(flag)+1]==value, 'Runner flags changed')
            require((STATE/'releases.json').read_bytes() == ledger_raw, 'Startup changed ledger')
            agent_head = record['ordinary_registration_proof']['agent_candidate']
            if agent_head != final_head:
                git('push','origin',agent_head+':refs/heads/codex/all-hard-20261018')
            require(git('ls-remote','origin','refs/heads/codex/all-hard-20261018').split()[0] == agent_head,'Exact registration head push not verified')
            record.update(status='author-running-stop-armed',fresh_author=evidence,pre_author_head=agent_head,pushed_head=agent_head,zero_new_818_reviews=True)
            save(RECEIPT,record)
            before_fix = copy.deepcopy(resumed)
            deadline = time.monotonic()+6000
            while (Path('/proc')/str(launched['pid'])).exists():
                owned_stop(stop_raw)
                current = read(STATE/'progress.json')
                require(len(current['runs']) == len(before_fix['runs']), 'New reviewer or extra agent started; missed boundary')
                require(current['status'] != 'failed', 'Author runner failed before measurement boundary')
                require(time.monotonic()<deadline,'Author wait exceeded budget; preserve owned STOP')
                time.sleep(5)
            boundary_guard()
            with (STATE/'release.lock').open('a') as release, imp.ownership(REPO,STATE):
                fcntl.flock(release,fcntl.LOCK_EX|fcntl.LOCK_NB)
                stopped = imp.validate_checkout(REPO,STATE)
                hashes_unchanged();owned_stop(stop_raw)
                require((STATE/'releases.json').read_bytes()==ledger_raw,'Ledger changed during author stage')
                # Bytes kept only in this local call, never serialized into the receipt.
                check_record = dict(record, _ledger_raw=ledger_raw)
                frozen = freeze_author(before_fix,stopped,evidence,check_record,stop_raw)
                record.update(status='waiting-for-Mac',stage_a_complete=True,completed_at=imp.now(),frozen_author=frozen,release_ledger_preserved=True,owned_stop_present=True,recovery='Root must copy the exact committed canonical source to Mac and run the reviewed measurement harness. Keep author-to-Mac STOP. No Stage B evidence adoption, fresh review, or acceptance is performed here.')
                save(RECEIPT,record)
            print(json.dumps(record),flush=True)
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
    require(pins['document_sources'] == {p: SOURCE for p in ALLOWLIST}, 'Document source mapping differs')
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

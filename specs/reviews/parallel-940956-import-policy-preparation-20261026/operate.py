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
OWNER = 'campaign-runner-import940956-policy-20261026-2fb1c8d0'
DISPATCH = 'root-reviewed-import940956-policy-20261026'
SOURCE = '3116c71722cf4db1e2c12a7453902a6fd748b314'
IDS = ('940', '956')
SPEC = 'specs/leetcode-explainers.md'
REPORT = 'specs/reviews/leetcode-baseline-syntax-spec-review-20261026.md'
AUTHOR = 'scripts/campaign-prompts/author.md'
WORKFLOW_REPORT = 'specs/reviews/leetcode-workflow-copy-spec-review-20261026.md'
NEW_REPORTS = (REPORT, WORKFLOW_REPORT)
ALLOWLIST = (SPEC, AUTHOR, *NEW_REPORTS)
OLD_SPEC = '6d4cc609772cb6c6382148568107a0ffd8b6c40cbbf4af473f2519ab364a2945'
OLD_HASHES = {SPEC: OLD_SPEC, AUTHOR: '036b88a5740ac4e81f357904e069e6daa782983f40c5d4db08e30599255ee6dd'}
PAYLOAD_HASHES = {
    SPEC: '7fe59194a1ab1eb838a865a6cefcfbd98d527fe7657d1614c959b73c86dc404e',
    AUTHOR: '5f7feaa56f9f8f1f3f434e1fe4576cc2a10da21594c9aef829cab86e69dae06b',
    WORKFLOW_REPORT: 'e1ead272a7b986d24117f00c750e65943cfe3b0b8b243ad9a5fe30e2c355da29',
    REPORT: 'a8d04609ccb62cf79d947210156ac99c64f23e5ab3da717c5cdc513f3d7314b1',
}
RUNTIME_HASHES = {
    'scripts/import_leetcode_lane.py': '8642a573383d052ce6e227bd8c2374f9c50f2fc1e8e9b312a6186607015344e0',
    'scripts/leetcode_campaign.py': 'a1258a0e7eba60e1d813bf0f9ede57a71f92cd504f6afb7bd0553d68d41c65ed',
}
LAUNCHER_HASH = '94056740463e5f9ec4fe63d0d2c56d1ccbf1ab60556f7952580fe58512127e70'
RECEIPT = STATE / (OWNER + '.json')
imp = None


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



def hashes_unchanged():
    for path, digest in RUNTIME_HASHES.items():
        require(sha((REPO/path).read_bytes()) == digest, 'Runtime changed: ' + path)
    require(sha((STATE/'launch.py').read_bytes()) == LAUNCHER_HASH, 'External launcher changed')


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


def policy_bytes_valid(old, payload):
    require(set(old) == set(OLD_HASHES), 'Old policy file set differs')
    for path, digest in OLD_HASHES.items():
        require(sha(old[path]) == digest, 'Old policy differs from frozen lanes: ' + path)
    require(set(payload) == set(ALLOWLIST), 'Policy payload allowlist mismatch')
    for path in ALLOWLIST:
        require(sha(payload[path]) == PAYLOAD_HASHES[path], 'Reviewed payload hash mismatch: ' + path)


def policy_tree_valid(before, after):
    changed = {p for p in before.keys() | after.keys() if before.get(p) != after.get(p)}
    require(changed == set(ALLOWLIST), 'Policy commit changed unexpected paths')
    require(all(p not in before for p in NEW_REPORTS), 'Existing review record must not be overwritten')
    require(all(after[p].split()[0] == '100644' for p in ALLOWLIST), 'Policy payload file mode differs')


def expected_head_only(before, after, head):
    expected = copy.deepcopy(before)
    expected['expected_head'] = head
    require(after == expected, 'Policy adoption changed ordinary campaign metadata')


def resume_plan(state, ledger, incoming=()):
    """Predict only the normal runner's registration prefix before its next agent."""
    from leetcode_campaign import TERMINAL
    require(ledger['pending'] is None, 'Pending release requires inspection')
    registrations = []
    next_problem = None
    for pid in state['queue']:
        entry = state['problems'].get(pid, {})
        if entry.get('status') in TERMINAL:
            continue
        if entry.get('phase') == 'register':
            require(entry.get('status') == 'review_passed', 'Unexpected pending registration status')
            registrations.append(pid)
            continue
        next_problem = pid
        break
    require(next_problem is not None, 'No next agent stage; terminal queue requires separate normal completion')
    require(not set(incoming) & set(state['problems']), 'Incoming lane already present')
    pending = sum(v['status'] == 'accepted_local' for v in state['problems'].values()) - len(ledger['released']) + len(incoming) + len(registrations)
    require(pending < 20, 'Resume would reach publication threshold after deterministic registration')
    return {'next_problem_id': next_problem, 'registration_ids': registrations, 'projected_pending': pending}


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
            require(entry['status'] == 'accepted_local' and entry['phase'] == 'done', 'Lane not independently accepted')
            runs = imp.validate_runs(lane, directory, pid, central)
            registry = {str(r['id']): r for r in read_registry(repo/'leetcode/problems.config.js')}
            _reviewed(repo, lane, registry, imp.head(repo), {pid})
            imp.same_shared(REPO, imp.head(REPO), entry['candidate'])
            imp.same_shared(REPO, imp.head(REPO), imp.head(repo))
            reservation = read(STATE/f'lane-{pid}-reservation.json')
            require(reservation['status'] == 'started' and reservation['repo'] == str(repo) and reservation['state_dir'] == str(directory), 'Reservation mismatch')
            result.append({'id': pid, 'lane_head': imp.head(repo), 'candidate': entry['candidate'], 'score': entry['reviews'][-1]['weighted_score'], 'required_open': entry['reviews'][-1]['required_open'], 'run_ids': [r['id'] for r in runs]})
    return result


def adopt_policy(payload, record, stop_raw):
    """Called only after both old-policy imports, under release and central locks."""
    before = imp.validate_checkout(REPO, STATE)
    require(before['status'] == 'stopped', 'Policy adoption requires stopped state')
    owned_stop(stop_raw)
    hashes_unchanged()
    old_head = before['expected_head']
    old_tree = imp.tree(REPO, old_head)
    require(all(p not in old_tree for p in NEW_REPORTS), 'Review record already exists')
    policy_bytes_valid({p: (REPO/p).read_bytes() for p in OLD_HASHES}, payload)
    ledger_raw = (STATE/'releases.json').read_bytes()
    progress_raw = (STATE/'progress.json').read_bytes()
    record['policy_before'] = {'head': old_head, 'progress_sha256': sha(progress_raw), 'ledger_sha256': sha(ledger_raw)}
    save(RECEIPT, record)
    for path in ALLOWLIST:
        target = REPO/path
        require(not target.is_symlink(), 'Refusing policy symlink')
        if path in NEW_REPORTS:
            with target.open('xb') as out:
                out.write(payload[path])
        else:
            target.write_bytes(payload[path])
        target.chmod(0o644)
    require(imp.changed_paths(REPO) == set(ALLOWLIST), 'Unexpected policy worktree changes')
    git('diff', '--check')
    git('add', '--', *ALLOWLIST)
    require(set(git('diff', '--cached', '--name-only').splitlines()) == set(ALLOWLIST), 'Unexpected staged files')
    require((STATE/'progress.json').read_bytes() == progress_raw, 'State changed during policy preparation')
    owned_stop(stop_raw)
    git('commit', '-m', 'Clarify baseline teaching and learner workflow copy\n\nAdopt reviewed prospective author guidance after independent lane imports. Existing acceptance and rubric remain unchanged.\n\nPolicy-Source: '+SOURCE+'\nBuilt-By: guarded policy adoption operator\nVerified-By: independent wording reviews recorded in '+REPORT+' and '+WORKFLOW_REPORT)
    head = git('rev-parse', 'HEAD')
    require(git('rev-list', '--parents', '-n', '1', head).split()[1:] == [old_head], 'Unexpected policy commit parents')
    policy_tree_valid(old_tree, imp.tree(REPO, head))
    require(not imp.changed_paths(REPO), 'Policy commit left dirty files')
    for path in ALLOWLIST:
        require(imp.blob(REPO, head, path) == payload[path], 'Committed policy bytes differ')
    hashes_unchanged()
    require((STATE/'progress.json').read_bytes() == progress_raw and (STATE/'releases.json').read_bytes() == ledger_raw, 'Ordinary metadata changed before checkpoint')
    after = copy.deepcopy(before)
    after['expected_head'] = head
    expected_head_only(before, after, head)
    save(STATE/'progress.json', after)
    expected_head_only(before, read(STATE/'progress.json'), head)
    record['policy_after'] = {'head': head, 'progress_sha256': sha((STATE/'progress.json').read_bytes()), 'only_expected_head_changed': True, 'ledger_preserved': (STATE/'releases.json').read_bytes() == ledger_raw, 'changed_paths': list(ALLOWLIST)}
    save(RECEIPT, record)
    return after


def execute():
    require(not RECEIPT.exists(), 'Existing transaction receipt: inspect; no blind retry')
    record = {'owner': OWNER, 'status': 'preflight', 'source': SOURCE, 'created_at': imp.now()}
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
            record['lanes'] = lane_preflight(central)
            # Fetch only the fixed reviewed object; no checkout, merge, or policy replacement.
            git('fetch', '--no-tags', 'origin', SOURCE)
            require(git('rev-parse', SOURCE+'^{commit}') == SOURCE, 'Source revision mismatch')
            payload = {p: imp.blob(REPO, SOURCE, p) for p in ALLOWLIST}
            policy_bytes_valid({p: (REPO/p).read_bytes() for p in OLD_HASHES}, payload)
            require(all(p not in imp.tree(REPO, imp.head(REPO)) for p in NEW_REPORTS), 'Review path already exists centrally')
            latest = read(STATE/'progress.json')
            require(latest['status'] == 'running' and latest['expected_head'] == imp.head(REPO), 'Central checkpoint changed inconsistently')
            require(all(pid not in latest['problems'] and not any(r['problem_id'] == pid for r in latest['runs']) for pid in IDS), 'Central started a reserved ID')
            central_pid = int((STATE/'runner.pid').read_text())
            require(set(workers(processes())) == {central_pid}, 'Expected one central runner after lanes exited')
            current = latest.get('current') or {}
            active = next((r for r in latest['runs'] if r['id'] == current.get('run_id')), None)
            require(active is not None and active['status'] == 'running' and {e.get('type') for e in fresh_events(active)} == {'thread.started', 'turn.started'} and native_children(processes(), central_pid), 'Fresh active central stage is not evidenced')
            record['pre_stop_resume_plan'] = resume_plan(latest, read(STATE/'releases.json'), incoming=IDS)
            stop = {'owner': OWNER, 'created_at': imp.now(), 'reason': 'Finish current stage; import accepted 940/956 under frozen policy, adopt reviewed four-file guidance, push and resume every20/max6.', 'lane_ids': list(IDS)}
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
            require(not workers(processes()), 'Campaign process remains at boundary')
            require(git('branch', '--show-current') == 'codex/all-hard-20261018', 'Central branch changed before import')
            baseline = imp.validate_checkout(REPO, STATE)
            require(baseline['status'] == 'stopped', 'Central did not stop cleanly')
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
                    require(all(sha((REPO/p).read_bytes()) == digest for p,digest in OLD_HASHES.items()), 'Policy changed before all old-policy imports')
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
                    after = adopt_policy(payload, record, stop_raw)
                    final_head = after['expected_head']
                    require(git('branch', '--show-current') == 'codex/all-hard-20261018', 'Unexpected central branch')
                    git('push', 'origin', 'HEAD:refs/heads/codex/all-hard-20261018')
                    require(git('ls-remote', 'origin', 'refs/heads/codex/all-hard-20261018').split()[0] == final_head, 'Exact pushed head not confirmed')
                    record.update(status='pushed-still-stopped', final_head=final_head)
                    save(RECEIPT, record)
            owned_stop(stop_raw)
            hashes_unchanged()
            require(not workers(processes()), 'Unexpected worker before resume')
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
    args = parser.parse_args(argv)
    require(args.dispatch == DISPATCH, 'Explicit independent-reviewed root dispatch required')
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

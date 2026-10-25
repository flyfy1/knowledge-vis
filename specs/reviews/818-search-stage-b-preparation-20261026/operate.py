"""Prepared Stage B only: adopt pinned Mac evidence, then resume one fresh review."""
import argparse
import copy
import fcntl
import hashlib
import json
import math
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import tempfile
import time

REPO = Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
STATE = Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
STAGE_A_OWNER = 'import968972-search818-stage-a-20261026-4b7e902d'
HANDOFF_OWNER = STAGE_A_OWNER + '-author-to-mac'
OWNER = '818-search-stage-b-20261026-8f614c20'
DISPATCH = 'root-reviewed-818-search-stage-b-20261026'
REPORT = 'specs/reviews/818-review-search-resource-measurement-20261026.md'
HARNESS_SHA = '94a3d9c9567af65c32bdd72bddd3d1eaa167a8e9d901335237a89ba5880a7386'
REQUIRED_POLICY = {'scripts/import_leetcode_lane.py', 'scripts/leetcode_campaign.py',
                   'scripts/leetcode_publish.py', 'scripts/leetcode_registry.py',
                   'scripts/register_leetcode_lesson.py', 'scripts/campaign-prompts/review.md',
                   'specs/leetcode-explainers.md', 'specs/leetcode-review-gates.md',
                   'specs/leetcode-rendered-state-contract.md'}
# No candidate or measurement exists at preparation time. Exact independent
# review must freeze future pins and this operator before enabling dispatch.
REVIEWED_PINS_SHA256 = None
ARTIFACTS = {'canonical.py', 'environment.json', 'survey.jsonl', 'isolated.jsonl',
             'progress.json', 'summary.json', 'binding.json'}
imp = None


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def read(path):
    return json.loads(path.read_bytes())


def save(path, value, exclusive=False):
    data = (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode()
    if exclusive:
        with path.open('xb') as out:
            out.write(data); out.flush(); os.fsync(out.fileno())
    else:
        fd, temporary = tempfile.mkstemp(prefix='.818-stage-b-', dir=path.parent)
        try:
            with os.fdopen(fd, 'wb') as out:
                out.write(data); out.flush(); os.fsync(out.fileno())
            os.replace(temporary, path)
        finally:
            if os.path.exists(temporary): os.unlink(temporary)
    fd = os.open(path.parent, os.O_RDONLY)
    try: os.fsync(fd)
    finally: os.close(fd)


def git(*args):
    return imp.git(REPO, *args)


def payload_paths(pins):
    prefix = pins['evidence_prefix']
    require(re.fullmatch(r'specs/reviews/818-evidence/818-search-mac-20261026-[0-9a-f]{12}/', prefix),
            'Evidence directory is not an exclusive named 818 directory')
    expected = {REPORT} | {prefix + name for name in ARTIFACTS}
    require(set(pins['files']) == expected, 'Evidence/report allowlist differs')
    return expected


def valid_row(row, source_sha):
    require(type(row.get('target')) is int and 1 <= row['target'] <= 10000, 'Invalid measured target')
    require(row.get('status') == 'ok' and type(row.get('answer')) is int and row['answer'] > 0,
            'Unsuccessful canonical execution')
    require(row.get('source_sha256_after') == source_sha, 'Worker source identity differs')
    require(row.get('matches_reference_dp') is True and row['answer'] == row.get('reference_dp_answer'),
            'Numerical reference comparison failed')
    if row['target'] <= 32:
        require(row.get('matches_raw_bfs') is True and row['answer'] == row.get('raw_bfs_answer'),
                'Small independent BFS comparison failed')
    else:
        require(row.get('matches_raw_bfs') is None and row.get('raw_bfs_answer') is None,
                'Unexpected large raw BFS claim')
    require(type(row.get('peak_rss_bytes')) is int and row['peak_rss_bytes'] > 0 and
            row['peak_rss_bytes'] == row.get('peak_rss_raw') and row.get('peak_rss_raw_unit') == 'bytes',
            'Darwin RSS evidence invalid')
    for key in ('call_seconds', 'process_wall_seconds'):
        value = row.get(key)
        require(type(value) in (float, int) and math.isfinite(value) and value >= 0, 'Invalid timing')


def validate_measurements(payload, pins):
    """Validate exact artifacts, not merely a successful summary label."""
    require(set(payload) == payload_paths(pins), 'Payload set differs')
    require(all(sha(data) == pins['files'][path] for path, data in payload.items()), 'Pinned payload changed')
    prefix, source_sha = pins['evidence_prefix'], pins['source_sha256']
    files = {name: payload[prefix + name] for name in ARTIFACTS}
    require(sha(files['canonical.py']) == source_sha, 'Measured canonical source differs')
    env, summary, binding = (json.loads(files[name]) for name in
                             ('environment.json', 'summary.json', 'binding.json'))
    require(env['sys_platform'] == 'darwin' and env['target_range'] == [1, 10000] and
            env['test_only_limited_coverage'] is False and type(env['workers']) is int and env['workers'] in (1, 2),
            'Wrong measurement platform/coverage/concurrency')
    require(env['source_sha256'] == source_sha and env['harness_sha256'] == HARNESS_SHA,
            'Source or reviewed harness identity differs')
    require(summary['status'] == 'passed_full_range' and summary['full_official_range_passed'] is True and
            summary['coverage_count'] == summary['expected_count'] == 10000 and summary['all_targets_recorded'] is True and
            summary['source_immutable'] is True and summary['original_sha256_after'] == summary['frozen_sha256_after'] == source_sha and
            summary['error'] is None and summary['failed_targets'] == [], 'Measurement summary did not pass')
    hashed = ARTIFACTS - {'summary.json', 'binding.json'}
    require(summary['artifact_sha256'] == {name: sha(files[name]) for name in hashed}, 'Measurement artifact hashes differ')
    rows = [json.loads(line) for line in files['survey.jsonl'].splitlines() if line.strip()]
    require(len(rows) == 10000 and {row.get('target') for row in rows} == set(range(1, 10001)),
            'Survey has missing/duplicate targets')
    for row in rows: valid_row(row, source_sha)
    isolated = [json.loads(line) for line in files['isolated.jsonl'].splitlines() if line.strip()]
    required = {9809, 9879, 10000, max(rows, key=lambda r: r['call_seconds'])['target'],
                max(rows, key=lambda r: r['peak_rss_bytes'])['target']}
    require(len(isolated) == len(required) and {row.get('target') for row in isolated} == required and
            summary['isolated_targets'] == [row['target'] for row in isolated], 'Isolated coverage differs')
    for row in isolated: valid_row(row, source_sha)
    progress = json.loads(files['progress.json'])
    require(progress['status'] == 'passed_full_range' and progress['completed'] == 10000 and
            progress['counts'] == {'ok': 10000}, 'Progress artifact is incomplete')
    expected_binding = {'candidate': pins['candidate'], 'lesson_tree': pins['lesson_tree'],
                        'source_sha256': source_sha, 'harness_sha256': HARNESS_SHA,
                        'summary_sha256': sha(files['summary.json']), 'report_path': REPORT,
                        'report_sha256': sha(payload[REPORT]), 'evidence_prefix': prefix}
    require(binding == expected_binding, 'Human report/candidate binding differs')
    report = payload[REPORT].decode('utf-8')
    require(all(value in report for value in (pins['candidate'], source_sha, prefix, HARNESS_SHA)),
            'Report omits its exact candidate/source/evidence/harness identity')
    return {'targets': len(rows), 'isolated_targets': sorted(required),
            'summary_sha256': sha(files['summary.json']), 'source_sha256': source_sha}


def processes():
    result = {}
    for path in Path('/proc').iterdir():
        if not path.name.isdigit(): continue
        try:
            args = [x.decode(errors='replace') for x in (path/'cmdline').read_bytes().split(b'\0') if x]
            status = dict(line.split(':', 1) for line in (path/'status').read_text().splitlines())
            result[int(path.name)] = {'args': args, 'ppid': int(status['PPid']), 'cwd': str((path/'cwd').resolve())}
        except OSError: pass
    return result


def workers(procs):
    return {pid: p for pid, p in procs.items() if any(a.endswith('/scripts/leetcode_campaign.py') for a in p['args'])}


def quiet_checkout():
    procs = processes()
    require(not workers(procs) and not any(pid != os.getpid() and x['cwd'] == str(REPO) for pid, x in procs.items()),
            'Checkout process remains')


def native_children(procs, runner):
    found = []
    for pid, info in procs.items():
        ancestor, seen = info['ppid'], set()
        while ancestor in procs and ancestor not in seen and ancestor != runner:
            seen.add(ancestor); ancestor = procs[ancestor]['ppid']
        if ancestor == runner and info['cwd'] == str(REPO) and info['args'] and '/vendor/' in info['args'][0] and info['args'][0].endswith('/codex'):
            found.append(pid)
    return found


def policy_guard(pins):
    require(REQUIRED_POLICY <= set(pins['policy']), 'Required runtime/policy pins missing')
    for path, digest in pins['policy'].items():
        require(sha((REPO/path).read_bytes()) == digest, 'Policy/runtime changed: ' + path)
    require(sha((STATE/'launch.py').read_bytes()) == pins['launcher_sha256'], 'Launcher changed')


def publication_guard(state, ledger):
    from leetcode_publish import _reviewed
    from leetcode_registry import read_registry
    require(ledger['pending'] is None, 'Pending release requires separate recovery')
    registry = {str(row['id']): row for row in read_registry(REPO/'leetcode/problems.config.js')}
    prospective = {pid for pid, entry in state['problems'].items() if entry['status'] == 'accepted_local' and
                   ledger['released'].get(pid, {}).get('candidate') != entry.get('candidate')}
    accepted = _reviewed(REPO, state, registry, imp.head(REPO), prospective)
    require(not any(ledger['released'].get(pid, {}).get('digest') == item['digest'] for pid, item in accepted.items()),
            'Startup would refresh a same-digest pointer')
    eligible = {pid for pid, item in accepted.items() if ledger['released'].get(pid, {}).get('digest') != item['digest']}
    require(len(eligible) < 20, 'Startup would publish')
    from leetcode_campaign import TERMINAL
    next_id = next(pid for pid in state['queue'] if state['problems'].get(pid, {}).get('status') not in TERMINAL)
    require(next_id == '818' and state['problems']['818']['phase'] == 'review' and
            state['problems']['818']['status'] == 'review_pending', 'Unexpected registration/agent before 818 review')
    return sorted(eligible)


def checkpoint(before, head):
    after = copy.deepcopy(before)
    after['expected_head'] = head
    return after


def review_proof(before, live, runner, procs):
    current = live.get('current') or {}
    old_ids = {run['id'] for run in before['runs']}
    if live['status'] != 'running' or current.get('problem_id') != '818' or current.get('stage') != 'review' or current.get('run_id') in old_ids:
        return None
    added = live['runs'][len(before['runs']):]
    require(live['runs'][:len(before['runs'])] == before['runs'] and len(added) == 1, 'Historical/extra run change')
    run = added[0]
    require(run['id'] == current['run_id'] and run['role'] == 'review' and run['problem_id'] == '818' and
            run['status'] == 'running' and run['candidate'] == before['expected_head'], 'Wrong fresh reviewer identity')
    expected = copy.deepcopy(before)
    expected['status'] = 'running'; expected.pop('error', None)
    expected.update(updated_at=live.get('updated_at'), current=current, runs=live['runs'])
    expected['problems']['818']['candidate'] = before['expected_head']
    require(live == expected, 'Resume changed ordinary history/queue/problem metadata')
    directory = Path(run['directory'])
    require(directory.resolve() == (STATE/'runs'/run['id']).resolve(), 'Reviewer evidence directory differs')
    events = []
    if (directory/'events.jsonl').exists():
        for line in (directory/'events.jsonl').read_text().splitlines():
            try: events.append(json.loads(line))
            except ValueError: continue
    require(not any(e.get('type') in ('error', 'turn.failed') for e in events), 'Fresh reviewer reports failure')
    threads = [e.get('thread_id') for e in events if e.get('type') == 'thread.started']
    previous = {sid for r in before['runs'] for sid in r.get('session_ids', [])}
    native = native_children(procs, runner)
    if not threads or not any(e.get('type') == 'turn.started' for e in events) or not native: return None
    require(len(threads) == 1 and threads[0] and threads[0] not in previous, 'Reused/multiple reviewer session')
    require(set(workers(procs)) == {runner}, 'Expected one central worker')
    args = procs[runner]['args']
    for flag, value in [('--publish-every', '20'), ('--max-rounds', '6'), ('--state-dir', str(STATE))]:
        require(args.count(flag) == 1 and args[args.index(flag)+1] == value, 'Launch flags differ')
    return {'run_id': run['id'], 'candidate': run['candidate'], 'session_id': threads[0], 'native_codex_pids': native}


def execute(pins):
    receipt = STATE/(OWNER+'.json')
    require(not receipt.exists(), 'Existing receipt: inspect, do not retry')
    stop_raw = None
    record = {'owner': OWNER, 'status': 'preflight', 'created_at': imp.now()}
    with (STATE/(OWNER+'.lock')).open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        save(receipt, record, exclusive=True)
        try:
            with (STATE/'release.lock').open('a') as release, imp.ownership(REPO, STATE):
                fcntl.flock(release, fcntl.LOCK_EX | fcntl.LOCK_NB)
                policy_guard(pins)
                quiet_checkout()
                require(git('branch', '--show-current') == 'codex/all-hard-20261018', 'Wrong central branch')
                a_raw = (STATE/(STAGE_A_OWNER+'.json')).read_bytes()
                require(sha(a_raw) == pins['stage_a_receipt_sha256'], 'Stage A receipt changed')
                stage_a = json.loads(a_raw); frozen = stage_a['frozen_author']
                require(stage_a['status'] == 'waiting-for-Mac' and stage_a['stage_a_complete'] is True and
                        stage_a['owned_stop_present'] is True and frozen['zero_new_818_reviews'] is True, 'Stage A is not successful')
                require(all(frozen[key] == pins[key] for key in ('candidate', 'lesson_tree', 'source_sha256')), 'Frozen Stage A identity differs')
                observed_stop = (STATE/'STOP').read_bytes(); stop = json.loads(observed_stop)
                require(sha(observed_stop) == pins['stop_sha256'] and stop['owner'] == HANDOFF_OWNER and
                        stop['transaction'] == STAGE_A_OWNER and stop['run_id'] == frozen['author_run_id'], 'Owned handoff STOP differs')
                stop_raw = observed_stop
                before = imp.validate_checkout(REPO, STATE)
                require(before['status'] == 'stopped' and before['expected_head'] == pins['candidate'] and
                        sha((STATE/'progress.json').read_bytes()) == pins['progress_sha256'] == frozen['state_sha256'], 'Frozen stopped state differs')
                require(len(before['queue']) == 984, 'Finite campaign queue changed')
                require(git('rev-parse', 'HEAD:leetcode/818') == pins['lesson_tree'] and
                        sha(imp.blob(REPO, pins['candidate'], 'leetcode/818/solution.py')) == pins['source_sha256'], 'Frozen lesson/source differs')
                ledger_raw = (STATE/'releases.json').read_bytes()
                require(sha(ledger_raw) == pins['ledger_sha256'], 'Ledger differs')
                record['startup_eligible'] = publication_guard(before, json.loads(ledger_raw))
                revision = pins['source_revision']
                require(re.fullmatch('[0-9a-f]{40}', revision), 'Evidence source must be an exact commit')
                git('fetch', '--no-tags', 'origin', revision)
                payload = {path: imp.blob(REPO, revision, path) for path in payload_paths(pins)}
                record['measurement_validation'] = validate_measurements(payload, pins)
                tree = imp.tree(REPO, pins['candidate'])
                require(not set(payload) & set(tree), 'Evidence/report already tracked')
                record.update(status='adopting-evidence', candidate=pins['candidate'], source_revision=revision)
                save(receipt, record)
                for path, data in payload.items():
                    target = REPO/path
                    require(not target.exists() and not target.is_symlink(), 'Evidence path exists')
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with target.open('xb') as out: out.write(data)
                    target.chmod(0o644)
                require(imp.changed_paths(REPO) == set(payload), 'Unexpected worktree changes')
                git('diff', '--check'); git('add', '--', *sorted(payload))
                require(set(git('diff', '--cached', '--name-only').splitlines()) == set(payload), 'Unexpected staged scope')
                require(read(STATE/'progress.json') == before and (STATE/'releases.json').read_bytes() == ledger_raw and
                        (STATE/'STOP').read_bytes() == stop_raw, 'State/ledger/STOP changed')
                git('commit', '-m', 'Adopt frozen LeetCode 818 Mac resource evidence before independent review\n\nCandidate: '+pins['candidate']+'\nEvidence-Source: '+revision+'\nBuilt-By: deterministic evidence adoption\nVerified-By: reviewed Mac harness; lesson review remains pending')
                head = imp.head(REPO); after_tree = imp.tree(REPO, head)
                require(git('rev-list', '--parents', '-n', '1', head).split()[1:] == [pins['candidate']], 'Unexpected evidence commit parents')
                require({p for p in tree.keys() | after_tree.keys() if tree.get(p) != after_tree.get(p)} == set(payload) and
                        all(after_tree[p].split()[0] == '100644' and imp.blob(REPO, head, p) == data for p, data in payload.items()), 'Evidence commit differs')
                require(not imp.changed_paths(REPO) and git('rev-parse', 'HEAD:leetcode/818') == pins['lesson_tree'], 'Lesson changed during adoption')
                require(read(STATE/'progress.json') == before and (STATE/'releases.json').read_bytes() == ledger_raw, 'State changed before checkpoint')
                after = checkpoint(before, head); save(STATE/'progress.json', after)
                require(read(STATE/'progress.json') == after, 'Checkpoint differs')
                git('push', 'origin', head+':refs/heads/codex/all-hard-20261018')
                require(git('ls-remote', 'origin', 'refs/heads/codex/all-hard-20261018').split()[0] == head, 'Evidence push not verified')
                record.update(status='evidence-pushed-still-stopped', evidence_head=head); save(receipt, record)
            require(read(STATE/'progress.json') == after and imp.head(REPO) == head and not imp.changed_paths(REPO) and
                    (STATE/'STOP').read_bytes() == stop_raw and (STATE/'releases.json').read_bytes() == ledger_raw, 'Checkpoint changed before resume')
            quiet_checkout()
            policy_guard(pins)
            (STATE/'STOP').unlink()
            launch = json.loads(subprocess.check_output([sys.executable, str(STATE/'launch.py'), '--continuous', '--max-rounds', '6'], cwd=REPO, text=True))
            record.update(status='awaiting-fresh-review', launch=launch); save(receipt, record)
            require(launch['continuous'] and launch['queue_count'] == len(after['queue']), 'Launch scope differs')
            proof = None
            for _ in range(120):
                procs = processes(); require(launch['pid'] in procs, 'Reviewer runner exited')
                proof = review_proof(after, read(STATE/'progress.json'), launch['pid'], procs)
                if proof: break
                time.sleep(.5)
            require(proof is not None, 'Fresh reviewer run/session/turn/native proof absent')
            require(imp.head(REPO) == head and git('rev-parse', 'HEAD:leetcode/818') == pins['lesson_tree'] and
                    (STATE/'releases.json').read_bytes() == ledger_raw and not (STATE/'STOP').exists(), 'Review start changed source/ledger/STOP')
            record.update(status='completed-review-running', completed_at=imp.now(), fresh_review=proof, release_ledger_preserved=True)
            save(receipt, record); print(json.dumps(record), flush=True)
        except BaseException as error:
            if stop_raw is not None and not (STATE/'STOP').exists():
                save(STATE/'STOP', json.loads(stop_raw), exclusive=True)
            record.update(status='failed-inspect-no-retry', error=str(error) or type(error).__name__,
                          recovery='Preserve actual/saved HEAD, evidence, receipt and owned STOP. Do not reset, retry or launch another worker. No agent was signaled.')
            save(receipt, record)
            raise


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dispatch', required=True); parser.add_argument('--pins', type=Path, required=True)
    args = parser.parse_args(argv)
    require(args.dispatch == DISPATCH, 'Explicit exact reviewed root dispatch required')
    require(REVIEWED_PINS_SHA256 is not None, 'Preparation only: candidate/evidence pins do not exist')
    raw = args.pins.read_bytes(); require(sha(raw) == REVIEWED_PINS_SHA256, 'Pins differ from independent review')
    pins = json.loads(raw); payload_paths(pins); policy_guard(pins)
    os.environ.update(PATH='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin',
                      NODE_PATH='/home/songyy/projects/integ-games/node_modules',
                      PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome', PYTHONDONTWRITEBYTECODE='1')
    sys.path.insert(0, str(REPO/'scripts'))
    global imp
    import import_leetcode_lane as imp
    execute(pins)


if __name__ == '__main__':
    def interrupted(signum, _frame):
        raise InterruptedError(f'Signal {signum}; no agent was signaled')
    signal.signal(signal.SIGTERM, interrupted)
    main()

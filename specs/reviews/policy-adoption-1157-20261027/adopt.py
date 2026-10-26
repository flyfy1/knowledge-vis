"""Two-file prospective policy adoption; no STOP creation, push, or launch."""
import argparse
import contextlib
import copy
import fcntl
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
PINS_SHA = None  # Final stopped review pins and independent approval are required.
DISPATCH = 'root-reviewed-policy-adoption-1157-20261027'
PATHS = {'specs/leetcode-explainers.md', 'specs/leetcode-rendered-state-contract.md'}
SOURCE = '694b9fc23684172609c57ed7e7e58192a4751c5d'
OWNER = 'policy-adoption-1157-20261027'


def require(ok, message):
    if not ok:
        raise RuntimeError(message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def git(repo, *args):
    return subprocess.check_output(['git', '-C', str(repo), *args]).rstrip(b'\n')


def blob(repo, revision, path):
    return subprocess.check_output(['git', '-C', str(repo), 'show', revision + ':' + path])


def save(path, value, exclusive=False):
    raw = (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode()
    if exclusive:
        with path.open('xb') as stream:
            stream.write(raw)
            stream.flush()
            os.fsync(stream.fileno())
    else:
        fd, name = tempfile.mkstemp(prefix='.policy-', dir=path.parent)
        try:
            with os.fdopen(fd, 'wb') as stream:
                stream.write(raw)
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(name, path)
        finally:
            if os.path.exists(name):
                os.unlink(name)
    fd = os.open(path.parent, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def no_workers(repo):
    for proc in Path('/proc').iterdir():
        if not proc.name.isdigit() or int(proc.name) == os.getpid():
            continue
        try:
            args = (proc / 'cmdline').read_bytes().split(b'\0')
            cwd = (proc / 'cwd').resolve()
        except (FileNotFoundError, ProcessLookupError, PermissionError):
            continue
        require(not any(arg.endswith(b'/scripts/leetcode_campaign.py') for arg in args),
                'A campaign runner exists; do not interrupt it')
        require(cwd != repo, 'Process remains in campaign checkout: ' + proc.name)


def boundary_valid(state, pins):
    boundary = pins.get('boundary')
    require(isinstance(boundary, dict), 'Finished review boundary pins are unresolved')
    require(state['status'] == 'stopped' and state['expected_head'] == boundary['head'],
            'Not the frozen stopped checkpoint')
    require(state['queue'] == pins['queue'] and len(state['queue']) == 984,
            'Finite queue changed')
    require(sha(json.dumps(state['queue'], separators=(',', ':')).encode()) == pins['queue_sha256'],
            'Queue hash differs')
    entry = state['problems']['1157']
    require(entry['status'] == 'review_passed' and entry['phase'] == 'register',
            '1157 must have finished an accepted review, awaiting ordinary registration')
    review = entry['reviews'][-1]
    require(review == boundary['review'] and review['candidate'] == entry['candidate'],
            'Frozen review or candidate changed')
    require(review['outcome'] == 'accepted' and review['required_open'] == [] and review['evidence'],
            'Required review findings remain')
    scores = review['scores']
    require(len(scores) == 6 and all(type(x) is int and 3 <= x <= 4 for x in scores),
            'Review score floor fails')
    require(sum(w * x / 4 for w, x in zip((15, 20, 20, 20, 15, 10), scores)) >= 85,
            'Review weighted score fails')
    run = next(r for r in state['runs'] if r['id'] == review['run_id'])
    require(run == boundary['run'] and run['status'] == 'completed' and run['role'] == 'review'
            and str(run['problem_id']) == '1157' and run['candidate'] == entry['candidate']
            and run.get('session_ids') and run['id'] not in entry['author_runs'],
            'Completed independent reviewer identity differs')
    author_sessions = {s for r in state['runs'] if r['id'] in entry['author_runs']
                       for s in r.get('session_ids', [])}
    require(not author_sessions.intersection(run['session_ids']), 'Reviewer reused author session')
    require(all(r['status'] != 'running' for r in state['runs']), 'Run still marked active')
    unfinished = [pid for pid in state['queue'] if state['problems'].get(pid, {}).get('status')
                  not in {'accepted_local', 'blocked', 'needs_review'}]
    require(unfinished and unfinished[0] == '1157', 'Ordinary queue prefix changed')
    require([pid for pid, e in state['problems'].items() if e.get('phase') == 'register'] == ['1157'],
            'Unexpected registration prefix')


def load_runtime(repo, pins):
    # Hash every dependency before executing any repository Python module.
    for path, expected in pins['runtime_hashes'].items():
        require(sha((repo / path).read_bytes()) == expected, 'Runtime/policy drift: ' + path)
    sys.path.insert(0, str(repo / 'scripts'))
    spec = importlib.util.spec_from_file_location('policy_import_helpers', repo / 'scripts/import_leetcode_lane.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def publication_bound(repo, state, ledger):
    from leetcode_publish import _reviewed
    from leetcode_registry import read_registry
    require(ledger['pending'] is None, 'Release in progress')
    registry = {str(row['id']): row for row in read_registry(repo / 'leetcode/problems.config.js')}
    prospective = {pid for pid, e in state['problems'].items() if e['status'] == 'accepted_local'
                   and ledger['released'].get(pid, {}).get('candidate') != e.get('candidate')}
    accepted = _reviewed(repo, state, registry, git(repo, 'rev-parse', 'HEAD').decode(), prospective)
    require(not any(ledger['released'].get(pid, {}).get('digest') == item['digest']
                    for pid, item in accepted.items()), 'Startup would refresh release pointers')
    require('1157' not in ledger['released'], 'Previously released 1157 requires separate inspection')
    eligible = set(accepted)
    upper = eligible | {'1157'}
    require(len(upper) < 20, 'Registration could reach publication threshold; defer adoption')
    return {'eligible': sorted(eligible), 'registration_ids': ['1157'], 'upper_bound': len(upper)}


def preflight(pins):
    require(pins['source'] == SOURCE and pins['owner'] == OWNER and set(pins['payload']) == PATHS,
            'Fixed source/owner/allowlist differs')
    require(isinstance(pins.get('boundary'), dict), 'Finished review pins are unresolved')
    repo, directory = Path(pins['repo']), Path(pins['state_dir'])
    require(repo == Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
            and directory == Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018'),
            'Unexpected deployment paths')
    no_workers(repo)
    require(git(repo, 'branch', '--show-current').decode() == pins['branch'], 'Branch changed')
    require(not git(repo, 'status', '--porcelain', '--untracked-files=all'), 'Dirty checkout')
    boundary = pins['boundary']
    require(git(repo, 'rev-parse', 'HEAD').decode() == boundary['head'], 'HEAD changed')
    raw = (directory / 'progress.json').read_bytes()
    ledger_raw = (directory / 'releases.json').read_bytes()
    stop = (directory / 'STOP').read_bytes()
    require(sha(raw) == boundary['progress_sha256'], 'Stopped state bytes changed')
    require(sha(ledger_raw) == pins['ledger_sha256'], 'Release ledger changed; no repinning')
    require(sha(stop) == boundary['stop_sha256'] and json.loads(stop)['owner'] == OWNER,
            'STOP identity changed')
    require(sha((directory / 'launch.py').read_bytes()) == pins['launcher_sha256'], 'Launcher changed')
    for path in directory.glob('lane-*-reservation.json'):
        require(json.loads(path.read_bytes())['status'] in {'imported', 'cancelled'}, 'Active/unknown lane reservation')
    state = json.loads(raw)
    boundary_valid(state, pins)
    helper = load_runtime(repo, pins)
    require(helper.validate_checkout(repo, directory) == state, 'Checkout validation differs')
    review = boundary['review']
    for path, expected in pins['runtime_hashes'].items():
        require(sha(blob(repo, review['candidate'], path)) == expected,
                'Frozen candidate runtime/policy differs: ' + path)
    require(review['commit'] == boundary['head'], 'Boundary is not the exact review commit')
    require(sha(blob(repo, boundary['head'], review['report_path'])) == boundary['report_sha256'],
            'Finished report bytes changed')
    payload = {}
    for path, hashes in pins['payload'].items():
        require(not (repo / path).is_symlink(), 'Policy symlink')
        require(sha((repo / path).read_bytes()) == hashes['old_sha256'], 'Old policy differs')
        require(sha(blob(repo, review['candidate'], path)) == hashes['old_sha256'],
                'Candidate was authored/reviewed under another policy')
        require(git(repo, 'ls-tree', SOURCE, '--', path).startswith(b'100644 blob '), 'Source mode differs')
        payload[path] = blob(repo, SOURCE, path)  # Missing source object refuses; never fetch here.
        require(sha(payload[path]) == hashes['new_sha256'], 'Payload differs')
    bound = publication_bound(repo, state, json.loads(ledger_raw))
    return helper, state, raw, ledger_raw, stop, payload, bound


def adopt(pins):
    repo, directory = Path(pins['repo']), Path(pins['state_dir'])
    helper, *_ = preflight(pins)
    receipt_path = directory / (OWNER + '.json')
    record = {'owner': OWNER, 'source': SOURCE, 'status': 'preparing', 'pins_sha256': PINS_SHA}
    with contextlib.ExitStack() as stack:
        release = stack.enter_context((directory / 'release.lock').open('a'))
        fcntl.flock(release, fcntl.LOCK_EX | fcntl.LOCK_NB)
        stack.enter_context(helper.ownership(repo, directory))
        helper, state, raw, ledger_raw, stop, payload, bound = preflight(pins)
        save(receipt_path, record, exclusive=True)
        try:
            archive = directory / (OWNER + '-before')
            archive.mkdir()
            for name, data in [('progress.json', raw), ('releases.json', ledger_raw), ('STOP', stop)]:
                with (archive / name).open('xb') as stream:
                    stream.write(data)
                    stream.flush()
                    os.fsync(stream.fileno())
            save(archive / 'pins.json', pins, exclusive=True)  # Also fsyncs archive directory.
            old_head = state['expected_head']
            before_tree = helper.tree(repo, old_head)
            record.update(status='adopting', old_head=old_head, publication_bound=bound)
            save(receipt_path, record)
            for path, data in payload.items():
                (repo / path).write_bytes(data)
            require(helper.changed_paths(repo) == PATHS, 'Unexpected changed paths')
            git(repo, 'diff', '--check')
            git(repo, 'add', '--', *sorted(PATHS))
            require(set(git(repo, 'diff', '--cached', '--name-only').decode().splitlines()) == PATHS,
                    'Unexpected staged paths')
            require((directory / 'progress.json').read_bytes() == raw
                    and (directory / 'releases.json').read_bytes() == ledger_raw
                    and (directory / 'STOP').read_bytes() == stop, 'Metadata/STOP changed')
            git(repo, 'commit', '-m', 'Adopt prospective rendered-state and teaching guidance\n\n'
                'Preserve the completed 1157 review under its original candidate policy.\n\n'
                'Policy-Source: ' + SOURCE + '\nBuilt-By: Codex; exact model unavailable; guarded two-file adoption operator\n'
                'Verified-By: operator guards; independent operator review required before enablement')
            head = git(repo, 'rev-parse', 'HEAD').decode()
            require(git(repo, 'rev-list', '--parents', '-n', '1', head).decode().split()[1:] == [old_head],
                    'Unexpected commit ancestry')
            after_tree = helper.tree(repo, head)
            require({p for p in before_tree.keys() | after_tree.keys()
                     if before_tree.get(p) != after_tree.get(p)} == PATHS, 'Commit changed unrelated paths')
            require(not helper.changed_paths(repo), 'Commit left dirty files')
            for path, data in payload.items():
                require(blob(repo, head, path) == data and after_tree[path].startswith('100644 '),
                        'Committed bytes/mode differ')
            require((directory / 'progress.json').read_bytes() == raw
                    and (directory / 'releases.json').read_bytes() == ledger_raw
                    and (directory / 'STOP').read_bytes() == stop, 'Metadata changed before checkpoint')
            after = copy.deepcopy(state)
            after['expected_head'] = head
            save(directory / 'progress.json', after)
            require(json.loads((directory / 'progress.json').read_bytes()) == after, 'Checkpoint verification failed')
            require((directory / 'releases.json').read_bytes() == ledger_raw
                    and (directory / 'STOP').read_bytes() == stop, 'Ledger/STOP changed after checkpoint')
            record.update(status='adopted-stopped-awaiting-root', head=head, changed_paths=sorted(PATHS),
                          expected_head_only=True, original_candidate=state['problems']['1157']['candidate'])
            save(receipt_path, record)
            return record
        except BaseException as error:
            record.update(status='failed-inspect-no-retry', error=repr(error))
            save(receipt_path, record)
            raise


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--pins', type=Path, required=True)
    parser.add_argument('--dispatch')
    args = parser.parse_args()
    raw = args.pins.read_bytes()
    pins = json.loads(raw)
    if args.dispatch is None:
        result = preflight(pins)
        print(json.dumps({'status': 'read-only-preflight-passed', 'publication_bound': result[-1]}))
        return
    require(PINS_SHA is not None and sha(raw) == PINS_SHA and args.dispatch == DISPATCH,
            'Disabled: exact final pins, independent review and root dispatch required')
    print(json.dumps(adopt(pins)))


if __name__ == '__main__':
    main()

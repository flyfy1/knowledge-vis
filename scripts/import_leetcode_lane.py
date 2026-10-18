#!/usr/bin/env python3
"""Import one completed independent lane; never deploy or start/stop workers.

Interface: both checkouts must share a Git object store, be clean, and have no
live owner. The central runner must already have observed its default STOP file
(status stopped); the single-ID lane must be completed. Caller keeps STOP until
inspection/resume. Four runner/checkout locks cover validation through commit and
state update. The import retains lane ancestry and original agent evidence while
rebuilding registration against the central registry. Shared policy/runtime must
match exactly (collection index may differ only in registry cache version).

A durable receipt is written BEFORE mutations. Failure retains the merge, files,
and receipt for inspection; never reset or silently retry an incomplete import.
State is atomically replaced only after the merge passes the publication gate.
Receipt/state cannot be one filesystem transaction: the receipt remains prepared
if interrupted in that final window; inspect its target HEAD and the state before
manual recovery. No acceptance is inferred from the receipt alone.
"""
from __future__ import annotations
import argparse
import contextlib
import copy
import fcntl
import hashlib
import json
from pathlib import Path
import re
import shutil
import uuid

from leetcode_campaign import (CampaignError, REGISTER_PATHS, allowed_path, acceptance,
    changed_paths, command, git, head, now, required_files, save_state, validate_result)
from leetcode_publish import _reviewed, PublicationError
from leetcode_registry import read_registry
from register_leetcode_lesson import register


class ImportError(CampaignError):
    pass


def require(condition, message):
    if not condition:
        raise ImportError(message)


def tree(repo, revision):
    records = command(['git', 'ls-tree', '-r', '-z', revision], repo).split(b'\0')
    return {name.decode(): meta.decode() for record in records if record
            for meta, name in [record.split(b'\t', 1)]}


def blob(repo, revision, path):
    return command(['git', 'show', f'{revision}:{path}'], repo)


def review_path(path, pid):
    return bool(re.fullmatch(rf'specs/reviews/{pid}-review-[^/]+\.md', path) or
                path.startswith(f'specs/reviews/{pid}-evidence/'))


def frozen_fingerprint(repo, revision, report, evidence_prefix):
    """Reproduce the runner's clean-candidate fingerprint, including file modes."""
    digest = hashlib.sha256()
    for path, metadata in sorted(tree(repo, revision).items()):
        if path == report or path.startswith(evidence_prefix):
            continue
        mode = metadata.split()[0]
        data = blob(repo, revision, path)
        digest.update(path.encode() + b"\0")
        if mode == '120000':
            digest.update(b'link:' + data)
        else:
            require(mode in ('100644', '100755'), 'Unsupported candidate file mode')
            digest.update(str(int(mode, 8)).encode() + b"\0" + data)
    return digest.hexdigest()


def shared(path):
    return not (re.match(r'leetcode/\d+/', path) or
        re.match(r'leetcode/tests/\d+[-_][^/]+$', path) or
        re.match(r'specs/reviews/\d+-(?:review-|evidence/)', path) or
        path in REGISTER_PATHS or path in {
            'scripts/import_leetcode_lane.py', 'scripts/test_import_leetcode_lane.py'})


def same_shared(repo, first, second):
    a, b = tree(repo, first), tree(repo, second)
    require({p: v for p, v in a.items() if shared(p)} ==
            {p: v for p, v in b.items() if shared(p)},
            'Shared runtime or policy differs from the reviewed lane')
    def index(revision):
        return re.sub(rb'problems\.config\.js\?v=[^"\']+',
                      b'problems.config.js?v=REGISTRY', blob(repo, revision, 'leetcode/index.html'))
    require(index(first) == index(second), 'Collection index differs beyond registry cache version')


@contextlib.contextmanager
def ownership(repo, state_dir):
    path = Path(git(repo, 'rev-parse', '--git-path', 'leetcode-campaign.lock'))
    path = path if path.is_absolute() else repo / path
    with (state_dir / 'runner.lock').open('a') as state_lock, path.open('a') as checkout_lock:
        try:
            for lock in (state_lock, checkout_lock):
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as error:
            raise ImportError('Live runner owns a checkout or state directory') from error
        yield


def validate_checkout(repo, directory):
    require(Path(git(repo, 'rev-parse', '--show-toplevel')).resolve() == repo, 'Not a checkout root')
    require(git(repo, 'branch', '--show-current').startswith('codex/'), 'Requires isolated codex/ branches')
    require(not changed_paths(repo), 'Dirty checkout; preserve and inspect before import')
    merge_head = Path(git(repo, 'rev-parse', '--git-path', 'MERGE_HEAD'))
    merge_head = merge_head if merge_head.is_absolute() else repo / merge_head
    require(not merge_head.exists(), 'Unfinished merge')
    state = json.loads((directory / 'progress.json').read_text())
    require(state.get('version') == 1 and state.get('repo') == str(repo), 'State checkout identity mismatch')
    require(state.get('expected_head') == head(repo), 'State HEAD mismatch')
    require(len(state['queue']) == len(set(state['queue'])), 'Duplicate IDs in queue')
    require(all(r.get('status') != 'running' for r in state['runs']), 'Running agent in state')
    return state


def validate_runs(lane, directory, pid, central):
    runs = lane['runs']
    existing_ids = {r['id'] for r in central['runs']}
    sessions = {sid for r in central['runs'] for sid in r.get('session_ids', [])}
    seen = set()
    entry = lane['problems'][pid]
    expected = set(entry['author_runs']) | {r['run_id'] for r in entry['reviews']}
    require(len(expected) == len(entry['author_runs']) + len(entry['reviews']), 'Duplicate/reused author or review run')
    require({r['id'] for r in runs} == expected and len(runs) == len(expected), 'Missing or duplicate lane runs')
    for run in runs:
        rid = run['id']
        require(re.fullmatch(rf'{pid}-(?:author|fix|review)-[A-Za-z0-9-]+', rid), 'Unsafe run ID')
        require(rid not in existing_ids and str(run['problem_id']) == pid and
                run['status'] == 'completed', 'Duplicate, incomplete, or foreign run')
        require(run['role'] in ('author', 'fix', 'review') and
                (run['role'] == 'review') == (rid not in entry['author_runs']), 'Run role mismatch')
        ids = run['session_ids']
        require(isinstance(ids, list) and ids and all(isinstance(s, str) and s for s in ids) and
                len(ids) == len(set(ids)) and not set(ids) & (sessions | seen), 'Missing or reused agent sessions')
        seen.update(ids)
        folder = directory / 'runs' / rid
        require(folder.resolve().is_relative_to(directory), 'Run evidence escapes state directory')
        require(Path(run['directory']).resolve() == folder.resolve() and folder.is_dir(), 'Run directory mismatch')
        require(not any(p.is_symlink() for p in [folder, *folder.rglob('*')]), 'Symlink in run evidence')
        event_ids = set()
        for line in (folder / 'events.jsonl').read_text().splitlines():
            event = json.loads(line)
            require(event.get('type') not in ('error', 'turn.failed'), 'Failed event in completed run')
            event_ids.update(event[k] for k in ('thread_id', 'session_id') if isinstance(event.get(k), str))
        require(event_ids == set(ids), 'Recorded sessions differ from actual events')
        result = validate_result(json.loads((folder / 'final.json').read_text()), run['role'] == 'review')
        require(result == run['result'], 'Run final output differs from state')
        if run['role'] == 'review':
            review = next(r for r in entry['reviews'] if r['run_id'] == rid)
            require(all(review.get(k) == v for k, v in result.items()) and
                    run['candidate'] == review['candidate'], 'Review output or candidate mismatch')
        else:
            require(result['outcome'] == 'ready', 'Author/fix did not finish ready')
    return runs


def import_lane(repo, state_dir, lane_repo, lane_state_dir, problem_id):
    repo, state_dir, lane_repo, lane_state_dir = map(lambda p: Path(p).resolve(),
                                                   (repo, state_dir, lane_repo, lane_state_dir))
    pid = str(problem_id)
    require(re.fullmatch(r'[1-9][0-9]*', pid), 'Invalid problem ID')
    require(repo != lane_repo and state_dir != lane_state_dir, 'Import requires distinct checkouts and states')
    require(all(not s.is_relative_to(r) for s in (state_dir, lane_state_dir) for r in (repo, lane_repo)),
            'State directories must be outside checkouts')
    def common(root):
        path = Path(git(root, 'rev-parse', '--git-common-dir'))
        return (root / path).resolve() if not path.is_absolute() else path.resolve()
    require(common(repo) == common(lane_repo), 'Only worktrees sharing a Git object store are supported')
    with ownership(repo, state_dir), ownership(lane_repo, lane_state_dir):
        central = validate_checkout(repo, state_dir)
        lane = validate_checkout(lane_repo, lane_state_dir)
        require((state_dir / 'STOP').is_file() and central['status'] == 'stopped',
                'Central runner must observe STOP and stop before import')
        require(lane['status'] == 'completed' and lane.get('current') is None and lane['queue'] == [pid] and
                set(lane['problems']) == {pid}, 'Lane must be completed with exactly the requested ID')
        require(pid in central['queue'] and pid not in central['problems'] and
                all(str(r.get('problem_id')) != pid for r in central['runs']) and
                str((central.get('current') or {}).get('problem_id')) != pid, 'Central ID already started or absent')
        entry = lane['problems'][pid]
        require(entry.get('status') == 'accepted_local' and entry.get('phase') == 'done' and entry.get('reviews'),
                'Lane is not independently accepted')
        require(entry.get('rounds') == len(entry['reviews']) and
                entry.get('prior_report') == entry['reviews'][-1]['report_path'], 'Review sequence mismatch')
        require(acceptance({k: entry['reviews'][-1][k] for k in
                ('outcome','scores','required_open','report_path','evidence','detail')})[0], 'Review gate failed')
        require(len({r['id'] for r in central['runs']}) == len(central['runs']), 'Duplicate central run IDs')
        require(pid not in {str(r['id']) for r in read_registry(repo/'leetcode/problems.config.js')},
                'Central registry already contains imported ID')
        old_head, lane_head = head(repo), head(lane_repo)
        base = git(repo, 'merge-base', old_head, lane_head)
        require(base != lane_head, 'Lane already merged or has no changes')
        paths = set(command(['git','diff','--no-renames','--name-only','-z',base,lane_head], repo).decode().split('\0')) - {''}
        for commit in git(repo,'rev-list',base+'..'+lane_head).splitlines():
            parents=git(repo,'rev-list','--parents','-n','1',commit).split()[1:]
            require(len(parents) == 1, 'Lane history must contain single-parent runner commits')
            changed=command(['git','diff','--no-renames','--name-only','-z',parents[0],commit],repo).decode().split('\0')
            require(all(allowed_path(p,pid) or review_path(p,pid) or p in REGISTER_PATHS for p in changed if p),
                    'Lane history changed paths outside its permitted scope')
        require(all(allowed_path(p, pid) or review_path(p, pid) or p in REGISTER_PATHS for p in paths),
                'Lane changed paths outside its permitted scope')
        require(all(p not in tree(repo, old_head) for p in paths if allowed_path(p, pid) or review_path(p, pid)),
                'Lane paths collide with central files')
        same_shared(repo, old_head, lane_head)
        same_shared(repo, old_head, entry['candidate'])
        candidate_tree, lane_tree = tree(repo, entry['candidate']), tree(repo, lane_head)
        require({p:v for p,v in candidate_tree.items() if allowed_path(p,pid)} ==
                {p:v for p,v in lane_tree.items() if allowed_path(p,pid)}, 'Candidate lesson/test bytes changed after review')
        restore = sorted(p for p in paths if allowed_path(p,pid) or review_path(p,pid))
        require(all(p in lane_tree and lane_tree[p].split()[0] in ('100644','100755') for p in restore),
                'Lane import contains deletion, symlink, or nonregular file')
        for round_number, review in enumerate(entry['reviews'],1):
            _, score = acceptance({k: review[k] for k in
                ('outcome','scores','required_open','report_path','evidence','detail')})
            require(review.get('round') == round_number and review.get('weighted_score') == score,
                    'Review round or weighted score mismatch')
            require(review_path(review['report_path'],pid), 'Review report outside own lesson')
            require(git(repo,'rev-list','--parents','-n','1',review['commit']).split()[1:] == [review['candidate']],
                    'Review commit must directly follow its frozen candidate')
            git(repo,'merge-base','--is-ancestor',review['commit'],lane_head)
            evidence_prefix = f"specs/reviews/{pid}-evidence/{Path(review['report_path']).stem}/"
            require(review.get('candidate_sha256') == frozen_fingerprint(repo,review['candidate'],review['report_path'],evidence_prefix),
                    'Frozen candidate fingerprint mismatch')
            rt = tree(repo,review['commit'])
            own = lambda p: p == review['report_path'] or p.startswith(evidence_prefix)
            review_diff = command(['git','diff','--no-renames','--name-only','-z',review['candidate'],review['commit']],repo).decode().split('\0')
            require(all(own(p) for p in review_diff if p), 'Review commit mutated frozen candidate')
            require({p:v for p,v in rt.items() if own(p)} == {p:v for p,v in lane_tree.items() if own(p)},
                    'Historical review evidence changed')
        runs = validate_runs(lane,lane_state_dir,pid,central)
        require(all(not (state_dir/'runs'/r['id']).exists() for r in runs), 'Run evidence destination already exists')
        registry = {str(r['id']):r for r in read_registry(lane_repo/'leetcode/problems.config.js')}
        _reviewed(lane_repo,lane,registry,lane_head,{pid})
        catalog = json.loads((repo/'leetcode/catalog/hard-problems.json').read_text())
        problem = next(p for p in catalog['problems'] if str(p['id']) == pid)
        required_files(lane_repo, problem, True)
        receipts = state_dir/'lane-imports'
        receipts.mkdir(exist_ok=True)
        require(not any(json.loads(p.read_text()).get('status') != 'completed' for p in receipts.glob('*.json')),
                'Incomplete import receipt requires inspection')
        receipt_path = receipts/f'{pid}-{uuid.uuid4().hex}.json'
        receipt = {'version':1,'status':'prepared','problem_id':pid,'central_before':old_head,
                   'lane_head':lane_head,'lane_repo':str(lane_repo),'lane_state_dir':str(lane_state_dir),
                   'candidate':entry['candidate'],'run_ids':[r['id'] for r in runs],'started_at':now()}
        save_state(receipt_path,receipt)
        try:
            command(['git','merge','-s','ours','--no-commit','--no-ff',lane_head],repo)
            command(['git','restore','--source',lane_head,'--staged','--worktree','--',*restore],repo)
            register(repo,int(pid))
            require(changed_paths(repo) <= set(restore)|REGISTER_PATHS,'Import changed unexpected paths')
            for path in restore:
                require((repo/path).read_bytes() == blob(repo,lane_head,path),'Restored bytes mismatch')
            command(['git','add','--',*sorted(changed_paths(repo))],repo)
            command(['git','commit','-m',f'Import independently reviewed LeetCode {pid} lane\n\n'
                     f'Lane-Head: {lane_head}\nReview-Candidate: {entry["candidate"]}\n'
                     f'Review-Report: {entry["prior_report"]}\n'
                     'Built-By: deterministic lane importer; original author and reviewer commits retained'],repo)
            merged = head(repo)
            receipt['merged_head'] = merged
            save_state(receipt_path,receipt)
            require(not changed_paths(repo),'Import commit left dirty files')
            require(git(repo,'rev-list','--parents','-n','1',merged).split()[1:] == [old_head,lane_head],
                    'Import must retain exact central and lane parents')
            mt, ot = tree(repo,merged), tree(repo,old_head)
            allowed = set(restore) | REGISTER_PATHS
            require({p:v for p,v in mt.items() if p not in allowed} ==
                    {p:v for p,v in ot.items() if p not in allowed}, 'Import changed unrelated tracked content')
            require(all(mt.get(p) == lane_tree[p] for p in restore), 'Committed import differs from lane bytes/modes')
            updated = copy.deepcopy(central)
            updated['problems'][pid] = copy.deepcopy(entry)
            for run in runs:
                target = state_dir/'runs'/run['id']
                shutil.copytree(lane_state_dir/'runs'/run['id'],target)
                imported = copy.deepcopy(run)
                imported['source_directory'] = imported['directory']
                imported['directory'] = str(target)
                updated['runs'].append(imported)
            updated['expected_head'] = merged
            current_registry = {str(r['id']):r for r in read_registry(repo/'leetcode/problems.config.js')}
            _reviewed(repo,updated,current_registry,merged,{pid})
            require(all(current_registry.get(str(r['id'])) == r for r in
                        read_registry_from_commit(repo,old_head,state_dir)), 'Central registry entries changed')
            updated.setdefault('lane_imports',[]).append({**receipt,'status':'completed','receipt':str(receipt_path)})
            save_state(state_dir/'progress.json',updated)
            receipt['status'] = 'completed'
            save_state(receipt_path,receipt)
            return receipt
        except BaseException as error:
            receipt['error'] = str(error)
            save_state(receipt_path,receipt)
            raise


def read_registry_from_commit(repo, revision, directory):
    import tempfile
    with tempfile.TemporaryDirectory(dir=directory) as temporary:
        path=Path(temporary)/'registry.js'
        path.write_bytes(blob(repo,revision,'leetcode/problems.config.js'))
        return read_registry(path)


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    for key in ('repo','state-dir','lane-repo','lane-state-dir'):
        parser.add_argument('--'+key,type=Path,required=True)
    parser.add_argument('--id',required=True)
    args=parser.parse_args(argv)
    print(json.dumps(import_lane(args.repo,args.state_dir,args.lane_repo,args.lane_state_dir,args.id)))


if __name__ == '__main__':
    try:
        main()
    except (CampaignError,PublicationError,OSError,ValueError,KeyError,StopIteration) as error:
        raise SystemExit(f'Lane import stopped; preserve checkout and receipt for inspection: {error}')

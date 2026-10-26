"""One #1092 adoption transaction. No fetch, launch, push, release or rollback."""
import argparse
import copy
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys

PINS_SHA = '89440012068e76795ce17050844d51eaeded6451e297f8c0f12413a9f49dd162'  # Must be frozen and independently reviewed after actual source review.
TOKEN = 'root-reviewed-1092-header-adoption-20261026'
OWNER = '1092-header-adoption-20261026'
BASE = '093440bf6df89b6a5dbc7a958ae3aef588b9acff'
CANDIDATE = 'c3d5761514ebedd5e50297acd937c5380ba12fe0'
FAILED = '1092-fix-7beee2677431'
REPO = Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
STATE = Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
PROTECTED = {'solution.py', 'python-code.js', 'core.js', 'lesson-entry.json', 'app.js', 'copy.js'}
REVIEW_PATH = 'specs/reviews/1092-header-independent-review-20261026.md'
PROVENANCE_PATH = 'specs/reviews/1092-header-fit-provenance-20261026.md'
EVIDENCE_PREFIX = 'specs/reviews/1092-header-independent-evidence-20261026/'
POLICY = {'scripts/leetcode_campaign.py', 'scripts/leetcode_publish.py', 'scripts/leetcode_static_versions.py',
          'scripts/leetcode_registry.py', 'scripts/register_leetcode_lesson.py',
          'scripts/campaign-prompts/author.md', 'scripts/campaign-prompts/fix.md', 'scripts/campaign-prompts/review.md',
          'specs/leetcode-explainers.md', 'specs/leetcode-review-gates.md', 'specs/leetcode-rendered-state-contract.md'}


def require(ok, message):
    if not ok:
        raise RuntimeError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def git(repo, *args):
    return subprocess.check_output(['git', '-C', str(repo), *args])


def tree(repo, revision):
    result = {}
    for row in git(repo, 'ls-tree', '-rz', revision).split(b'\0'):
        if row:
            meta, path = row.decode().split('\t')
            mode, kind, blob = meta.split()
            result[path] = {'mode': mode, 'kind': kind, 'blob': blob}
    return result


def safe(root, relative):
    p = PurePosixPath(relative)
    require(str(p) == relative and not p.is_absolute() and '..' not in p.parts and '\\' not in relative, 'Unsafe path')
    target = root / relative
    require(not any(x.is_symlink() for x in (target, *target.parents)), 'Symlink path')
    return target


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def mkdir(path):
    if not path.exists():
        mkdir(path.parent)
        path.mkdir()
        fsync_dir(path.parent)
        fsync_dir(path)


def durable(path, data, replace=False):
    mkdir(path.parent)
    temp = path.with_name(path.name + '.tmp') if replace else path
    with temp.open('xb') as f:
        os.fchmod(f.fileno(), 0o644)
        f.write(data)
        f.flush()
        os.fsync(f.fileno())
    if replace:
        os.replace(temp, path)
    fsync_dir(path.parent)


def write_json(path, value, replace=False):
    durable(path, (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode(), replace)


def ready(pins, candidate_manifest):
    require(pins.get('status') == 'frozen-reviewed-adoption', 'Disabled: final review/pins unresolved')
    require(pins['base'] == BASE and pins['candidate'] == CANDIDATE, 'Source identity differs')
    review = pins.get('review')
    require(isinstance(review, dict) and review.get('outcome') == 'approved' and review.get('required_open') == [], 'Review missing or not approved')
    require(review.get('candidate') == CANDIDATE and review.get('closed') == ['1092-R1'], 'Review candidate/finding differs')
    require(re.fullmatch('[0-9a-f]{40}', review.get('revision', '')) and review['revision'] != CANDIDATE, 'Review commit unresolved')
    require(review.get('ref') == 'refs/heads/codex/leetcode-1092-header-fit', 'Review source branch differs')
    require(review.get('report_path') == REVIEW_PATH and re.fullmatch('[0-9a-f]{64}', review.get('report_sha256', '')), 'Review report unresolved')
    require(bool(review.get('reviewer_identity')) and review.get('runtime_unchanged') is True, 'Independent review identity/parity missing')
    require(candidate_manifest['base'] == BASE and candidate_manifest['candidate'] == CANDIDATE and len(candidate_manifest['files']) == 66, 'Candidate manifest differs')
    require(set(candidate_manifest['protected']) == PROTECTED, 'Protected set differs')
    require(pins.get('payload_manifest') and pins['payload_manifest']['revision'] == review['revision'], 'Final payload manifest missing')
    require(set(pins['runtime']['policy']) == POLICY and len(pins['runtime']['quarantine']) == 19, 'Runtime/quarantine inventory differs')


def validate_source(repo, pins, manifest):
    review = pins['review']
    revision = review['revision']
    # Objects must already exist through a separately authorized, recorded transfer.
    for ref in (BASE, CANDIDATE, revision):
        require(git(repo, 'rev-parse', ref + '^{commit}').decode().strip() == ref, 'Source object missing')
    require(git(repo, 'ls-remote', 'origin', review['ref']).decode().split()[0] == revision, 'Remote reviewed revision differs')
    git(repo, 'merge-base', '--is-ancestor', BASE, CANDIDATE)
    git(repo, 'merge-base', '--is-ancestor', CANDIDATE, revision)
    old, candidate, final = (tree(repo, ref) for ref in (BASE, CANDIDATE, revision))
    changed = lambda a, b: {p for p in a.keys() | b.keys() if a.get(p) != b.get(p)}
    require(changed(old, candidate) == set(manifest['files']), 'Candidate full diff differs')
    added_review = changed(candidate, final)
    require(REVIEW_PATH in added_review and all(p in (REVIEW_PATH, PROVENANCE_PATH) or p.startswith(EVIDENCE_PREFIX) for p in added_review), 'Review changed non-evidence source')
    require(all(p not in candidate for p in added_review), 'Review overwrote existing history')
    report = git(repo, 'show', revision + ':' + REVIEW_PATH)
    require(sha(report) == review['report_sha256'] and CANDIDATE.encode() in report, 'Review report binding differs')
    require(set(review['evidence_sha256']) == added_review - {REVIEW_PATH}, 'Review evidence inventory differs')
    for path, digest in review['evidence_sha256'].items():
        require(sha(git(repo, 'show', revision + ':' + path)) == digest, 'Review evidence hash differs')
    payload = pins['payload_manifest']['files']
    require(changed(old, final) == set(payload), 'Final full changed-path manifest differs')
    contents = {}
    for path, item in payload.items():
        safe(repo, path)
        require(item['before'] == old.get(path) and item['after'] == final.get(path), 'Payload blob/mode differs')
        require(item['after'] and item['after']['mode'] == '100644' and item['after']['kind'] == 'blob', 'Only regular payload files allowed')
        before = git(repo, 'show', BASE + ':' + path) if path in old else None
        require((sha(before) if before is not None else None) == item['before_sha256'], 'Old payload bytes differ')
        contents[path] = git(repo, 'show', revision + ':' + path)
        require(sha(contents[path]) == item['after_sha256'], 'New payload bytes differ')
        if path in manifest['files']:
            require(item == manifest['files'][path], 'Reviewed source changed after candidate freeze')
    for name, digest in manifest['protected'].items():
        path = 'leetcode/1092/' + name
        require(old[path] == candidate[path] == final[path] and sha(git(repo, 'show', revision + ':' + path)) == digest, 'Protected source differs')
    return old, final, contents


def snapshot_guard(repo, state_dir, pins):
    frozen = pins['runtime']
    raw = (state_dir / 'progress.json').read_bytes()
    ledger = (state_dir / 'releases.json').read_bytes()
    state = json.loads(raw)
    require(sha(raw) == frozen['state_sha256'], 'State changed')
    require(sha(ledger) == frozen['ledger_sha256'] and json.loads(ledger)['pending'] is None, 'Ledger changed or pending')
    require(git(repo, 'rev-parse', 'HEAD').decode().strip() == state['expected_head'] == BASE, 'Wrong HEAD')
    require(state['status'] == 'failed' and state['current']['run_id'] == FAILED, 'Wrong failed boundary')
    entry = state['problems']['1092']
    require(entry['status'] == 'changes_required' and entry['phase'] == 'fix' and entry['rounds'] == 1 and entry['reviews'][-1]['required_open'] == ['1092-R1'], 'Required history changed')
    require(len(state['queue']) == 984 and sha(json.dumps(state['queue'], separators=(',', ':')).encode()) == frozen['queue_sha256'], 'Queue changed')
    dirty = git(repo, 'status', '--porcelain=v1', '--untracked-files=all').decode().splitlines()
    require(set(dirty) == {'?? ' + p for p in frozen['quarantine']}, 'Dirty paths changed')
    for rel, digest in frozen['quarantine'].items():
        path = safe(repo, rel)
        require(path.is_file() and sha(path.read_bytes()) == digest, 'Untracked hash changed: ' + rel)
    for path, digest in frozen['policy'].items():
        require(sha(safe(repo, path).read_bytes()) == digest, 'Policy changed')
    require(sha((state_dir / 'launch.py').read_bytes()) == frozen['launcher_sha256'], 'Launcher changed')
    for files in frozen['run_files'].values():
        for path, digest in files.items():
            require(sha(safe(state_dir, path).read_bytes()) == digest, 'Historical run bytes changed')
    reservations = {p.name: sha(p.read_bytes()) for p in state_dir.glob('lane-*-reservation.json')}
    require(reservations == frozen['reservations'], 'Lane reservations changed')
    require(all(json.loads((state_dir / p).read_bytes())['status'] in ('imported', 'cancelled', 'canceled') for p in reservations), 'Active lane reservation')
    require(not (state_dir / 'STOP').exists(), 'Unexpected STOP')
    return raw, ledger


def no_workers(repo):
    for p in Path('/proc').glob('[0-9]*'):
        try:
            if int(p.name) == os.getpid():
                continue
            argv = [x.decode(errors='replace') for x in (p / 'cmdline').read_bytes().split(b'\0') if x]
            cwd = os.readlink(p / 'cwd')
            require(cwd != str(repo) and not cwd.startswith('/home/songyy/projects/leetcode-hard-lane-') and
                    not any(Path(x).name == 'leetcode_campaign.py' for x in argv), 'Campaign/lane writer remains: ' + p.name)
        except (FileNotFoundError, ProcessLookupError, PermissionError):
            pass


def eligible(repo, state_dir, pins):
    # Hash every imported dependency before executing repository code.
    for path, digest in pins['runtime']['policy'].items():
        require(sha((repo / path).read_bytes()) == digest, 'Policy differs before import')
    sys.dont_write_bytecode = True
    sys.path.insert(0, str(repo / 'scripts'))
    import leetcode_publish as publisher
    state = json.loads((state_dir / 'progress.json').read_bytes())
    ledger = json.loads((state_dir / 'releases.json').read_bytes())
    registry = {str(x['id']): x for x in publisher.read_registry(repo / 'leetcode/problems.config.js')}
    prospective = {pid for pid, entry in state['problems'].items() if entry['status'] == 'accepted_local' and ledger['released'].get(pid, {}).get('candidate') != entry.get('candidate')}
    accepted = publisher._reviewed(repo, state, registry, BASE, prospective)
    ids = [pid for pid in state['queue'] if pid in accepted and ledger['released'].get(pid, {}).get('digest') != accepted[pid]['digest']]
    require(len(ids) == 19, 'Digest-qualified eligible count differs from19')
    return ids


def quarantine(repo, archive, files, receipt):
    mapping = []
    # All bytes and the complete mapping are durable before any original is removed.
    for rel, digest in files.items():
        src = safe(repo, rel)
        data = src.read_bytes()
        require(sha(data) == digest, 'Quarantine source changed')
        dst = safe(archive / 'partial-fix', rel)
        durable(dst, data)
        require(sha(dst.read_bytes()) == digest, 'Quarantine copy integrity failure')
        mapping.append({'path': rel, 'sha256': digest})
    write_json(archive / 'quarantine-map.json', mapping)
    receipt['quarantine_map_sha256'] = sha((archive / 'quarantine-map.json').read_bytes())
    write_json(archive / 'receipt.json', receipt, replace=True)
    receipt['removed'] = []
    for item in mapping:
        src = safe(repo, item['path'])
        dst = safe(archive / 'partial-fix', item['path'])
        require(sha(src.read_bytes()) == sha(dst.read_bytes()) == item['sha256'], 'Quarantine verification failed before removal')
        src.unlink()
        fsync_dir(src.parent)
        receipt['removed'].append(item['path'])
        write_json(archive / 'receipt.json', receipt, replace=True)


def transaction(repo, state_dir, archive, pins, manifest, old_tree, final_tree, payload, raw, ledger, ids):
    require(not archive.exists(), 'Archive already exists; no replay')
    archive.mkdir()
    fsync_dir(archive.parent)
    fsync_dir(archive)
    receipt = {'owner': OWNER, 'status': 'prepared', 'base': BASE, 'candidate': CANDIDATE,
               'review_revision': pins['review']['revision'], 'eligible': ids, 'launch_performed': False,
               'confirmed_prior_failure': 'Selected model is at capacity. Please try a different model.'}
    write_json(archive / 'receipt.json', receipt)
    try:
        durable(archive / 'progress-before.json', raw)
        durable(archive / 'releases-before.json', ledger)
        write_json(archive / 'pins.json', pins)
        write_json(archive / 'candidate-manifest.json', manifest)
        for files in pins['runtime']['run_files'].values():
            for path, digest in files.items():
                data = safe(state_dir, path).read_bytes()
                require(sha(data) == digest, 'Run changed before backup')
                durable(safe(archive / 'run-backup', path), data)
        quarantine(repo, archive, pins['runtime']['quarantine'], receipt)
        require(not git(repo, 'status', '--porcelain=v1', '--untracked-files=all').strip(), 'Quarantine did not yield clean checkout')
        require(git(repo, 'rev-parse', 'HEAD').decode().strip() == BASE and tree(repo, 'HEAD') == old_tree, 'Base changed before payload')
        require((state_dir / 'progress.json').read_bytes() == raw and (state_dir / 'releases.json').read_bytes() == ledger, 'State changed before payload')
        for path, data in payload.items():
            item = pins['payload_manifest']['files'][path]
            target = safe(repo, path)
            require((not target.exists()) if item['before'] is None else target.is_file() and sha(target.read_bytes()) == item['before_sha256'], 'Target old bytes differ')
            durable(target, data, replace=target.exists())
        receipt['status'] = 'payload-written'
        write_json(archive / 'receipt.json', receipt, replace=True)
        git(repo, 'add', '--', *sorted(payload))
        staged_tree = git(repo, 'write-tree').decode().strip()
        require(tree(repo, staged_tree) == final_tree, 'Staged full tree differs from reviewed payload')
        for name, digest in manifest['protected'].items():
            require(sha((repo / 'leetcode/1092' / name).read_bytes()) == digest, 'Protected live bytes changed')
        # Respect normal hooks. Any failed hook leaves evidence/staging for inspection.
        git(repo, 'commit', '-m', 'Adopt reviewed #1092 header repair pending ordinary campaign fix/review\n\nSource-Candidate: ' + CANDIDATE + '\nSource-Review: ' + pins['review']['revision'] + '\nCampaign-Status: changes_required\nRequired-Open: 1092-R1\nBuilt-By: Codex author_854_bridge (exact model identifier unavailable); adoption by guarded operator\nVerified-By: independent Codex review_1092_header local review; central review pending')
        head = git(repo, 'rev-parse', 'HEAD').decode().strip()
        receipt.update(status='committed-before-state-checkpoint', adopted_head=head)
        write_json(archive / 'receipt.json', receipt, replace=True)
        require(tree(repo, head) == final_tree and not git(repo, 'status', '--porcelain=v1', '--untracked-files=all').strip(), 'Committed tree/worktree differs')
        require((state_dir / 'progress.json').read_bytes() == raw and (state_dir / 'releases.json').read_bytes() == ledger, 'State changed before checkpoint')
        after = json.loads(raw)
        after['expected_head'] = head
        write_json(archive / 'progress-proposed.json', after)
        write_json(state_dir / 'progress.json', after, replace=True)
        actual = json.loads((state_dir / 'progress.json').read_bytes())
        expected = copy.deepcopy(json.loads(raw))
        expected['expected_head'] = head
        require(actual == expected and (state_dir / 'releases.json').read_bytes() == ledger, 'Checkpoint changed unrelated state')
        durable(archive / 'progress-after.json', (state_dir / 'progress.json').read_bytes())
        receipt.update(status='completed-adopted-no-launch', state_change='expected_head only', ledger_preserved=True, required_open=['1092-R1'])
        write_json(archive / 'receipt.json', receipt, replace=True)
        return receipt
    except BaseException as error:
        receipt.update(status='failed-inspect-no-retry', error=str(error))
        write_json(archive / 'receipt.json', receipt, replace=True)
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dispatch', required=True)
    parser.add_argument('--pins', type=Path, required=True)
    parser.add_argument('--candidate-manifest', type=Path, required=True)
    args = parser.parse_args()
    require(args.dispatch == TOKEN and PINS_SHA is not None, 'Disabled pending final review and separate root authorization')
    rawpins = args.pins.read_bytes()
    require(sha(rawpins) == PINS_SHA, 'Pins bytes differ')
    pins = json.loads(rawpins)
    manifest_raw = args.candidate_manifest.read_bytes()
    require(sha(manifest_raw) == pins['candidate_manifest_sha256'], 'Candidate manifest hash differs')
    manifest = json.loads(manifest_raw)
    ready(pins, manifest)
    os.environ['PATH'] = '/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin'
    locks = []
    try:
        for path in (STATE / 'runner.lock', REPO / '.git/leetcode-campaign.lock', STATE / 'release.lock'):
            lock = path.open('r+b')
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            locks.append(lock)
        no_workers(REPO)
        raw, ledger = snapshot_guard(REPO, STATE, pins)
        old, final, payload = validate_source(REPO, pins, manifest)
        ids = eligible(REPO, STATE, pins)
        require(snapshot_guard(REPO, STATE, pins) == (raw, ledger), 'Preflight drift')
        no_workers(REPO)
        result = transaction(REPO, STATE, STATE / OWNER, pins, manifest, old, final, payload, raw, ledger, ids)
        print(json.dumps(result))
    finally:
        for lock in reversed(locks):
            lock.close()


if __name__ == '__main__':
    main()

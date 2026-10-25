"""One-time, guarded static route migration; receipts contain hashes, never backups.

Run prepare, then apply on the Pi. The stage comes from build_leetcode_static.py
at a pushed revision. Public verification is a separate required release gate.
"""
import argparse
import datetime
import fcntl
import hashlib
import json
import os
import subprocess
from pathlib import Path
import tempfile

ROOT = Path('/home/songyy/projects/visual-site')
STATE = Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
REPO = Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
BASELINES = {'index.html': '5c2fd1c30fee38137595f1599465970696c30fdf58ea687894741be508a49053',
             'leetcode/index.html': '06f7bb1cee1dea73a4817091d0f2e098fc87a5ea0b86c2acd170087c3621ac9b'}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def safe(root, name):
    path = root / name
    if not name or '\\' in name or '..' in Path(name).parts or Path(name).is_absolute():
        raise ValueError(name)
    if path.is_symlink() or not path.resolve().is_relative_to(root.resolve()):
        raise ValueError(name)
    parent = path.parent
    while parent != root:
        if parent.is_symlink():
            raise ValueError(name)
        parent = parent.parent
    return path


def save(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix='.static-new-', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(name, 0o644)
        os.replace(name, path)
        descriptor = os.open(path.parent, os.O_RDONLY)
        try:
            os.fsync(descriptor)
        finally:
            os.close(descriptor)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def inventory(excluded):
    return {str(p.relative_to(ROOT)): sha(p) for p in ROOT.rglob('*')
            if p.is_file() and str(p.relative_to(ROOT)) not in excluded}


parser = argparse.ArgumentParser()
parser.add_argument('mode', choices=['prepare', 'apply'])
parser.add_argument('--stage', type=Path, required=True)
parser.add_argument('--manifest-sha256', required=True)
args = parser.parse_args()
stage = args.stage.resolve()
if stage.is_relative_to(ROOT) or not stage.is_relative_to(STATE):
    raise SystemExit('Staging must be outside production and inside campaign state')
manifest_path = stage / 'static-manifest.json'
assert sha(manifest_path) == args.manifest_sha256, 'Stage manifest changed'
manifest = json.loads(manifest_path.read_text())
assert len(manifest['ids']) == 120 and len(set(manifest['ids'])) == 120
assert manifest['builder'] == 'codex-static-v1'
receipt_path = STATE / 'static-codex-migration-20261025.json'
lock_path = Path(subprocess.check_output(['git', 'rev-parse', '--git-path', 'leetcode-campaign.lock'], cwd=REPO, text=True).strip())
if not lock_path.is_absolute():
    lock_path = REPO / lock_path
with lock_path.open('a') as checkout, (STATE / 'runner.lock').open('a') as runner, (STATE / 'release.lock').open('a') as release:
    fcntl.flock(checkout, fcntl.LOCK_EX | fcntl.LOCK_NB)
    fcntl.flock(runner, fcntl.LOCK_EX | fcntl.LOCK_NB)
    fcntl.flock(release, fcntl.LOCK_EX | fcntl.LOCK_NB)
    progress = json.loads((STATE / 'progress.json').read_text())
    ledger = json.loads((STATE / 'releases.json').read_text())
    assert progress.get('current') is None and progress['status'] == 'run_limit_reached'
    assert ledger['pending'] is None and (STATE / 'STOP').is_file()
    assert json.loads((STATE / 'STOP').read_text())['owner'] == 'root-import803805-20261025'
    actual_head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=REPO, text=True).strip()
    assert actual_head == progress['expected_head']
    assert not subprocess.check_output(['git', 'status', '--porcelain', '--untracked-files=all'], cwd=REPO, text=True).strip()
    assert ledger['registry_sha256'] == sha(ROOT / 'leetcode/problems.config.js')
    assert ledger['registry_sha256'] == manifest['files']['leetcode/problems.config.js']
    for name, digest in manifest['files'].items():
        assert sha(safe(stage, name)) == digest, name
        safe(ROOT, name)
    if args.mode == 'prepare':
        assert not receipt_path.exists(), 'Reuse the existing migration receipt with apply'
        before = {}
        originals = {p: digest for paths in manifest['source_runtime'].values() for p, digest in paths.items()}
        for name, digest in manifest['files'].items():
            target = safe(ROOT, name)
            actual = sha(target) if target.is_file() else None
            expected = BASELINES.get(name, originals.get(name, digest))
            if actual is None:
                assert '-codex/' in name or name == 'leetcode/problems.codex.config.js', name
            else:
                assert actual == expected, 'Unexpected production bytes: ' + name
            before[name] = actual
        receipt = {'version': 1, 'status': 'prepared', 'source_revision': manifest['source_revision'],
                   'manifest_sha256': args.manifest_sha256, 'stage': str(stage),
                   'progress_sha256': sha(STATE / 'progress.json'),
                   'ledger_sha256': sha(STATE / 'releases.json'), 'expected_head': progress['expected_head'],
                   'accepted': ledger['released'], 'files': manifest['files'], 'before': before,
                   'protected': inventory(set(manifest['files'])),
                   'prepared_at': datetime.datetime.now(datetime.timezone.utc).isoformat()}
        save(receipt_path, (json.dumps(receipt, indent=2) + '\n').encode())
    else:
        receipt = json.loads(receipt_path.read_text())
        assert receipt['manifest_sha256'] == args.manifest_sha256 and receipt['stage'] == str(stage)
        assert receipt['progress_sha256'] == sha(STATE / 'progress.json')
        assert receipt['ledger_sha256'] == sha(STATE / 'releases.json')
        assert receipt['protected'] == inventory(set(manifest['files']))
        for name, digest in manifest['files'].items():
            target = safe(ROOT, name)
            actual = sha(target) if target.is_file() else None
            assert actual in (receipt['before'][name], digest), name
        # All physical version assets first; legacy redirects next; discovery last.
        def order(name):
            if name in ('index.html', 'leetcode/index.html'):
                return (3, name)
            if name.endswith('/index.html') and '-codex/' not in name:
                return (2, name)
            return (0, name)
        for name in sorted(manifest['files'], key=order):
            target = safe(ROOT, name)
            if target.is_file() and sha(target) == manifest['files'][name]:
                continue
            save(target, safe(stage, name).read_bytes())
        assert all(sha(safe(ROOT, p)) == digest for p, digest in manifest['files'].items())
        assert receipt['protected'] == inventory(set(manifest['files']))
        assert receipt['ledger_sha256'] == sha(STATE / 'releases.json')
        assert receipt['progress_sha256'] == sha(STATE / 'progress.json')
        receipt['status'] = 'origin-applied-public-verification-pending'
        receipt['applied_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        save(receipt_path, (json.dumps(receipt, indent=2) + '\n').encode())
print(json.dumps({'status': receipt['status'], 'files': len(manifest['files']),
                  'lessons': len(manifest['ids']), 'receipt': str(receipt_path)}))

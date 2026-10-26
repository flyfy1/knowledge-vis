"""One authorized verified transfer/fetch/dispatch; never retries the adapter."""
import base64
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import types

inputs = json.load(sys.stdin)
expected = {
    'adopt-enabled.py': '10445c4e33fe64f479ddb3d0089c63e44043fb744a5903260bfb11db28aaeee3',
    'final-pins.json': '89440012068e76795ce17050844d51eaeded6451e297f8c0f12413a9f49dd162',
    'candidate-manifest.json': '586d66c8d9a1f0bef4fe25faab1374d9e6b66ea98dde0c9b51b67bfa5164f5a4',
}
files = {name: base64.b64decode(value) for name, value in inputs.items()}
assert set(files) == set(expected)
assert all(hashlib.sha256(files[name]).hexdigest() == digest for name, digest in expected.items())
a = types.ModuleType('approved_adoption')
exec(compile(files['adopt-enabled.py'], 'approved-adopt-enabled.py', 'exec'), a.__dict__)
pins = json.loads(files['final-pins.json'])
manifest = json.loads(files['candidate-manifest.json'])
a.ready(pins, manifest)
D = a.STATE / '1092-header-adoption-dispatch-20261026'
receipt = {'status': 'preflight', 'started_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'operator_sha256': expected['adopt-enabled.py'], 'inputs': expected,
           'fetch_ref': pins['review']['ref'], 'expected_source_revision': pins['review']['revision'],
           'adapter_invocations': 0, 'launch_performed': False}
locks = []
try:
    for path in (a.STATE / 'runner.lock', a.REPO / '.git/leetcode-campaign.lock', a.STATE / 'release.lock'):
        lock = path.open('r+b')
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        locks.append(lock)
    a.no_workers(a.REPO)
    state, ledger = a.snapshot_guard(a.REPO, a.STATE, pins)
    a.require(not (a.STATE / a.OWNER).exists(), 'Adoption archive exists; refuse replay')
    remote = a.git(a.REPO, 'ls-remote', 'origin', pins['review']['ref']).decode().strip()
    a.require(remote.split()[0] == pins['review']['revision'], 'Source remote changed')
    a.require(not D.exists(), 'External dispatch directory exists; refuse replay')
    D.mkdir()
    a.fsync_dir(D.parent)
    a.fsync_dir(D)
    receipt.update(status='source-transfer-prepared', before_head=a.git(a.REPO, 'rev-parse', 'HEAD').decode().strip(),
                   before_state_sha256=a.sha(state), before_ledger_sha256=a.sha(ledger), source_remote=remote)
    a.write_json(D / 'source-transfer.json', receipt)
    for name, data in files.items():
        a.durable(D / name, data)
        a.require(a.sha((D / name).read_bytes()) == expected[name], 'Remote transferred hash mismatch')
    fetched = subprocess.run(['git', '-C', str(a.REPO), 'fetch', '--no-tags', 'origin', pins['review']['ref']], capture_output=True)
    a.durable(D / 'fetch.stdout', fetched.stdout)
    a.durable(D / 'fetch.stderr', fetched.stderr)
    a.require(fetched.returncode == 0, 'Source fetch failed; no retry')
    a.require(a.git(a.REPO, 'rev-parse', 'FETCH_HEAD').decode().strip() == pins['review']['revision'], 'Fetched ref drift')
    a.require(a.snapshot_guard(a.REPO, a.STATE, pins) == (state, ledger), 'State changed during source fetch')
    a.no_workers(a.REPO)
    receipt.update(status='source-transfer-completed', git_object_write=True, head_state_ledger_unchanged=True,
                   completed_at=datetime.datetime.now(datetime.timezone.utc).isoformat())
    a.write_json(D / 'source-transfer.json', receipt, replace=True)
    for lock in reversed(locks):
        lock.close()
    locks = []
    receipt.update(status='dispatching-once', adapter_invocations=1)
    a.write_json(D / 'dispatch-receipt.json', receipt)
    with (D / 'adapter.stdout').open('xb') as out, (D / 'adapter.stderr').open('xb') as err:
        child = subprocess.Popen([sys.executable, '-B', str(D / 'adopt-enabled.py'), '--dispatch', a.TOKEN,
                                  '--pins', str(D / 'final-pins.json'), '--candidate-manifest', str(D / 'candidate-manifest.json')],
                                 cwd=Path.home(), stdin=subprocess.DEVNULL, stdout=out, stderr=err, start_new_session=True)
    receipt.update(status='adapter-started', adapter_pid=child.pid)
    a.write_json(D / 'dispatch-receipt.json', receipt, replace=True)
    print(json.dumps(receipt), flush=True)
except BaseException as error:
    receipt.update(status='failed-inspect-no-retry', error=str(error))
    if D.exists():
        a.write_json(D / 'dispatch-failure.json', receipt)
    print(json.dumps(receipt), flush=True)
    raise
finally:
    for lock in reversed(locks):
        lock.close()

"""One authorized ordinary launch after completed reviewed adoption."""
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import types

S = Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
R = Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
D = S / '1092-header-adoption-dispatch-20261026'
A = S / '1092-header-adoption-20261026'
OUT = S / '1092-adopted-native-recovery-20261026'
HEAD = 'b1c876fa0209e93f4bae8c0253b2928d825f419f'
sha = lambda b: hashlib.sha256(b).hexdigest()
code = (D / 'adopt-enabled.py').read_bytes()
assert sha(code) == '10445c4e33fe64f479ddb3d0089c63e44043fb744a5903260bfb11db28aaeee3'
a = types.ModuleType('reviewed_adoption')
exec(compile(code, str(D / 'adopt-enabled.py'), 'exec'), a.__dict__)
pinraw = (D / 'final-pins.json').read_bytes()
assert sha(pinraw) == '89440012068e76795ce17050844d51eaeded6451e297f8c0f12413a9f49dd162'
pins = json.loads(pinraw)
post = json.load(sys.stdin)
receipt = {'status': 'preflight', 'started_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'head': HEAD, 'launch_invocations': 0, 'owner': OUT.name}
locks = []
try:
    for path in (S / 'runner.lock', R / '.git/leetcode-campaign.lock', S / 'release.lock'):
        lock = path.open('r+b')
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        locks.append(lock)
    a.no_workers(R)
    a.require(not (S / 'STOP').exists() and not OUT.exists(), 'STOP or previous recovery archive exists')
    state_raw = (S / 'progress.json').read_bytes()
    ledger_raw = (S / 'releases.json').read_bytes()
    state, ledger = json.loads(state_raw), json.loads(ledger_raw)
    a.require(sha(state_raw) == post['progress_after_sha256'] and sha(ledger_raw) == post['ledger_sha256'], 'Post-adoption state/ledger drift')
    a.require(a.git(R, 'rev-parse', 'HEAD').decode().strip() == state['expected_head'] == HEAD, 'Adopted HEAD differs')
    a.require(a.git(R, 'ls-remote', 'origin', 'refs/heads/codex/all-hard-20261018').decode().split()[0] == HEAD, 'Exact adopted HEAD not pushed')
    a.require(not a.git(R, 'status', '--porcelain=v1', '--untracked-files=all').strip(), 'Dirty checkout')
    adoption_raw = (A / 'receipt.json').read_bytes()
    a.require(sha(adoption_raw) == '15f8c89e2344760cefdf492b7d2d3c7a2a6699aafa8c1fe479ed7d80935b3370', 'Adoption receipt changed')
    adoption = json.loads(adoption_raw)
    a.require(adoption['status'] == 'completed-adopted-no-launch' and adoption['adopted_head'] == HEAD, 'Adoption not complete')
    a.require(state['status'] == 'failed' and state['current']['run_id'] == '1092-fix-7beee2677431', 'Unexpected recovery phase')
    e = state['problems']['1092']
    a.require(e['status'] == 'changes_required' and e['phase'] == 'fix' and e['reviews'][-1]['required_open'] == ['1092-R1'], 'R1 state changed')
    a.require(len(state['queue']) == 984 and sha(json.dumps(state['queue'], separators=(',', ':')).encode()) == pins['runtime']['queue_sha256'], 'Queue changed')
    for path, digest in pins['runtime']['policy'].items():
        a.require(sha((R / path).read_bytes()) == digest, 'Policy drift before import')
    a.require(sha((S / 'launch.py').read_bytes()) == pins['runtime']['launcher_sha256'], 'Launcher changed')
    reservations = {p.name: sha(p.read_bytes()) for p in S.glob('lane-*-reservation.json')}
    a.require(reservations == pins['runtime']['reservations'] and all(json.loads((S / name).read_bytes())['status'] in ('imported', 'cancelled', 'canceled') for name in reservations), 'Lane reservation changed/active')
    a.require(not subprocess.check_output(['ss', '-H', '-ltn', 'sport = :18770']).strip(), 'Preview port already occupied')
    a.require(ledger['pending'] is None, 'Pending publication')
    os.environ['PATH'] = '/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin'
    sys.dont_write_bytecode = True
    sys.path.insert(0, str(R / 'scripts'))
    import leetcode_publish as publisher
    registry = {str(x['id']): x for x in publisher.read_registry(R / 'leetcode/problems.config.js')}
    prospective = {pid for pid, item in state['problems'].items() if item['status'] == 'accepted_local' and ledger['released'].get(pid, {}).get('candidate') != item.get('candidate')}
    accepted = publisher._reviewed(R, state, registry, HEAD, prospective)
    eligible = [pid for pid in state['queue'] if pid in accepted and ledger['released'].get(pid, {}).get('digest') != accepted[pid]['digest']]
    a.require(len(eligible) == 19, 'Eligibility differs from19')
    a.require((S / 'progress.json').read_bytes() == state_raw and (S / 'releases.json').read_bytes() == ledger_raw, 'Read-only preflight changed state')
    a.no_workers(R)
    OUT.mkdir()
    a.fsync_dir(OUT.parent)
    a.fsync_dir(OUT)
    receipt.update(status='ready-no-launch-yet', before_state_sha256=sha(state_raw), before_ledger_sha256=sha(ledger_raw),
                   before_run_count=len(state['runs']), policy=pins['runtime']['policy'],
                   launcher_sha256=pins['runtime']['launcher_sha256'], eligible=eligible,
                   adoption_receipt_sha256=sha(adoption_raw))
    a.durable(OUT / 'progress-before.json', state_raw)
    a.durable(OUT / 'releases-before.json', ledger_raw)
    a.durable(OUT / 'adoption-receipt.json', adoption_raw)
    a.write_json(OUT / 'receipt.json', receipt)
    for lock in reversed(locks):
        lock.close()
    locks = []
    receipt.update(status='launching-once', launch_invocations=1)
    a.write_json(OUT / 'receipt.json', receipt, replace=True)
    launched = subprocess.run([sys.executable, str(S / 'launch.py'), '--continuous', '--max-rounds', '6'], capture_output=True, text=True)
    a.durable(OUT / 'launch.stdout', launched.stdout.encode())
    a.durable(OUT / 'launch.stderr', launched.stderr.encode())
    a.require(launched.returncode == 0, 'Launch wrapper failed; preserve handle/no retry')
    receipt.update(status='launched-awaiting-fresh-fix', launch=json.loads(launched.stdout))
    a.write_json(OUT / 'receipt.json', receipt, replace=True)
    print(json.dumps(receipt), flush=True)
except BaseException as error:
    receipt.update(status='failed-inspect-no-retry', error=str(error))
    if OUT.exists():
        a.write_json(OUT / 'failure.json', receipt)
    print(json.dumps(receipt), flush=True)
    raise
finally:
    for lock in reversed(locks):
        lock.close()

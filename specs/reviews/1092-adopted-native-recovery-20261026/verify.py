import base64
import datetime
import hashlib
import json
import os
from pathlib import Path

S = Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
A = S / '1092-adopted-native-recovery-20261026'
R = Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
receipt = json.loads((A / 'receipt.json').read_bytes())
before = json.loads((A / 'progress-before.json').read_bytes())
raw = (S / 'progress.json').read_bytes()
state = json.loads(raw)
run = state['runs'][-1]
event_bytes = (Path(run['directory']) / 'events.jsonl').read_bytes()
events = [json.loads(line) for line in event_bytes.splitlines()]
threads = [e['thread_id'] for e in events if e.get('type') == 'thread.started']
pids = [2481309, 2481703, 2481710]
processes = []
for pid in pids:
    p = Path('/proc', str(pid))
    argv = [x.decode() for x in (p / 'cmdline').read_bytes().split(b'\0') if x]
    ppid = int(next(line for line in (p / 'status').read_text().splitlines() if line.startswith('PPid:')).split()[1])
    processes.append({'pid': pid, 'ppid': ppid, 'cwd': os.readlink(p / 'cwd'), 'argv': argv})
allowed_fields = {'status', 'current', 'error', 'updated_at', 'runs'}
changed = {k for k in before.keys() | state.keys() if before.get(k) != state.get(k)}
checks = {
    'running_with_live_returned_runner': state['status'] == 'running' and receipt['launch']['pid'] == pids[0],
    'fresh_fix_role_problem_candidate': run['id'] == state['current']['run_id'] == '1092-fix-ed3a9cb6052d' and run['role'] == state['current']['stage'] == 'fix' and run['problem_id'] == state['current']['problem_id'] == '1092' and run['candidate'] == before['expected_head'],
    'fresh_session_and_turn': len(threads) == 1 and not any(threads[0] in old['session_ids'] for old in before['runs']) and any(e.get('type') == 'turn.started' for e in events),
    'all_old_runs_exact_prefix': state['runs'][:-1] == before['runs'],
    'problem_histories_exact': state['problems'] == before['problems'],
    'only_ordinary_runner_fields_changed': changed <= allowed_fields,
    'queue984_exact': state['queue'] == before['queue'] and len(state['queue']) == 984,
    'ledger_bytes_preserved': (S / 'releases.json').read_bytes() == (A / 'releases-before.json').read_bytes(),
    'native_ancestry': processes[2]['ppid'] == processes[1]['pid'] and processes[1]['ppid'] == processes[0]['pid'],
    'native_cwd_output': processes[2]['cwd'] == str(R) and str(Path(run['directory']) / 'final.json') in processes[2]['argv'],
    'max6_every20': '--max-rounds' in processes[0]['argv'] and processes[0]['argv'][processes[0]['argv'].index('--max-rounds') + 1] == '6' and processes[0]['argv'][processes[0]['argv'].index('--publish-every') + 1] == '20',
    'same_model': processes[2]['argv'][processes[2]['argv'].index('-m') + 1] == 'gpt-6.1-sol',
    'no_stop': not (S / 'STOP').exists(),
}
assert all(checks.values()), checks
proof = {'observed_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'checks': checks,
         'current': state['current'], 'thread_ids': threads, 'processes': processes,
         'changed_top_fields': sorted(changed), 'event_types': [e['type'] for e in events],
         'event_count': len(events), 'scope': 'Fresh native fix startup only; no acceptance, publication or capacity guarantee'}
receipt.update(status='completed-fresh-native-fix-running', proof=proof)
temp = A / 'receipt.tmp'
with temp.open('x') as f:
    f.write(json.dumps(receipt, indent=2) + '\n')
    f.flush()
    os.fsync(f.fileno())
os.replace(temp, A / 'receipt.json')
fd = os.open(A, os.O_RDONLY)
os.fsync(fd)
os.close(fd)
files = {name: base64.b64encode(path.read_bytes()).decode() for name, path in {
    'receipt.json': A / 'receipt.json', 'progress-before.json': A / 'progress-before.json',
    'progress-after.json': S / 'progress.json', 'releases-before.json': A / 'releases-before.json',
    'launch.stdout': A / 'launch.stdout', 'launch.stderr': A / 'launch.stderr',
}.items()}
files['fresh-events.jsonl'] = base64.b64encode(event_bytes).decode()
proof['file_sha256'] = {name: hashlib.sha256(base64.b64decode(value)).hexdigest() for name, value in files.items()}
print(json.dumps({'proof': proof, 'files': files}))

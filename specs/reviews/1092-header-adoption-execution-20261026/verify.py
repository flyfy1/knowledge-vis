import base64
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess

R = Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
S = Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
A = S / '1092-header-adoption-20261026'
D = S / '1092-header-adoption-dispatch-20261026'
sha = lambda data: hashlib.sha256(data).hexdigest()
def git(*args):
    return subprocess.check_output(['git', '-C', str(R), *args]).decode().strip()

receipt = json.loads((A / 'receipt.json').read_bytes())
pins = json.loads((D / 'final-pins.json').read_bytes())
manifest = json.loads((D / 'candidate-manifest.json').read_bytes())
before_raw = (A / 'progress-before.json').read_bytes()
after_raw = (S / 'progress.json').read_bytes()
before = json.loads(before_raw)
after = json.loads(after_raw)
ledger = (S / 'releases.json').read_bytes()
head = git('rev-parse', 'HEAD')
expected = dict(before)
expected['expected_head'] = head
quarantine = json.loads((A / 'quarantine-map.json').read_bytes())
checks = {
    'receipt_completed_no_launch': receipt['status'] == 'completed-adopted-no-launch' and receipt['launch_performed'] is False,
    'adapter_exited': not Path('/proc/2478586').exists(),
    'head_checkpoint_matches': head == receipt['adopted_head'] == after['expected_head'],
    'full_tree_equals_reviewed_source': git('rev-parse', head + '^{tree}') == git('rev-parse', pins['review']['revision'] + '^{tree}'),
    'clean_worktree': git('status', '--porcelain=v1', '--untracked-files=all') == '',
    'exact94changed_paths': set(git('diff', '--name-only', pins['base'], head).splitlines()) == set(pins['payload_manifest']['files']) and len(pins['payload_manifest']['files']) == 94,
    'six_protected_hashes': all(sha((R / 'leetcode/1092' / name).read_bytes()) == digest for name, digest in manifest['protected'].items()),
    'all94payload_live_hashes': all(sha((R / path).read_bytes()) == item['after_sha256'] for path, item in pins['payload_manifest']['files'].items()),
    'before_state_exact_pin': sha(before_raw) == pins['runtime']['state_sha256'],
    'only_expected_head_changed': after == expected,
    'all_problem_history_preserved': after['problems'] == before['problems'] and after['runs'] == before['runs'],
    'failed_current_error_retained': all(after.get(k) == before.get(k) for k in ('status', 'current', 'error')),
    'open_r1_retained': after['problems']['1092']['reviews'][-1]['required_open'] == ['1092-R1'] and after['problems']['1092']['status'] == 'changes_required',
    'ledger_exact_and_no_pending': ledger == (A / 'releases-before.json').read_bytes() and sha(ledger) == pins['runtime']['ledger_sha256'] and json.loads(ledger)['pending'] is None,
    'exact19quarantine_map': {x['path']: x['sha256'] for x in quarantine} == pins['runtime']['quarantine'] and len(quarantine) == 19,
    'all19archive_hashes_and_originals_absent': all(sha((A / 'partial-fix' / x['path']).read_bytes()) == x['sha256'] and not (R / x['path']).exists() for x in quarantine),
    'quarantine_map_receipt_binding': sha((A / 'quarantine-map.json').read_bytes()) == receipt['quarantine_map_sha256'],
    'run_backup_and_live_bytes_preserved': all(sha((S / path).read_bytes()) == sha((A / 'run-backup' / path).read_bytes()) == digest for files in pins['runtime']['run_files'].values() for path, digest in files.items()),
    'runtime_policy_unchanged': all(sha((R / path).read_bytes()) == digest for path, digest in pins['runtime']['policy'].items()),
    'launcher_unchanged': sha((S / 'launch.py').read_bytes()) == pins['runtime']['launcher_sha256'],
    'no_stop': not (S / 'STOP').exists(),
}
processes = []
for p in Path('/proc').glob('[0-9]*'):
    try:
        if int(p.name) == os.getpid():
            continue
        argv = [x.decode(errors='replace') for x in (p / 'cmdline').read_bytes().split(b'\0') if x]
        cwd = os.readlink(p / 'cwd')
        if cwd == str(R) or cwd.startswith('/home/songyy/projects/leetcode-hard-lane-') or any(Path(x).name == 'leetcode_campaign.py' for x in argv):
            processes.append({'pid': int(p.name), 'argv': argv, 'cwd': cwd})
    except (FileNotFoundError, PermissionError, ProcessLookupError):
        pass
checks['no_campaign_or_lane_workers'] = not processes
proof = {'observed_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'checks': checks,
         'head': head, 'source_review': pins['review']['revision'], 'source_candidate': pins['candidate'],
         'tree': git('rev-parse', 'HEAD^{tree}'), 'current': after['current'], 'status': after['status'],
         'released_count': len(json.loads(ledger)['released']), 'eligible': receipt['eligible'],
         'progress_before_sha256': sha(before_raw), 'progress_after_sha256': sha(after_raw),
         'ledger_sha256': sha(ledger), 'processes': processes, 'commit': git('show', '-s', '--format=fuller', 'HEAD')}
assert all(checks.values()), checks
files = {}
for name, path in {
    'adoption-receipt.json': A / 'receipt.json', 'source-transfer.json': D / 'source-transfer.json',
    'dispatch-receipt.json': D / 'dispatch-receipt.json', 'quarantine-map.json': A / 'quarantine-map.json',
    'adapter.stdout': D / 'adapter.stdout', 'adapter.stderr': D / 'adapter.stderr',
    'fetch.stdout': D / 'fetch.stdout', 'fetch.stderr': D / 'fetch.stderr',
    'progress-before.json': A / 'progress-before.json', 'progress-after.json': S / 'progress.json',
    'releases.json': S / 'releases.json',
}.items():
    files[name] = base64.b64encode(path.read_bytes()).decode()
proof['copied_file_sha256'] = {name: sha(base64.b64decode(data)) for name, data in files.items()}
print(json.dumps({'proof': proof, 'files': files}))

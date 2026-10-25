"""Finish the owned 903/920 STOP transaction through the existing guarded importer."""
from pathlib import Path
import contextlib
import fcntl
import hashlib
import json
import os
import signal
import subprocess
import sys
import time

ROOT = Path('/home/songyy/projects')
REPO = ROOT / 'leetcode-hard-campaign-20261018'
STATE = ROOT / 'leetcode-hard-campaign-state-20261018'
OWNER = 'campaign-runner-import903920-20261026-f17200ef'
RECEIPT = STATE / (OWNER + '.json')
IDS = ('903', '920')
os.environ.update(
    PATH='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin',
    NODE_PATH='/home/songyy/projects/integ-games/node_modules',
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome',
    PYTHONDONTWRITEBYTECODE='1')
sys.path.insert(0, str(REPO / 'scripts'))
import import_leetcode_lane as imp
from leetcode_campaign import TERMINAL


def read(path):
    return json.loads(path.read_text())


def digest(data):
    return hashlib.sha256(data).hexdigest()


def object_hash(value):
    return digest(json.dumps(value, sort_keys=True, separators=(',', ':')).encode())


def owned_stop():
    raw = (STATE / 'STOP').read_bytes()
    imp.require(json.loads(raw)['owner'] == OWNER, 'STOP ownership changed')
    return raw


def git(*args):
    return imp.git(REPO, *args)


def census():
    result = []
    for path in Path('/proc').iterdir():
        if not path.name.isdecimal():
            continue
        try:
            args = [part.decode() for part in (path / 'cmdline').read_bytes().split(b'\0') if part]
        except OSError:
            continue
        if len(args) > 1 and args[1].endswith('/scripts/leetcode_campaign.py'):
            result.append({'pid': int(path.name), 'args': args})
    return result


def main():
    record = read(RECEIPT)
    imp.require(record['owner'] == OWNER and record['status'] == 'stop_requested',
                'Unexpected transaction state; inspect rather than retry')
    stop_raw = owned_stop()
    stop_removed = False
    locked = False
    try:
        with (STATE / (OWNER + '.lock')).open('a') as operator:
            fcntl.flock(operator, fcntl.LOCK_EX | fcntl.LOCK_NB)
            locked = True
            record.update(status='waiting_for_central_boundary', operator_started_at=imp.now())
            imp.save_state(RECEIPT, record)
            # Every individual wait is short; the active agent is never signaled.
            deadline = time.monotonic() + 6000
            last = None
            while True:
                imp.require(owned_stop() == stop_raw, 'Owned STOP content changed')
                progress = read(STATE / 'progress.json')
                pid = int((STATE / 'runner.pid').read_text())
                alive = (Path('/proc') / str(pid)).exists()
                marker = (progress['status'], json.dumps(progress.get('current')), alive)
                if marker != last:
                    print(json.dumps({'waiting': progress['status'], 'current': progress.get('current'),
                                      'runner_pid': pid, 'runner_exists': alive}), flush=True)
                    last = marker
                if not alive:
                    imp.require(progress['status'] == 'stopped', 'Central exited without a clean STOP boundary')
                    break
                imp.require(progress['status'] != 'failed', 'Central failed; preserve STOP and inspect')
                imp.require(time.monotonic() < deadline, 'Boundary wait exceeded the existing agent time budget')
                time.sleep(5)

            imp.require(not census(), 'A campaign worker remains active')
            baseline = read(STATE / 'progress.json')
            imp.require(not git('status', '--porcelain', '--untracked-files=all'), 'Central checkout is dirty')
            imp.require(git('rev-parse', 'HEAD') == baseline['expected_head'], 'Central saved HEAD mismatch')
            ledger_raw = (STATE / 'releases.json').read_bytes()
            imp.require(json.loads(ledger_raw)['pending'] is None, 'Release ledger has a pending publication')
            record.update(status='importing', boundary_at=imp.now(), central_before=baseline['expected_head'],
                          prior_problems_sha256=object_hash(baseline['problems']),
                          prior_runs_sha256=object_hash(baseline['runs']), queue_sha256=object_hash(baseline['queue']),
                          ledger_sha256=digest(ledger_raw), imports=[])
            imp.save_state(RECEIPT, record)
            with (STATE / 'release.lock').open('r+') as release:
                fcntl.flock(release, fcntl.LOCK_EX | fcntl.LOCK_NB)
                for lesson in IDS:
                    imp.require(owned_stop() == stop_raw and not census(), 'Import ownership changed')
                    lane_repo = ROOT / f'leetcode-hard-lane-{lesson}-20261025'
                    lane_state = ROOT / f'leetcode-hard-lane-state-{lesson}-20261025'
                    lane = read(lane_state / 'progress.json')
                    imp.require(not (Path('/proc') / (lane_state / 'runner.pid').read_text().strip()).exists(),
                                'Lane runner reappeared')
                    expected = next(item for item in record['lanes'] if item['id'] == lesson)
                    imp.require(imp.head(lane_repo) == expected['lane_head'] and
                                lane['problems'][lesson]['candidate'] == expected['candidate'],
                                'Lane changed after independent acceptance preflight')
                    print('Importing independently accepted #' + lesson, flush=True)
                    # This reviewed interface owns all four checkout/state locks,
                    # original fingerprints, provenance validation and merge checks.
                    imported = imp.import_lane(REPO, STATE, lane_repo, lane_state, lesson)
                    after = read(STATE / 'progress.json')
                    imp.require(after['problems'][lesson] == lane['problems'][lesson], 'Imported acceptance differs')
                    record['imports'].append(imported)
                    imp.save_state(RECEIPT, record)
                    reservation_path = STATE / f'lane-{lesson}-reservation.json'
                    reservation = read(reservation_path)
                    imp.require(reservation['status'] == 'started' and reservation['repo'] == str(lane_repo),
                                'Unexpected reservation state')
                    importer_receipt = after['lane_imports'][-1]['receipt']
                    reservation.update(status='imported', imported_head=imported['merged_head'],
                                       import_receipt=importer_receipt)
                    imp.save_state(reservation_path, reservation)

                after = read(STATE / 'progress.json')
                final_head = git('rev-parse', 'HEAD')
                imp.require(final_head == after['expected_head'] and
                            not git('status', '--porcelain', '--untracked-files=all'), 'Imported HEAD is not clean/saved')
                imp.require(all(after['problems'].get(key) == value for key, value in baseline['problems'].items()),
                            'Existing problem records changed')
                imp.require(after['runs'][:len(baseline['runs'])] == baseline['runs'], 'Historical runs changed')
                imp.require(after['queue'] == baseline['queue'], 'Queue changed')
                imp.require((STATE / 'releases.json').read_bytes() == ledger_raw, 'Import altered release ledger')
                branch = git('branch', '--show-current')
                imp.require(branch == 'codex/all-hard-20261018', 'Unexpected central branch')
                git('push', 'origin', 'HEAD:refs/heads/' + branch)
                imp.require(git('ls-remote', 'origin', 'refs/heads/' + branch).split()[0] == final_head,
                            'Imported commit push not confirmed')
                record.update(status='imported-pushed-still-stopped', final_head=final_head,
                              accepted_local=sum(item['status'] == 'accepted_local' for item in after['problems'].values()),
                              released_count=len(json.loads(ledger_raw)['released']),
                              prior_problems_preserved=True, prior_runs_preserved=True,
                              queue_preserved=True, release_ledger_preserved=True)
                imp.save_state(RECEIPT, record)

            imp.require(owned_stop() == stop_raw and not census(), 'Ownership changed before resume')
            launcher = (STATE / 'launch.py').read_text()
            imp.require(launcher.count('"--publish-every","20"') == 1 and '"--publish-every","100"' not in launcher,
                        'External launcher publication threshold differs')
            expected_next = next(pid for pid in after['queue'] if after['problems'].get(pid, {}).get('status') not in TERMINAL)
            (STATE / 'STOP').unlink()
            stop_removed = True
            launched = json.loads(subprocess.check_output(
                [sys.executable, str(STATE / 'launch.py'), '--continuous', '--max-rounds', '6'], cwd=REPO, text=True))
            record.update(status='resumed-awaiting-observation', launch=launched)
            imp.save_state(RECEIPT, record)
            new_pid = launched['pid']
            imp.require(launched['continuous'] is True and launched['queue_count'] == len(baseline['queue']),
                        'Launcher changed queue selection')
            for _ in range(120):
                resumed = read(STATE / 'progress.json')
                imp.require((Path('/proc') / str(new_pid)).exists(), 'Resumed runner exited')
                if resumed['status'] == 'running' and (resumed.get('current') or {}).get('problem_id') == expected_next:
                    break
                time.sleep(0.5)
            live = next((worker for worker in census() if worker['pid'] == new_pid), None)
            imp.require(live is not None and len(census()) == 1, 'Single resumed runner not established')
            for flag, value in (('--publish-every', '20'), ('--max-rounds', '6'), ('--state-dir', str(STATE))):
                imp.require(live['args'].count(flag) == 1 and live['args'][live['args'].index(flag) + 1] == value,
                            'Live runner option differs')
            imp.require(resumed['status'] == 'running' and
                        (resumed.get('current') or {}).get('problem_id') == expected_next, 'Expected continuation not observed')
            imp.require(all(resumed['problems'][pid] == after['problems'][pid] for pid in IDS),
                        'Resumption changed imported acceptance')
            imp.require(resumed['queue'] == baseline['queue'] and
                        (STATE / 'releases.json').read_bytes() == ledger_raw, 'Resume reset queue or published below threshold')
            record.update(status='completed-resumed', completed_at=imp.now(), runner_pid=new_pid,
                          current=resumed['current'], stop_removed=True)
            imp.save_state(RECEIPT, record)
            print(json.dumps({'status': record['status'], 'head': final_head, 'runner_pid': new_pid,
                              'current': resumed['current'], 'receipt': str(RECEIPT)}), flush=True)
    except BaseException as error:
        if stop_removed and not (STATE / 'STOP').exists():
            with (STATE / 'STOP').open('x') as handle:
                handle.write(stop_raw.decode())
                handle.flush()
                os.fsync(handle.fileno())
        record.update(status='failed-preserved-owned-stop', error=str(error) or type(error).__name__,
                      failed_at=imp.now(), recovery='Do not reset or retry blindly. Inspect importer receipts, saved/actual HEAD and owned STOP before any manual continuation.')
        if locked:
            imp.save_state(RECEIPT, record)
        raise


if __name__ == '__main__':
    def interrupted(signum, _frame):
        raise KeyboardInterrupt(f'Received signal {signum}; active agents were not signaled')
    signal.signal(signal.SIGTERM, interrupted)
    main()

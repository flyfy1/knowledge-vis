"""One-time guarded Pi adoption. Do not run before ROOT's public-verified dispatch.

This copies an explicit reviewed policy allowlist; it never cherry-picks main,
resets the queue, edits lesson trees, or regenerates historical acceptance.
Failure leaves inspectable evidence and STOP in place (or restores the owned STOP
after a failed launch). This is deliberately not an automatic recovery loop.
"""
import argparse
import ast
import contextlib
import datetime as dt
import fcntl
import hashlib
import json
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
PRODUCTION = Path('/home/songyy/projects/visual-site')
SOURCE = 'eaf81f0713a59a1a5dea28885b3069bf81424f93'
PAYLOAD = '104f82ca86ab2e48b402c2ffacb3bc142acac2c6'
OLD_HEAD = 'e64356fbeaa7fb1c8793d1a8febcac4ae8e9e394'
BRANCH = 'codex/all-hard-20261018'
STOP_OWNER = 'root-import803805-20261025'
DISPATCH = 'root-public-verified-20261025'
MANIFEST = 'bda8463f23bbb6e56d03400481d066a07605c006fcff2571f2ba14ca926407f3'
OLD_ROOT = '50a4ef15a95de116bb0c9ffb6f7395cb22b99c167c5f78847812174e2ae78062'
OLD_LAUNCHER = '6646c725481e1ce8997fa528c676bc8e9dc102f1ed8aa7c361dca3db29ae7caf'
ALLOWLIST = (
    'index.html',
    'scripts/leetcode_static_versions.py',
    'scripts/build_leetcode_static.py',
    'scripts/leetcode_publish.py',
    'scripts/leetcode_campaign.py',
    'scripts/test_leetcode_static_versions.py',
    'scripts/test_leetcode_publish.py',
    'scripts/test_leetcode_publish_browser.py',
    'scripts/test_campaign_publication.py',
    'scripts/test_leetcode_collection.cjs',
    'tests/leetcode-home-section.cjs',
    'specs/leetcode-all-hard-campaign.md',
    'specs/leetcode-static-versions.md',
)
PROTECTED = ('leetcode', 'CONCEPT-MAP.md', 'specs/reviews')


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical(data):
    return sha(json.dumps(data, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode())


def timestamp():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def atomic(path, data):
    descriptor, name = tempfile.mkstemp(prefix='.adoption-', dir=path.parent)
    try:
        with os.fdopen(descriptor, 'wb') as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(name, 0o644)
        os.replace(name, path)
        directory = os.open(path.parent, os.O_RDONLY)
        try:
            os.fsync(directory)
        finally:
            os.close(directory)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def save(path, data):
    atomic(path, (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode())


def command(args, env=None, timeout=120, log=None):
    process = subprocess.Popen(args, cwd=REPO, env=env, stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE, start_new_session=True)
    try:
        stdout, stderr = process.communicate(timeout=timeout)
    except BaseException:
        with contextlib.suppress(ProcessLookupError):
            os.killpg(process.pid, signal.SIGKILL)
        process.wait()
        raise
    if log is not None:
        log.write_bytes(stdout + stderr)
    require(process.returncode == 0,
            f'Command failed ({process.returncode}): {args[0]}\n' + stderr.decode(errors='replace')[-4000:])
    return stdout, stderr


def git(*args):
    return command(['git', *args])[0].decode().strip()


def workers():
    """Read only central processes; do not collect unrelated prompt arguments."""
    result = []
    for process in Path('/proc').iterdir():
        if not process.name.isdigit() or int(process.name) == os.getpid():
            continue
        try:
            args = (process / 'cmdline').read_bytes().split(b'\0')
            cwd = (process / 'cwd').resolve()
        except OSError:
            continue
        if (str(REPO / 'scripts/leetcode_campaign.py').encode() in args or
                (cwd == REPO and any(b'codex' in arg for arg in args))):
            result.append(int(process.name))
    return sorted(result)


def validate_public(receipt):
    exact = {
        'status': 'public-verified', 'public_base': 'https://visual.integ.life',
        'source_revision': PAYLOAD, 'policy_source_revision': SOURCE,
        'manifest_sha256': MANIFEST, 'files_verified': 1717, 'lessons_verified': 120,
        'browser_exit_code': 0, 'root_workflow_status': 'pass',
    }
    for key, value in exact.items():
        require(type(receipt.get(key)) is type(value) and receipt[key] == value,
                'Public receipt does not establish ' + key)
    verified = dt.datetime.fromisoformat(receipt['verified_at'].replace('Z', '+00:00'))
    require(verified.tzinfo is not None, 'Public verification needs a timezone')
    evidence = receipt.get('evidence_sha256', {})
    require(set(evidence) == {'http', 'browser', 'homepage', 'in_app'}, 'Public evidence set is incomplete')
    require(all(isinstance(value, str) and re.fullmatch('[0-9a-f]{64}', value)
                for value in evidence.values()), 'Public evidence hash is invalid')


def rewrite_launcher(original):
    require(sha(original) == OLD_LAUNCHER, 'External launcher changed since the inspected checkpoint')
    old, new = b'"--publish-every","100"', b'"--publish-every","20"'
    require(original.count(old) == 1, 'Launcher must have exactly one explicit old publication threshold')
    changed = original.replace(old, new)
    ast.parse(changed)
    require(changed.count(new) == 1 and old not in changed, 'Launcher threshold replacement failed')
    require(b'if "--max-rounds" in sys.argv:' in changed, 'Launcher lost the review-budget passthrough')
    return changed


def only_expected_head_changed(before, after, new_head):
    expected = dict(before)
    expected['expected_head'] = new_head
    require(after == expected, 'Campaign fields other than expected_head changed during adoption')


def snapshot(progress):
    return {
        'head': git('rev-parse', 'HEAD'), 'expected_head': progress['expected_head'],
        'status': progress['status'], 'current': progress.get('current'),
        'progress_sha256': sha((STATE / 'progress.json').read_bytes()),
        'ledger_sha256': sha((STATE / 'releases.json').read_bytes()),
        'problems_sha256': canonical(progress['problems']), 'runs_sha256': canonical(progress['runs']),
        'queue_sha256': canonical(progress['queue']),
        'protected_git_objects': {path: git('rev-parse', 'HEAD:' + path) for path in PROTECTED},
        'launcher_sha256': sha((STATE / 'launch.py').read_bytes()),
        'stop_sha256': sha((STATE / 'STOP').read_bytes()) if (STATE / 'STOP').is_file() else None,
        'accepted_count': sum(item['status'] == 'accepted_local' for item in progress['problems'].values()),
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dispatch', required=True, choices=[DISPATCH])
    parser.add_argument('--public-receipt', type=Path, required=True)
    parser.add_argument('--evidence-output', type=Path, default=STATE / 'static-codex-adoption-20261025.json')
    args = parser.parse_args(argv)
    require(sys.platform == 'linux' and REPO.is_dir(), 'This operator script targets only the inspected Pi checkout')
    receipt_path = args.public_receipt.resolve()
    output = args.evidence_output.resolve()
    require(receipt_path == STATE / 'static-codex-public-20261025.json', 'Unexpected public verification receipt')
    require(output.parent == STATE and not output.exists(), 'Evidence must be a new file in the existing state directory')
    receipt_bytes = receipt_path.read_bytes()
    validate_public(json.loads(receipt_bytes))
    evidence = {'version': 1, 'status': 'preflight', 'started_at': timestamp(),
                'dispatch': args.dispatch, 'source_revision': SOURCE, 'allowlist': list(ALLOWLIST),
                'public_receipt': str(receipt_path), 'public_receipt_sha256': sha(receipt_bytes), 'tests': []}
    old_stop = None
    stop_removed = False
    try:
        with contextlib.ExitStack() as stack:
            lock_path = Path(git('rev-parse', '--git-path', 'leetcode-campaign.lock'))
            if not lock_path.is_absolute():
                lock_path = REPO / lock_path
            for path in (lock_path, STATE / 'runner.lock', STATE / 'release.lock'):
                handle = stack.enter_context(path.open('r+'))
                fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
            require(not workers(), 'Central worker is still active')
            require(git('branch', '--show-current') == BRANCH, 'Unexpected campaign branch')
            require(git('remote', 'get-url', 'origin') == 'git@github.com:flyfy1/knowledge-vis.git', 'Unexpected Git remote')
            require(not git('status', '--porcelain', '--untracked-files=all'), 'Campaign checkout is dirty')
            before = json.loads((STATE / 'progress.json').read_text())
            require(git('rev-parse', 'HEAD') == before['expected_head'] == OLD_HEAD, 'Saved clean HEAD checkpoint changed')
            require(before['status'] == 'run_limit_reached' and before.get('current') is None, 'Not a clean stage boundary')
            require(len(before['queue']) == 984, 'Queue size changed')
            ledger_raw = (STATE / 'releases.json').read_bytes()
            ledger = json.loads(ledger_raw)
            require(ledger['pending'] is None, 'Publication is pending')
            old_stop = (STATE / 'STOP').read_bytes()
            require(json.loads(old_stop)['owner'] == STOP_OWNER, 'STOP belongs to another operator')
            require(sha((REPO / 'index.html').read_bytes()) == OLD_ROOT, 'Central root HTML checkpoint changed')
            old_launcher = (STATE / 'launch.py').read_bytes()
            new_launcher = rewrite_launcher(old_launcher)
            migration = json.loads((STATE / 'static-codex-migration-20261025.json').read_text())
            require(migration['source_revision'] == PAYLOAD and migration['manifest_sha256'] == MANIFEST,
                    'Origin migration receipt belongs to another payload')
            stage = STATE / 'static-codex-stage-20261025'
            require(migration['stage'] == str(stage) and migration['expected_head'] == OLD_HEAD, 'Origin stage checkpoint changed')
            require(migration['status'] in {'origin-applied-public-verification-pending', 'public-verified'}, 'Origin migration not applied')
            require(migration['progress_sha256'] == sha((STATE / 'progress.json').read_bytes()), 'Progress changed after migration')
            require(migration['ledger_sha256'] == sha(ledger_raw), 'Release ledger changed after migration')
            manifest_raw = (stage / 'static-manifest.json').read_bytes()
            require(sha(manifest_raw) == MANIFEST, 'Staged manifest changed')
            manifest = json.loads(manifest_raw)
            require(all(sha((PRODUCTION / path).read_bytes()) == digest for path, digest in manifest['files'].items()),
                    'Public origin no longer matches the verified migration')
            evidence['before'] = snapshot(before)
            require(evidence['before']['accepted_count'] == 119 and len(ledger['released']) == 119,
                    'Acceptance/release counts changed from the inspected checkpoint')
            save(output, evidence)

            git('fetch', 'origin', 'main')
            require(git('rev-parse', SOURCE + '^{commit}') == SOURCE, 'Pinned policy source unavailable')
            git('merge-base', '--is-ancestor', SOURCE, 'FETCH_HEAD')
            remote_before = git('ls-remote', 'origin', 'refs/heads/' + BRANCH).split()
            require(remote_before and remote_before[0] == OLD_HEAD, 'Remote campaign branch changed')
            source_hashes = {path: sha(command(['git', 'show', SOURCE + ':' + path])[0]) for path in ALLOWLIST}
            git('restore', '--source=' + SOURCE, '--staged', '--worktree', '--', *ALLOWLIST)
            changed = set(git('diff', '--cached', '--name-only', '--no-renames').splitlines())
            require(changed == set(ALLOWLIST), 'Staged changes differ from the explicit 13-file adoption')
            require(all(sha((REPO / path).read_bytes()) == source_hashes[path] for path in ALLOWLIST), 'Adopted source bytes differ')
            require(not git('diff', '--name-only'), 'Unexpected unstaged changes after adoption')
            env = os.environ.copy()
            env.update(PATH='/home/songyy/.local/node-v22.23.2-linux-arm64/bin:/home/songyy/.local/bin:/usr/local/bin:/usr/bin:/bin',
                       NODE_PATH='/home/songyy/projects/integ-games/node_modules', PYTHONDONTWRITEBYTECODE='1',
                       PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/home/songyy/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome')
            for pattern in ('test_campaign_publication.py', 'test_leetcode_static_versions.py',
                            'test_leetcode_publish.py', 'test_leetcode_publish_browser.py'):
                print('Testing ' + pattern, flush=True)
                log = STATE / ('static-adoption-' + pattern + '.log')
                require(not log.exists(), 'Existing adoption test log must be preserved')
                command([sys.executable, '-B', '-m', 'unittest', 'discover', '-s', 'scripts', '-p', pattern, '-v'],
                        env=env, timeout=600, log=log)
                evidence['tests'].append({'pattern': pattern, 'exit_code': 0, 'log': str(log), 'sha256': sha(log.read_bytes())})
                save(output, evidence)
            inspect = "import sys,inspect;sys.path.insert(0,'scripts');from leetcode_campaign import parser;from leetcode_publish import maybe_publish;from leetcode_static_versions import BUILDER_VERSION,codex_discovery;from pathlib import Path;assert parser().parse_args(['--state-dir','/tmp/unused']).publish_every==20;assert inspect.signature(maybe_publish).parameters['batch_size'].default==20;assert BUILDER_VERSION=='codex-static-v1';assert b'problems.codex.config.js' in codex_discovery(Path('index.html').read_bytes());assert \"p.id + '-codex/'\" in Path('index.html').read_text();print('runner/publisher defaults and compatible static homepage verified')"
            command([sys.executable, '-B', '-c', inspect], env=env)
            runner_source = (REPO / 'scripts/leetcode_campaign.py').read_text()
            require('"-m", "gpt-6.1-sol"' in runner_source and 'model_reasoning_effort="medium"' in runner_source,
                    'Campaign model settings changed')
            require(json.loads((STATE / 'progress.json').read_text()) == before, 'Tests changed campaign state')
            require((STATE / 'releases.json').read_bytes() == ledger_raw, 'Tests changed release ledger')
            require(set(git('diff', '--cached', '--name-only', '--no-renames').splitlines()) == set(ALLOWLIST)
                    and not git('diff', '--name-only'), 'Tests changed adoption scope')
            message = ('Adopt reviewed Codex static routes and twenty-lesson publication policy\n\n'
                       'Built-By: deterministic adoption script (no model execution)\n'
                       'Verified-By: source independent review and preservation/regression checks\n'
                       'Source-Revision: ' + SOURCE + '\n'
                       'Public-Receipt-SHA256: ' + sha(receipt_bytes))
            git('commit', '-m', message)
            new_head = git('rev-parse', 'HEAD')
            require(not git('status', '--porcelain', '--untracked-files=all'), 'Post-commit checkout is not clean')
            require(set(git('diff', '--name-only', '--no-renames', OLD_HEAD, new_head).splitlines()) == set(ALLOWLIST),
                    'Committed files differ from the adoption allowlist')
            require(all(git('rev-parse', new_head + ':' + path) == old for path, old in
                        evidence['before']['protected_git_objects'].items()), 'Lesson, registry, concept map or review tree changed')
            updated = dict(before)
            updated['expected_head'] = new_head
            save(STATE / 'progress.json', updated)
            only_expected_head_changed(before, json.loads((STATE / 'progress.json').read_text()), new_head)
            require((STATE / 'launch.py').read_bytes() == old_launcher, 'Launcher changed concurrently')
            atomic(STATE / 'launch.py', new_launcher)
            require((STATE / 'releases.json').read_bytes() == ledger_raw, 'Release ledger changed')
            require((STATE / 'STOP').read_bytes() == old_stop, 'STOP changed concurrently')
            require(receipt_path.read_bytes() == receipt_bytes, 'Public verification receipt changed')
            remote_now = git('ls-remote', 'origin', 'refs/heads/' + BRANCH).split()
            require(remote_now and remote_now[0] == OLD_HEAD, 'Remote campaign branch changed before push')
            git('push', 'origin', 'HEAD:refs/heads/' + BRANCH)
            require(git('ls-remote', 'origin', 'refs/heads/' + BRANCH).split()[0] == new_head, 'Campaign push not confirmed')
            evidence.update(status='adopted-pushed-still-stopped', source_sha256=source_hashes,
                            new_commit=new_head, after_adoption=snapshot(updated))
            evidence['preserved'] = {field: evidence['before'][field] == evidence['after_adoption'][field]
                                    for field in ('problems_sha256', 'runs_sha256', 'queue_sha256',
                                                  'ledger_sha256', 'protected_git_objects', 'stop_sha256')}
            require(all(evidence['preserved'].values()), 'Adoption preservation comparison failed')
            save(output, evidence)

        # Release maintenance locks before the runner acquires its own locks.
        require(not workers(), 'A worker appeared before launch')
        require((STATE / 'STOP').read_bytes() == old_stop, 'Owned STOP changed before launch')
        require(json.loads((STATE / 'progress.json').read_text()) == updated, 'Checkpoint changed before launch')
        (STATE / 'STOP').unlink()
        stop_removed = True
        stdout, _ = command([sys.executable, str(STATE / 'launch.py'), '--continuous', '--max-rounds', '6'], env=env)
        launched = json.loads(stdout)
        evidence.update(status='launched-awaiting-active-state', launch=launched)
        save(output, evidence)
        require(launched['continuous'] is True and launched['queue_count'] == 984, 'Launcher changed queue mode')
        pid = launched['pid']
        for _ in range(120):
            current = json.loads((STATE / 'progress.json').read_text())
            if not (Path('/proc') / str(pid)).exists():
                raise RuntimeError('New central runner exited; inspect its log and saved state')
            if current.get('current'):
                break
            time.sleep(0.5)
        require(current['status'] == 'running' and (current.get('current') or {}).get('problem_id') == '793',
                'Runner did not reach expected next problem #793')
        args_live = (Path('/proc') / str(pid) / 'cmdline').read_bytes().split(b'\0')
        for flag, value in ((b'--publish-every', b'20'), (b'--max-rounds', b'6'), (b'--state-dir', str(STATE).encode())):
            require(flag in args_live and args_live[args_live.index(flag) + 1] == value, 'Live runner argument differs')
        runner_pids = []
        for other in workers():
            try:
                raw = (Path('/proc') / str(other) / 'cmdline').read_bytes().split(b'\0')
            except OSError:
                continue  # A Codex wrapper can finish between the two read-only snapshots.
            if str(REPO / 'scripts/leetcode_campaign.py').encode() in raw:
                runner_pids.append(other)
        require(runner_pids == [pid], 'More than one central runner was observed')
        require(current['queue'] == before['queue'], 'Resumed queue changed')
        require(all(current['problems'].get(key) == value for key, value in before['problems'].items()),
                'Resumption changed a prior problem record')
        require(current['runs'][:len(before['runs'])] == before['runs'], 'Resumption rewrote prior runs')
        require((STATE / 'releases.json').read_bytes() == ledger_raw, 'Startup unexpectedly changed release ledger')
        evidence.update(status='resumed-verified', finished_at=timestamp(), runner_pid=pid,
                        current=current['current'], prior_records_preserved=True,
                        queue_sha256=canonical(current['queue']), ledger_sha256=sha(ledger_raw))
        save(output, evidence)
        print(json.dumps({'status': evidence['status'], 'new_commit': new_head, 'pid': pid,
                          'current': current['current'], 'evidence': str(output)}), flush=True)
    except BaseException as error:
        if stop_removed and not (STATE / 'STOP').exists() and old_stop is not None:
            atomic(STATE / 'STOP', old_stop)
        evidence.update(status='failed-inspect-before-retry', error=str(error) or type(error).__name__, finished_at=timestamp())
        # Save failures only after the operator-owned evidence receipt was created.
        if output.exists():
            save(output, evidence)
        raise


if __name__ == '__main__':
    def interrupted(signum, _frame):
        raise KeyboardInterrupt(f'Received signal {signum}')
    signal.signal(signal.SIGTERM, interrupted)
    main()

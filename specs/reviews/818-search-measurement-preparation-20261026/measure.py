"""One-off Mac measurements of an explicit frozen Solution.racecar source.

Default coverage is every official target 1..10000. Reference DP agreement is
numerical corroboration only; the independent optimality proof remains separate.
"""
import argparse
from collections import deque
from concurrent.futures import ThreadPoolExecutor
import contextlib
import hashlib
import json
import os
from pathlib import Path
import platform
import resource
import signal
import subprocess
import sys
import tempfile
import time
import traceback


def digest(data):
    return hashlib.sha256(data).hexdigest()


def reference_values(limit):
    values = [0] * (limit + 1)
    for target in range(1, limit + 1):
        n = target.bit_length()
        if target == (1 << n) - 1:
            values[target] = n
            continue
        best = n + 1 + values[(1 << n) - 1 - target]
        for backward in range(n - 1):
            remaining = target - (1 << (n - 1)) + (1 << backward)
            best = min(best, n + backward + 1 + values[remaining])
        values[target] = best
    return values


def raw_bfs(target):
    """Independent complete command graph, deliberately restricted to tiny targets."""
    if not 1 <= target <= 32:
        raise ValueError('Raw BFS is restricted to targets 1..32')
    todo, seen = deque([(0, 1, 0)]), {(0, 1)}
    while todo:
        position, speed, depth = todo.popleft()
        if position == target:
            return depth
        for state in ((position + speed, speed * 2), (position, -1 if speed > 0 else 1)):
            if state not in seen:
                seen.add(state)
                todo.append((*state, depth + 1))


def worker(source, expected, target):
    """Private subprocess entry: compile exact bytes; never import the source file."""
    result = {'target': target, 'status': 'exception', 'answer': None,
              'call_seconds': None, 'peak_rss_bytes': None}
    try:
        data = source.read_bytes()
        if digest(data) != expected:
            raise ValueError('Frozen source hash mismatch before execution')
        namespace = {'__name__': 'frozen_candidate', '__file__': str(source)}
        with open(os.devnull, 'w') as discarded, contextlib.redirect_stdout(discarded), contextlib.redirect_stderr(discarded):
            exec(compile(data, str(source), 'exec'), namespace)
            solution = namespace['Solution']()
            start = time.perf_counter()
            answer = solution.racecar(target)
            result['call_seconds'] = time.perf_counter() - start
        raw_rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        # This harness refuses non-Mac execution. Darwin ru_maxrss is bytes.
        result.update(peak_rss_raw=raw_rss, peak_rss_raw_unit='bytes',
                      peak_rss_bytes=raw_rss, rss_scope='whole fresh Python process, including interpreter/imports')
        if type(answer) is not int:
            result.update(status='invalid_return', return_type=type(answer).__name__, return_repr=repr(answer)[:300])
        else:
            result.update(status='ok', answer=answer)
    except BaseException as error:
        result.update(status='exception', error_type=type(error).__name__, error=str(error)[:1000],
                      traceback=traceback.format_exc(limit=4)[-2500:])
    try:
        result['source_sha256_after'] = digest(source.read_bytes())
        if result['source_sha256_after'] != expected:
            result['status'] = 'source_changed'
    except OSError as error:
        result.update(status='source_changed', error=str(error))
    return result


def terminate_group(process):
    # Kill descendants as well, including a child left behind by an exited worker.
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    try:
        process.wait(timeout=.2)
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    process.wait()


def run_one(source, expected, target, deadline, per_target):
    started = time.monotonic()
    remaining = deadline - started
    result = {'target': target, 'status': 'overall_deadline', 'answer': None,
              'call_seconds': None, 'peak_rss_bytes': None}
    if remaining <= 0:
        return result
    budget = min(per_target, remaining)
    with tempfile.TemporaryDirectory(prefix='818-measure-') as temporary:
        output, errors = Path(temporary)/'result', Path(temporary)/'errors'
        process = None
        try:
            with output.open('wb') as out, errors.open('wb') as err:
                process = subprocess.Popen([sys.executable, '-I', '-B', str(Path(__file__).resolve()),
                                            '--worker', str(source), expected, str(target)],
                                           stdin=subprocess.DEVNULL, stdout=out, stderr=err,
                                           start_new_session=True, cwd=temporary)
                try:
                    process.wait(timeout=budget)
                except subprocess.TimeoutExpired:
                    result.update(status='overall_deadline' if remaining <= per_target else 'timeout',
                                  timeout_seconds=budget)
                else:
                    if process.returncode != 0:
                        result.update(status='process_error', exit_code=process.returncode)
                    else:
                        data = output.read_bytes()
                        if len(data) > 16384:
                            raise ValueError('Worker result unexpectedly large')
                        result = json.loads(data)
                        if result.get('target') != target:
                            raise ValueError('Worker target mismatch')
        except Exception as error:
            result.update(status='harness_error', error_type=type(error).__name__, error=str(error))
        finally:
            if process is not None:
                terminate_group(process)
            result['process_wall_seconds'] = time.monotonic() - started
            if errors.exists() and errors.stat().st_size:
                result['stderr_tail'] = errors.read_bytes()[-2000:].decode(errors='replace')
    return result


def annotate(row, reference, small):
    target = row['target']
    row['reference_dp_answer'] = reference[target]
    row['reference_dp_role'] = 'numerical corroboration, not independent optimality proof'
    row['raw_bfs_answer'] = small.get(target)
    if row['status'] == 'ok':
        row['matches_reference_dp'] = row['answer'] == reference[target]
        row['matches_raw_bfs'] = None if target not in small else row['answer'] == small[target]
        if not row['matches_reference_dp'] or row['matches_raw_bfs'] is False:
            row['status'] = 'mismatch'
    return row


def measure(args):
    if sys.platform != 'darwin':
        raise ValueError('Mac-only harness: high-cost canonical measurements must not run on Pi/Linux')
    source = args.source.resolve(strict=True)
    if not source.is_file():
        raise ValueError('Source must be a regular local file')
    data = source.read_bytes()
    if digest(data) != args.expected_sha256:
        raise ValueError('Expected source SHA256 differs; output directory was not created')
    # mkdir(exist_ok=False) deliberately refuses any previous run, even an empty one.
    args.output.mkdir(parents=False, exist_ok=False)
    output = args.output.resolve()
    frozen = output/'canonical.py'
    frozen.write_bytes(data)
    started = time.monotonic()
    deadline = started + args.wall_seconds
    limit = args.test_limit or 10000
    environment = {'platform': platform.platform(), 'sys_platform': sys.platform,
                   'machine': platform.machine(), 'python': sys.version, 'executable': sys.executable,
                   'cpu_count': os.cpu_count(), 'load_average_at_start': list(os.getloadavg()), 'source_path': str(source), 'frozen_path': str(frozen),
                   'source_sha256': args.expected_sha256,
                   'harness_sha256': digest(Path(__file__).read_bytes()),
                   'started_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                   'workers': args.workers, 'wall_seconds': args.wall_seconds,
                   'per_target_seconds': args.per_target_seconds, 'target_range': [1, limit],
                   'test_only_limited_coverage': args.test_limit is not None,
                   'rss_method': 'resource.getrusage(RUSAGE_SELF).ru_maxrss; Darwin bytes; whole fresh process peak',
                   'isolation': 'one fresh -I -B Python process per target; canonical stdout/stderr discarded',
                   'timing': 'call_seconds excludes compile/import; process_wall_seconds includes startup/cleanup',
                   'overall_bound': 'monotonic deadline covers survey and isolated reruns; process-group cleanup may add bounded grace'}
    (output/'environment.json').write_text(json.dumps(environment, indent=2)+'\n')
    rows, isolated, error = [], [], None
    reference, small = reference_values(limit), {t: raw_bfs(t) for t in range(1, min(32, limit)+1)}
    def record_progress(status):
        counts = {}
        for row in rows:
            counts[row['status']] = counts.get(row['status'], 0)+1
        (output/'progress.json').write_text(json.dumps({'status': status, 'completed': len(rows),
            'counts': counts, 'elapsed_seconds': time.monotonic()-started}, indent=2)+'\n')
    record_progress('running')
    try:
        with (output/'survey.jsonl').open('x') as out, ThreadPoolExecutor(max_workers=args.workers) as pool:
            results = pool.map(lambda target: run_one(frozen, args.expected_sha256, target, deadline, args.per_target_seconds), range(1, limit+1))
            try:
                for row in results:
                    row = annotate(row, reference, small)
                    rows.append(row)
                    out.write(json.dumps(row)+'\n');out.flush()
                    if len(rows) % 100 == 0:
                        record_progress('running')
            except BaseException:
                # Queued calls read this closed deadline before spawning. At most
                # two already-running children finish their existing finite budget.
                deadline = 0
                raise
        successful = [row for row in rows if row['status'] == 'ok']
        worst = []
        if successful:
            worst = [max(successful, key=lambda r: r['call_seconds'])['target'],
                     max(successful, key=lambda r: r['peak_rss_bytes'])['target']]
        targets = sorted(set(([] if args.test_limit else [9809, 9879, 10000]) + worst))
        with (output/'isolated.jsonl').open('x') as out:
            # Sequential reruns: no more than the configured two children anywhere.
            for target in targets:
                row = annotate(run_one(frozen, args.expected_sha256, target, deadline, args.per_target_seconds), reference, small)
                row['selection'] = 'required difficult input or observed maximum call-time/process-RSS input'
                isolated.append(row);out.write(json.dumps(row)+'\n');out.flush()
    except BaseException as caught:
        error = {'type': type(caught).__name__, 'message': str(caught)}
        # Some queued/running results may be uncollected after interruption. Do
        # not call them executed, successful, or definitely unstarted.
        seen = {row['target'] for row in rows}
        with (output/'survey.jsonl').open('a') as out:
            for target in range(1, limit+1):
                if target not in seen:
                    row = {'target': target, 'status': 'unobserved_after_abort', 'answer': None,
                           'call_seconds': None, 'peak_rss_bytes': None}
                    rows.append(row);out.write(json.dumps(row)+'\n')
    try:
        original_after, frozen_after = digest(source.read_bytes()), digest(frozen.read_bytes())
    except OSError as caught:
        original_after, frozen_after = None, None
        error = error or {'type': type(caught).__name__, 'message': str(caught)}
    immutable = original_after == frozen_after == args.expected_sha256
    complete = len(rows) == limit and {r['target'] for r in rows} == set(range(1, limit+1))
    passed = error is None and immutable and complete and bool(isolated) and all(r['status'] == 'ok' for r in rows+isolated)
    summary = {'status': ('passed_limited' if args.test_limit else 'passed_full_range') if passed else 'failed',
               'full_official_range_passed': passed and args.test_limit is None,
               'coverage_count': len(rows), 'expected_count': limit, 'all_targets_recorded': complete,
               'source_immutable': immutable, 'original_sha256_after': original_after,
               'frozen_sha256_after': frozen_after, 'isolated_targets': [r['target'] for r in isolated],
               'elapsed_seconds': time.monotonic()-started, 'error': error,
               'failed_targets': [{'target':r['target'],'status':r['status']} for r in rows if r['status']!='ok'],
               'claims': 'Empirical results for exact bytes/environment only; proof, judge limits, acceptance and publication are separate.'}
    record_progress(summary['status'])
    summary['artifact_sha256'] = {p.name:digest(p.read_bytes()) for p in output.iterdir() if p.is_file()}
    (output/'summary.json').write_text(json.dumps(summary, indent=2)+'\n')
    print(json.dumps(summary), flush=True)
    return 0 if passed else 1


def main(argv=None):
    if argv is None and len(sys.argv) == 5 and sys.argv[1] == '--worker':
        if sys.platform != 'darwin':
            raise SystemExit('Mac-only worker')
        print(json.dumps(worker(Path(sys.argv[2]), sys.argv[3], int(sys.argv[4]))), flush=True)
        return 0
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--expected-sha256', required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--wall-seconds', type=float, default=1800)
    parser.add_argument('--per-target-seconds', type=float, default=15)
    parser.add_argument('--workers', type=int, choices=[1, 2], default=2)
    parser.add_argument('--test-limit', type=int, help='Test-only range 1..N (N<=32); can never claim full-range success')
    args = parser.parse_args(argv)
    if not (0 < args.wall_seconds <= 7200 and 0 < args.per_target_seconds <= args.wall_seconds):
        parser.error('Require 0 < per-target-seconds <= wall-seconds <= 7200')
    if args.test_limit is not None and not 1 <= args.test_limit <= 32:
        parser.error('Test-only limit must be 1..32')
    if len(args.expected_sha256) != 64 or any(c not in '0123456789abcdef' for c in args.expected_sha256):
        parser.error('Expected SHA256 must be 64 lowercase hexadecimal characters')
    try:
        return measure(args)
    except (ValueError, OSError) as error:
        print(json.dumps({'status':'refused','error':str(error)}), file=sys.stderr)
        return 2


if __name__ == '__main__':
    def interrupted(signum, _frame):
        raise InterruptedError(f'Signal {signum}')
    signal.signal(signal.SIGTERM, interrupted)
    raise SystemExit(main())

"""Exploratory A* only; no geometry cutoffs or production acceptance claim."""
import argparse
import heapq
import json
import resource
import sys
import time
from collections import deque


def lower_bound(target, position, speed, directional=True):
    diff = target - position
    if diff == 0:
        return 0
    distance = abs(diff)
    if directional and diff * speed < 0:
        return 1 + distance.bit_length()
    units = (distance + abs(speed) - 1) // abs(speed)
    return units.bit_length()


def search(target, directional=True, cap=250000, seconds=10):
    started = time.monotonic()
    best = {(0, 1): 0}
    queue = [(lower_bound(target, 0, 1, directional), 0, 0, 1)]
    expanded = 0
    peak_heap = 1
    while queue:
        _, negative_g, position, speed = heapq.heappop(queue)
        g = -negative_g
        if best[(position, speed)] != g:
            continue
        if position == target:
            return dict(status='found', answer=g, expanded=expanded,
                        states=len(best), peak_heap=peak_heap,
                        elapsed_seconds=time.monotonic()-started)
        expanded += 1
        if len(best) >= cap or time.monotonic()-started > seconds:
            return dict(status='capped', answer=None, expanded=expanded,
                        states=len(best), peak_heap=peak_heap,
                        elapsed_seconds=time.monotonic()-started)
        for p, v in ((position+speed, speed*2),
                     (position, -1 if speed > 0 else 1)):
            next_g = g+1
            if next_g < best.get((p, v), float('inf')):
                best[(p, v)] = next_g
                h = lower_bound(target, p, v, directional)
                heapq.heappush(queue, (next_g+h, -next_g, p, v))
        peak_heap = max(peak_heap, len(queue))
    raise AssertionError('Reachable positive target exhausted')


def raw_bfs(target):
    queue = deque([(0, 1, 0)])
    seen = {(0, 1)}
    while queue:
        p, v, d = queue.popleft()
        if p == target:
            return d
        for state in ((p+v, 2*v), (p, -1 if v > 0 else 1)):
            if state not in seen:
                seen.add(state)
                queue.append((*state, d+1))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--target', type=int)
    parser.add_argument('--weak', action='store_true')
    parser.add_argument('--small', action='store_true')
    parser.add_argument('--cap', type=int, default=250000)
    args = parser.parse_args()
    assert 1 <= args.cap <= 1000000
    if args.small:
        for target in range(1, 65):
            expected = raw_bfs(target)
            for directional in (False, True):
                result = search(target, directional)
                assert result['status'] == 'found' and result['answer'] == expected
        result = dict(status='passed', independent_raw_bfs_targets=64, variants=2)
    else:
        assert args.target and 1 <= args.target <= 10000
        result = dict(target=args.target, directional=not args.weak,
                      cap=args.cap, **search(args.target, not args.weak, args.cap))
    result['peak_rss_bytes'] = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss * (1 if sys.platform == 'darwin' else 1024)
    result['platform'] = sys.platform
    print(json.dumps(result))

"""Independent layer-by-layer oracle; production uses recursive memoization.
Run from any cwd. OUTPUT_DIR redirects generated results outside the candidate.
"""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import re
import time
import sys
from collections import deque

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solution = mod.Solution()


def remove_runs(row):
    # A legal insertion into a stable row creates at most one removable run.
    # Independent regex full-pass normalization instead of production's run scan.
    while True:
        after = re.sub(r'(.)\1{2,}', '', row)
        if row == after:
            return row
        row = after


def oracle(board, hand):
    queue = deque([(board, hand, 0)])
    seen = {(board, hand)}
    while queue:
        row, remaining, depth = queue.popleft()
        if not row:
            return depth
        for k, color in enumerate(remaining):
            rest = remaining[:k] + remaining[k+1:]
            for gap in range(len(row)+1):
                after = remove_runs(row[:gap] + color + row[gap:])
                assert not re.search(r'(.)\1{2,}', after)
                assert len(rest) + depth + 1 == len(hand)
                state = (after, rest)
                if state not in seen:
                    seen.add(state)
                    queue.append((after, rest, depth+1))
    return -1


def stable(row):
    return not re.search(r'(.)\1{2,}', row)


def main():
    started = time.monotonic()
    count = 0
    def check(board, hand, expected=None):
        nonlocal count
        expected = oracle(board, hand) if expected is None else expected
        actual = solution.findMinStep(board, hand)
        assert actual == expected, (board, hand, expected, actual)
        assert board == str(board) and hand == str(hand)
        count += 1
        return actual

    fixtures = [('WRRBBW', 'RB', -1), ('WWRRBBWW', 'WRBRW', 2),
                ('G', 'GGGGG', 2), ('RRBBRR', 'B', 1), ('G', 'GG', 2),
                ('RR', 'B', -1), ('RBBR', 'BR', 2), ('RBBR', 'RB', 2),
                ('', 'R', 0), ('RR', '', -1), ('RRWWRRBBRR', 'WB', 2),
                ('RRBBYYGGYYBBRRWW', 'GWWWW', 2), ('RYBGWRYBGWRYBGWR', 'YYYYY', -1)]
    for b, h, expected in fixtures:
        check(b, h, expected)
    # Exhaustive legal two-color initial rows through length 5, hands through 3.
    exhaustive = 0
    for n in range(1, 6):
        for row_tuple in itertools.product('RB', repeat=n):
            row = ''.join(row_tuple)
            if not stable(row):
                continue
            for h in range(1, 4):
                for hand_tuple in itertools.product('RB', repeat=h):
                    check(row, ''.join(hand_tuple)); exhaustive += 1
    rng = random.Random(488)
    for _ in range(100):
        n = rng.randrange(1, 8)
        row = ''.join(rng.choices('RYBGW', k=n))
        if not stable(row):
            continue
        hand = ''.join(rng.choices('RYBGW', k=rng.randrange(1, 4)))
        check(row, hand)
    # Oracle verifies non-immediate setup and a full-length chain case as well.
    for b, h, _ in fixtures[:11]:
        check(b, h)
    check('RRBBYYGGYYBBRRWW', 'GW')
    # Observe real production calls without changing the submitted source.
    invariants = {'solveEntries': 0, 'collapseReturns': 0}
    collapse_inputs = {}
    def observe(frame, event, arg):
        if frame.f_code.co_filename != str(ROOT / 'solution.py'):
            return observe
        name = frame.f_code.co_name
        if name == 'solve' and event == 'call':
            row, remaining = frame.f_locals['row'], frame.f_locals['remaining']
            assert stable(row)
            assert remaining == ''.join(sorted(remaining))
            parent = frame.f_back
            if parent.f_code.co_name == 'solve':
                assert len(remaining) + 1 == len(parent.f_locals['remaining'])
            invariants['solveEntries'] += 1
        if name == 'collapse' and event == 'call':
            collapse_inputs[id(frame)] = frame.f_locals['row']
        if name == 'collapse' and event == 'return':
            original = collapse_inputs.pop(id(frame))
            assert arg == remove_runs(original)
            assert stable(arg)
            invariants['collapseReturns'] += 1
        return observe
    sys.settrace(observe)
    try:
        check('WWRRBBWW', 'RB', 2)
        check('RRWWRRBBRR', 'WB', 2)
        check('G', 'GG', 2)
    finally:
        sys.settrace(None)
    assert invariants['solveEntries'] > 10 and invariants['collapseReturns'] > 10
    report = {'status': 'pass', 'canonicalInterface': 'Solution.findMinStep(board: str, hand: str) -> int',
              'cases': count, 'exhaustive': exhaustive, 'seed': 488, 'productionIntermediateInvariants': invariants,
              'fixtures': fixtures, 'seconds': round(time.monotonic()-started, 3),
              'limits': 'Author computational checks, not independent teaching review or online acceptance.'}
    (OUT/'python-results.json').write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report))

if __name__ == '__main__':
    main()

"""Independent interval-expression oracle; no pair-reduction recurrence."""
import ast
import importlib.util
import itertools
import json
import os
from pathlib import Path
from fractions import Fraction
from functools import lru_cache
import random
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

@lru_cache(None)
def ordered_values(order):
    if len(order) == 1:
        return frozenset([Fraction(order[0])])
    out = set()
    # Split only contiguous intervals of a fixed card order. This enumerates
    # binary parenthesis shapes, never merges arbitrary available pairs.
    for cut in range(1, len(order)):
        for x in ordered_values(order[:cut]):
            for y in ordered_values(order[cut:]):
                out.update([x+y, x-y, x*y])
                if y:
                    out.add(x/y)
    return frozenset(out)

@lru_cache(None)
def oracle(cards):
    return any(24 in ordered_values(p) for p in set(itertools.permutations(cards)))

solver = module.Solution()
count = positive = 0
for cards in itertools.combinations_with_replacement(range(1,10), 4):
    expected = oracle(cards)
    original = list(cards)
    actual = solver.judgePoint24(original)
    assert type(actual) is bool and actual == expected, (cards, actual, expected)
    assert original == list(cards)
    count += 1
    positive += expected
rng = random.Random(679)
for _ in range(200):
    cards = [rng.randint(1,9) for _ in range(4)]
    assert solver.judgePoint24(cards) == oracle(tuple(sorted(cards)))

# Observe real canonical intermediate calls, not an imitation of the code.
intermediate = 0
lengths = set()
def monitor(frame, event, arg):
    global intermediate
    if frame.f_code.co_name == 'search' and event == 'call':
        values = frame.f_locals['values']
        assert 1 <= len(values) <= 4
        assert all(isinstance(v, Fraction) and v.denominator > 0 for v in values)
        intermediate += 1
        lengths.add(len(values))
    return monitor
sys.settrace(monitor)
for cards, expected in [([4,1,8,7],True),([1,2,1,2],False),([3,3,8,8],True),([1,1,1,1],False),([1,5,5,5],True),([9,9,9,9],False)]:
    assert solver.judgePoint24(cards) == expected
sys.settrace(None)
assert lengths == {1,2,3,4}
# Fresh exercise: both last values jointly own all cards. Nothing else may enter.
assert not any(v == 24 for v in ordered_values((-1,-1)))
assert solver.judgePoint24([2,3,7,8])

source = (ROOT/'solution.py').read_text()
assert ast.parse(source)
mirror = (ROOT/'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';')) == source
report = dict(kind='author self-check', exhaustive_unordered_hands=count, solvable=positive, seeded_ordered_hands=200, seed=679, monitored_calls=intermediate, lengths=sorted(lengths), oracle='Independent contiguous interval expression sets over all card permutations; covers the five binary shapes', result='PASS')
(OUT/'solution-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))

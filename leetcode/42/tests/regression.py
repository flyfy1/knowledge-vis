"""Lesson-local self-check: execute canonical Python against per-column oracle."""
import itertools
import json
from pathlib import Path
import random

folder = Path(__file__).resolve().parents[1]
source = (folder / 'solution.py').read_text()
namespace = {}
exec(compile(source, str(folder / 'solution.py'), 'exec'), namespace)
solve = namespace['Solution']().trap
mirror = (folder / 'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';')) == source

def oracle(a):
    return sum(min(max(a[:i+1]), max(a[i:])) - h for i, h in enumerate(a))

count = 0
for n in range(1, 8):
    for values in itertools.product(range(4), repeat=n):
        a = list(values)
        before = a[:]
        assert solve(a) == oracle(a), a
        assert a == before
        count += 1
rng = random.Random(42)
for _ in range(500):
    a = [rng.randrange(100001) for _ in range(rng.randrange(1, 80))]
    before = a[:]
    assert solve(a) == oracle(a)
    assert a == before
    count += 1
fixtures = [([3,0,2,0,4],7), ([0,1,0,2,1,0,1,3,2,1,2,1],6),
            ([4,2,0,3,2,5],9), ([2,0,1,0,3],5), ([3,0,1],1),
            ([4,1,3],2), ([4],0), ([1,2,3,4],0),
            ([100000]+[0]*19998+[100000],1999800000), ([0]*20000,0), ([100000]*20000,0)]
for a, expected in fixtures:
    before = a[:]
    assert solve(a) == expected
    assert a == before
    count += 1
print(json.dumps({'python_cases':count,'canonical_mirror':'exact','nonmutation':'passed','fresh_case':5,'wrong_left_only_rule_counterexample':1}))

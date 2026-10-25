"""Independent direct-partition oracle, executable official callable, no network."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().splitArraySameAverage

def oracle(a):
    # Enumerate positions via combinations, compare the two sides directly.
    for k in range(1, len(a)):
        for positions in itertools.combinations(range(len(a)), k):
            chosen = set(positions)
            x = sum(a[i] for i in chosen)
            y = sum(v for i, v in enumerate(a) if i not in chosen)
            if x * (len(a) - k) == y * k:
                return True
    return False

count = 0
for n in range(1, 8):
    for values in itertools.product(range(3), repeat=n):
        a = list(values)
        before = a.copy()
        assert solve(a) == oracle(a), a
        assert a == before
        count += 1
rng = random.Random(805)
for _ in range(450):
    a = [rng.randrange(25) for _ in range(rng.randrange(1, 13))]
    assert solve(a) == oracle(a), a
    count += 1
fixtures = [([1,2,3,4,5,6,7,8], True), ([3,1],False),([0],False),
            ([10000],False),([0]*30,True),([10000]*30,True),
            ([0]*29+[1],False),([1,1,4],False),([1,1,1,9],False),
            ([1,2,4,5,6,6],True), (list(range(30)),True)]
for a, expected in fixtures:
    before = a.copy()
    assert solve(a) is expected, a
    assert a == before
# For [2]*29+[4], only k=15 passes divisibility. Its target is 31,
# but every subset sum is even, so this is an independent false certificate.
assert solve([2]*29+[4]) is False
mirror = (ROOT / 'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n')) == (ROOT / 'solution.py').read_text()
out = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
out.mkdir(parents=True, exist_ok=True)
report = {'result':'PASS','exhaustiveAndSeededCases':count,'boundaryFixtures':len(fixtures)+1,'seed':805,'interface':'Solution.splitArraySameAverage(self, nums: list[int]) -> bool','mutation':'preserved','sourceMirror':'exact'}
(out / 'python-results.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report))

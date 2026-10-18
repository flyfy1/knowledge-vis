"""Independent allocation enumeration and rating-order propagation; no dependencies."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('LESSON_TEST_OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('candy_solution', ROOT / 'solution.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
solve = m.Solution().candy

def feasible(r, c):
    return all(x >= 1 for x in c) and all(
        r[i] == r[i+1] or (c[i] > c[i+1] if r[i] > r[i+1] else c[i] < c[i+1])
        for i in range(len(r)-1))

def by_rating(r):
    # Independent dependency order, neither directional scan nor max(L,R).
    c = [1] * len(r)
    for i in sorted(range(len(r)), key=lambda i:r[i]):
        lower = [c[j] for j in (i-1,i+1) if 0 <= j < len(r) and r[j] < r[i]]
        c[i] = 1 + max(lower, default=0)
    assert feasible(r,c)
    return c

def repair(r):
    c = [1] * len(r)
    history = [c[:]]
    for _ in range(len(r)-1):
        old = c[:]
        for i in range(len(r)):
            for j in (i-1,i+1):
                if 0 <= j < len(r) and r[i] > r[j]:
                    c[i] = max(c[i], old[j]+1)
        history.append(c[:])
    return c,history

count = 0
for n in range(1,6):
    # A feasible allocation never needs >n; enumerate every candidate by total.
    candidates = sorted(itertools.product(range(1,n+1), repeat=n), key=sum)
    for r in itertools.product(range(3),repeat=n):
        expected = next(sum(c) for c in candidates if feasible(r,c))
        assert solve(list(r)) == expected == sum(by_rating(r))
        assert sum(repair(r)[0]) == expected
        count += 1
assert repair([3,2,1])[1] == [[1,1,1],[2,2,1],[3,2,1]]
assert solve([1,0,2]) == 5
assert solve([1,2,2]) == 4
assert solve([1,2,3,2,1,0]) == 13
rng=random.Random(135)
for _ in range(2000):
    r=[rng.randrange(50001) for _ in range(rng.randrange(1,101))]
    before=r[:]
    assert solve(r)==sum(by_rating(r))
    assert r==before
for r, expected in [(list(range(50000)),1250025000),(list(range(49999,-1,-1)),1250025000),([50000]*50000,50000),([0],1),([50000],1)]:
    assert solve(r)==expected
mirror=(ROOT/'python-code.js').read_text()
source=json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\n',mirror)[1])
assert source==(ROOT/'solution.py').read_text()
report={'status':'pass','exhaustive_ratings':count,'enumeration':'all allocations in 1..n, n≤5, ratings∈{0,1,2}','seeded_rating_order_checks':2000,'seed':135,'maximum_n':50000,'input_mutation':'none','official_examples':'pass','source_mirror':'exact','baseline_intermediate_rounds':'pass'}
(OUT/'python-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))

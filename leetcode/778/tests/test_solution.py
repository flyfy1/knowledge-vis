"""Run from any directory; OUTPUT_DIR redirects all emitted artifacts."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
from baseline import threshold_baseline


def oracle(grid, target=None):
    """Threshold reachability, independent of weighted shortest paths."""
    n = len(grid)
    target = target or (n-1, n-1)
    for level in sorted(v for row in grid for v in row):
        if grid[0][0] > level:
            continue
        reached = {(0, 0)}
        todo = [(0, 0)]
        while todo:
            r, c = todo.pop()
            for x, y in ((r-1,c),(r+1,c),(r,c-1),(r,c+1)):
                if (0 <= x < n and 0 <= y < n and
                    grid[x][y] <= level and (x,y) not in reached):
                    reached.add((x,y))
                    todo.append((x,y))
        if target in reached:
            return level


cases = [[[0]], [[0,2],[1,3]],
 [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],
  [11,17,18,19,20],[10,9,8,7,6]],
 [[0,1,8],[2,7,6],[3,4,5]], [[0,8,7],[1,6,5],[2,4,3]]]
assert [oracle(g) for g in cases] == [0,3,16,5,4]
for perm in itertools.permutations(range(4)):
    cases.append([list(perm[:2]),list(perm[2:])])
rng = random.Random(778)
for n, count in [(3,250),(4,120),(5,60),(8,25)]:
    for _ in range(count):
        a = list(range(n*n)); rng.shuffle(a)
        cases.append([a[i:i+n] for i in range(0,n*n,n)])
# Max constraint, known row-major answer is final height; highest-start case.
cases += [[[r*50+c for c in range(50)] for r in range(50)]]
a = list(range(2500)); a[0],a[-1]=a[-1],a[0]
cases += [[a[i:i+50] for i in range(0,2500,50)]]
for grid in cases:
    before = [r[:] for r in grid]
    expected = oracle(grid)
    assert mod.Solution().swimInWater(grid) == expected
    assert grid == before
    if len(grid) <= 5:
        assert threshold_baseline(grid) == expected
# Reusable fixtures for JS snapshot verification, no production algorithm oracle.
fixtures=[]
for grid in cases[:-2]:
    n=len(grid)
    fixtures.append({'grid':grid,'answer':oracle(grid),
      'optimal':[[oracle(grid,(r,c)) for c in range(n)] for r in range(n)]})
(OUT/'oracle-fixtures.json').write_text(json.dumps(fixtures)+'\n')
(OUT/'python-results.json').write_text(json.dumps({'cases':len(cases),
 'exhaustive':'all 24 permutations of 2×2','seed':778,
 'maxN':50,'canonicalExecution':True,'inputPreserved':True})+'\n')
print(f'PASS canonical Python and independent flood oracle: {len(cases)} cases')

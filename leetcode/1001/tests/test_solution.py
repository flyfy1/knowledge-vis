"""Run from any cwd. OUTPUT_DIR redirects all generated evidence."""
import collections
import copy
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

def oracle(n, lamps, queries):
    # Direct geometry: no four line dictionaries, no neighborhood-offset loop.
    active = set(map(tuple, lamps))
    ans = []
    for r, c in queries:
        ans.append(int(any(x == r or y == c or abs(x-r) == abs(y-c)
                           for x, y in active)))
        active = {(x, y) for x, y in active
                  if max(abs(x-r), abs(y-c)) > 1}
    return ans

checks = invariants = 0

def tracer(frame, event, arg):
    global invariants
    if frame.f_code.co_name == 'gridIllumination' and event == 'line' and frame.f_lineno in (15, 28):
        d = frame.f_locals
        expected = [collections.Counter(f(r, c) for r, c in d['active'])
                    for f in (lambda r,c:r, lambda r,c:c, lambda r,c:r-c, lambda r,c:r+c)]
        assert expected == [d[k] for k in ('rows','cols','down','up')]
        assert all(v > 0 for k in ('rows','cols','down','up') for v in d[k].values())
        invariants += 1
    return tracer

def run(n, lamps, queries, expected=None, instrument=True):
    global checks
    before = copy.deepcopy((lamps, queries))
    if instrument: sys.settrace(tracer)
    try: actual = m.Solution().gridIllumination(n, lamps, queries)
    finally: sys.settrace(None)
    target = oracle(n, lamps, queries) if expected is None else expected
    assert actual == target, (n, lamps, queries, actual, target)
    assert (lamps, queries) == before
    checks += 1

for n in (1, 2):
    cells = list(itertools.product(range(n), repeat=2))
    for mask in range(1 << len(cells)):
        lamps = [list(cells[i]) for i in range(len(cells)) if mask >> i & 1]
        for size in range(4):
            for queries in itertools.product(cells, repeat=size):
                run(n, lamps, [list(q) for q in queries])
# Official cases and deliberately duplicated lamp entries.
run(5, [[0,0],[4,4]], [[1,1],[1,0]], [1,0])
run(5, [[0,0],[4,4]], [[1,1],[1,1]], [1,1])
run(5, [[0,0],[0,4]], [[0,4],[0,1],[1,4]], [1,1,0])
run(5, [[1,0],[1,4]], [[2,0],[1,3],[3,2]], [1,1,0])
rng = random.Random(1001)
cases = []
for _ in range(1500):
    n = rng.randrange(1, 9)
    lamps = [[rng.randrange(n),rng.randrange(n)] for _ in range(rng.randrange(20))]
    queries = [[rng.randrange(n),rng.randrange(n)] for _ in range(rng.randrange(12))]
    run(n, lamps, queries)
    cases.append({'n':n,'lamps':lamps,'queries':queries,'expected':oracle(n,lamps,queries)})
# Maximum-size input, distant coordinates and no dense allocation.
run(10**9, [[0,0]]*20000, [[0,0]]*20000, [1]+[0]*19999, False)
run(10**9, [[i,999999999] for i in range(20000)], [[i,0] for i in range(20000)], [1]*20000, False)
# Send independently computed fixtures directly to the browser simulation core.
node = subprocess.run(['node', str(ROOT/'tests/test_core.cjs')], input=json.dumps(cases), text=True, capture_output=True, check=True)
result = {'canonicalCases':checks,'intermediateCanonicalInvariants':invariants,'seed':1001,'core':json.loads(node.stdout)}
(OUT/'numeric-results.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result))

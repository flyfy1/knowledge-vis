import ast
import hashlib
import itertools
import json
import os
from pathlib import Path
import random
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from solution import Solution
from baseline import baseline, roof_reachable
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
source = (ROOT / 'solution.py').read_text()
assert json.loads((ROOT / 'python-code.js').read_text().removeprefix('window.PYTHON_SOURCE = ').removesuffix(';\n')) == source

cases = []
for m, n in ((1, 1), (1, 3), (2, 2), (2, 3)):
    cells = list(itertools.product(range(m), range(n)))
    for bits in itertools.product((0, 1), repeat=m*n):
        grid = [list(bits[r*n:(r+1)*n]) for r in range(m)]
        for k in range(1, min(3, m*n)+1):
            for hits in itertools.permutations(cells, k):
                cases.append({'grid': grid, 'hits': hits})
rng = random.Random(803)
for _ in range(1000):
    m, n = rng.randint(1, 7), rng.randint(1, 7)
    cases.append({'grid': [[rng.randrange(2) for c in range(n)] for r in range(m)], 'hits': rng.sample(list(itertools.product(range(m), range(n))), rng.randint(1, m*n))})
for case in cases:
    g, h = case['grid'], case['hits']
    before = json.dumps([g, h])
    expected = baseline(g, h)
    actual = Solution().hitBricks(g, h)
    assert actual == expected, (case, actual, expected)
    assert json.dumps([g, h]) == before
    case['expected'] = expected

# Audit real Python DSU state after union/find calls return to the outer method.
checks = 0
codefile = str(ROOT / 'solution.py')
def audit(frame, event, arg):
    global checks
    if event == 'line' and frame.f_code.co_filename == codefile and frame.f_code.co_name == 'hitBricks':
        loc = frame.f_locals
        if 'before' in loc:
            work, parent, sizes, roof = (loc[k] for k in ('work', 'parent', 'size', 'roof'))
            def representative(x):
                seen = set()
                while parent[x] != x:
                    assert x not in seen
                    seen.add(x)
                    x = parent[x]
                return x
            # Skip the few lines between adding a cell and completing all its unions.
            line = source.splitlines()[frame.f_lineno - 1].strip()
            if line.startswith(('work[r][c] =', 'after =', 'return result')):
                assert sizes[representative(roof)] == len(roof_reachable(work))+1
                counts = {}
                for x in range(len(parent)):
                    root = representative(x)
                    counts[root] = counts.get(root, 0)+1
                assert all(sizes[root] == count for root, count in counts.items())
                checks += 1
    return audit
sys.settrace(audit)
for case in cases[::113]:
    Solution().hitBricks(case['grid'], case['hits'])
sys.settrace(None)

# Closed-form maximum dimensions, maximum hit count, long vertical chain.
grid = [[1]*200 for _ in range(200)]
hits = [[r,c] for r in range(200) for c in range(200)]
expected = [0]*40000
expected[199] = 39800
assert Solution().hitBricks(grid, hits) == expected
assert Solution().hitBricks([[1] for _ in range(200)], [[100,0]]) == [99]
assert Solution().hitBricks([[1,0,0],[1,1,1],[0,1,0]], [[1,0],[1,2]]) == [3,0]
assert Solution().hitBricks([[1,0,0],[0,1,1]], [[0,0],[1,1]]) == [0,0]
(OUT/'cases.json').write_text(json.dumps(cases))
result = subprocess.run(['node', str(ROOT/'tests/core-check.cjs'), str(OUT/'cases.json')], text=True, capture_output=True, check=True)
# Parse with acorn before JavaScript object evaluation can hide duplicate keys.
syntax = subprocess.run(['node', str(ROOT/'tests/copy-check.cjs')], text=True, capture_output=True, check=True)
report = {'cases': len(cases), 'pythonDSUIntermediateChecks': checks, 'maximum': '200x200, 40000 hits', 'sourceSHA256': hashlib.sha256(source.encode()).hexdigest(), 'core': result.stdout.strip(), 'copyShapeAndDuplicates': syntax.stdout.strip()}
(OUT/'numerical.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))

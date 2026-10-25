"""Independent supporting-line oracle; no monotone-chain construction."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('EVIDENCE_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

def oracle(points):
    if len(points) == 1:
        return {tuple(points[0])}
    result = set()
    for a, b in itertools.combinations(points, 2):
        # Coefficients of the line through a,b, derived independently.
        A, B = a[1] - b[1], b[0] - a[0]
        D = -(A * a[0] + B * a[1])
        signs = [A * p[0] + B * p[1] + D for p in points]
        if min(signs) >= 0 or max(signs) <= 0:
            result.update((tuple(a), tuple(b)))
    return result

grid = list(itertools.product(range(3), repeat=2))
cases = [[list(p) for p in subset] for n in range(1,10) for subset in itertools.combinations(grid,n)]
rng = random.Random(587)
for _ in range(400):
    cases.append([list(p) for p in rng.sample(list(itertools.product(range(8), repeat=2)),rng.randint(1,24))])
presets = json.loads(subprocess.check_output(['node', '-e', 'console.log(JSON.stringify(require("./core.js").presets))'], cwd=ROOT))
cases.extend(presets)
cases.extend([[[0,0],[100,100]],[[0,0],[0,100],[100,0],[100,100],[50,0],[0,50],[100,50],[50,100],[50,50]]])
expectations=[]
for ps in cases:
    before = [p[:] for p in ps]
    result = module.Solution().outerTrees(ps)
    expected = oracle(ps)
    assert set(map(tuple,result)) == expected, (ps,result,expected)
    assert len(result) == len(expected)
    assert ps == before
    expectations.append(sorted(map(list,expected)))
# Full official n=3000 limit: a complete 60x50 grid has only its outer rim.
large=[[x,y] for x in range(60) for y in range(50)]
large_expected={(x,y) for x,y in large if x in (0,59) or y in (0,49)}
assert set(map(tuple,module.Solution().outerTrees(large))) == large_expected
# Complete trace states compared to prefix-side support, not merely final answer.
payload={'cases':cases,'expected':expectations}
r=subprocess.run(['node', str(ROOT/'tests/check_core.cjs')],input=json.dumps(payload),text=True,capture_output=True,check=True)
report={'canonicalCases':len(cases)+1,'exhaustiveSubsets':511,'seed':587,'seededCases':400,'maximumN':3000,'browserCore':json.loads(r.stdout),'presets':expectations[-8:-2]}
(OUT/'algorithm.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))

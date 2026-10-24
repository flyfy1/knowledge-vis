"""Run from any directory. OUTPUT_DIR controls all emitted evidence."""
import ast
import copy
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence')).resolve()
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().trapRainWater

def oracle(h):
    """Independent integer-layer exterior connectivity, no heap or minimax recurrence."""
    m, n = len(h), len(h[0])
    depth = [[0] * n for _ in h]
    for z in range(1, max(map(max, h)) + 1):
        wet = {(r, c) for r in range(m) for c in range(n) if h[r][c] < z}
        outside = {v for v in wet if v[0] in (0, m - 1) or v[1] in (0, n - 1)}
        stack = list(outside)
        while stack:
            r, c = stack.pop()
            for dr, dc in ((-1, 0), (0, -1), (0, 1), (1, 0)):
                v = r + dr, c + dc
                if v in wet and v not in outside:
                    outside.add(v)
                    stack.append(v)
        for r, c in wet - outside:
            depth[r][c] += 1
    return sum(map(sum, depth)), [[h[r][c] + depth[r][c] for c in range(n)] for r in range(m)]

cases = []
for cells in itertools.product(range(3), repeat=9):
    cases.append([list(cells[i:i+3]) for i in range(0, 9, 3)])
rng = random.Random(407)
for _ in range(450):
    m, n = rng.randint(1, 5), rng.randint(1, 6)
    cases.append([[rng.randrange(10) for _ in range(n)] for _ in range(m)])
official = json.loads((ROOT / 'provenance/official.json').read_text())['response']['data']['question']
assert any(s['langSlug']=='python3' and 'trapRainWater' in s['code'] for s in official['codeSnippets'])
examples = [json.loads(x) for x in official['exampleTestcases'].splitlines()]
for h, expected in zip(examples, (4, 10)):
    assert solve(h)==expected
cases += examples
# Gate experiment endpoints and all intermediate positions.
for gate in range(6):
    cases.append([[5,5,5,5,5],[5,1,1,5,5],[5,5,1,1,gate],[5,5,5,5,5],[5,5,5,5,5]])
transfer = [[4,4,4,4,4],[4,0,3,0,2],[4,4,4,4,4]]
assert oracle(transfer)[0] == 5
cases.append(transfer)
fixtures = []
for h in cases:
    saved=copy.deepcopy(h)
    expected, levels=oracle(h)
    assert solve(h)==expected, h
    assert h==saved
    fixtures.append({'h':h,'water':expected,'levels':levels})
# Max-constraint closed forms do not run the expensive layer baseline.
bowl = [[20000 if r in (0,199) or c in (0,199) else 0 for c in range(200)] for r in range(200)]
large = [(bowl,784080000), ([[20000]*200 for _ in range(200)],0), ([[0]*200 for _ in range(200)],0), ([[20000,0]*100],0), ([[20000,0] for _ in range(200)],0)]
for h, expected in large:
    saved=copy.deepcopy(h); assert solve(h)==expected; assert saved==h
source=(ROOT/'solution.py').read_text()
mirror=(ROOT/'python-code.js').read_text()
assert mirror=='window.PYTHON_SOURCE = '+json.dumps(source,ensure_ascii=False)+';\n'
ast.parse(source)
result=subprocess.run(['node',str(ROOT/'tests/test_core.cjs')],input=json.dumps(fixtures),text=True,capture_output=True,check=True)
summary={'python_oracle_cases':len(cases),'exhaustive_3x3_ternary':3**9,'seeded_rectangles':450,'max_constraint_closed_forms':len(large),'source_parity':True,'core':json.loads(result.stdout),'status':'PASS'}
(OUT/'numerical.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary,indent=2))

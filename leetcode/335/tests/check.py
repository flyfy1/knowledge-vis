"""Run from any directory. OUTPUT_DIR redirects every generated artifact."""
import sys
sys.dont_write_bytecode = True
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

def load(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / (name + '.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

solve = load('solution').Solution().isSelfCrossing
baseline = load('baseline')
oracle = baseline.first_crossing
cases = []
for n in range(1, 10):
    for xs in itertools.product(range(1, 4), repeat=n):
        cases.append(list(xs))
rng = random.Random(335)
cases += [[rng.randint(1, 100000) for _ in range(rng.randint(1, 35))] for _ in range(5000)]
cases += [[2,1,1,2], [1,2,3,4], [1,1,1,2,1], [1,1,2,1,1], [1,1,2,2,1,1], [1,1,3,2,2,1], [100000], [100000]*3]
rows = []
offsets = set()
for xs in cases:
    before = xs[:]
    pair = oracle(xs)
    assert solve(xs) == (pair is not None), (xs, pair)
    assert xs == before
    if pair:
        i = pair[0]
        points = [(0,0)]
        for k, length in enumerate(xs[:i+1]):
            dx, dy = [(0,1),(-1,0),(0,-1),(1,0)][k % 4]
            a,b = points[-1]
            points.append((a+dx*length,b+dy*length))
        contacts = [j for j in range(i-1) if baseline.intersects(points[i], points[i+1], points[j], points[j+1])]
        local = [i-j for j in contacts if 3 <= i-j <= 5]
        assert local, (xs, contacts)
        offsets.update(local)
        # The first-event invariant, checked independently on prefixes.
        assert oracle(xs[:pair[0]]) is None
        assert solve(xs[:pair[0]]) is False
        assert solve(xs[:pair[0]+1]) is True
    rows.append({'x':xs, 'pair':pair, 'contacts':contacts if pair else []})
assert offsets == {3,4,5}
assert [solve(x) for x in [[2,1,1,2],[1,2,3,4],[1,1,1,2,1]]] == [True,False,True]
# Maximal valid size: a strictly expanding spiral cannot cross; equal sides touch.
assert solve(list(range(1,100001))) is False
assert solve([100000]*100000) is True
source = (ROOT / 'solution.py').read_text()
mirror = (ROOT / 'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n'
fixture = OUT / 'oracle-cases.json'
fixture.write_text(json.dumps(rows))
run = subprocess.run(['node', str(ROOT / 'tests/core.cjs'), str(fixture)], check=True, capture_output=True, text=True)
report={'kind':'author computational self-check','cases':len(cases),'exhaustive':'all lengths 1..9 over {1,2,3}', 'seed':335,'randomCases':5000,'firstContactOffsets':sorted(offsets),'maxN':100000,'mutation':'unchanged','mirror':'exact','javascript':json.loads(run.stdout)}
(OUT / 'numeric-results.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))

"""Run: python3 -B leetcode/741/tests/check.py; optional OUTPUT_DIR."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import subprocess
import sys
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
from oracle import oracle, layer_oracle, prefixes
solve = m.Solution().cherryPickup
cases = []
for n in [1, 2, 3]:
    inner = [(r, c) for r in range(n) for c in range(n) if (r,c) not in [(0,0),(n-1,n-1)]]
    for endpoints in itertools.product([0,1], repeat=1 if n == 1 else 2):
        for values in itertools.product([-1,0,1], repeat=len(inner)):
            g = [[0]*n for _ in range(n)]
            g[0][0], g[-1][-1] = endpoints[0], endpoints[-1]
            for (r,c), v in zip(inner, values): g[r][c] = v
            cases.append(g)
rng = random.Random(741)
for _ in range(140):
    n=rng.randrange(2,6)
    g=[[rng.choice([-1,0,1,1]) for _ in range(n)] for _ in range(n)]
    g[0][0]=rng.randrange(2);g[-1][-1]=rng.randrange(2)
    cases.append(g)
fixtures = []
for g in cases:
    before = [r[:] for r in g]
    expected = oracle(g)
    assert solve(g) == expected, (g, expected, solve(g))
    assert g == before, 'input mutation'
    layers = [layer_oracle(g,t) for t in range(2*len(g)-1)]
    fixtures.append({'grid':g, 'layers':layers})
for n in [2, 7, 50]:
    assert solve([[1]*n for _ in range(n)]) == 4*n-4
    assert solve([[0]*n for _ in range(n)]) == 0
assert solve([[0,1,-1],[1,0,-1],[1,1,1]]) == 5
assert solve([[1,1,-1],[1,-1,1],[-1,1,1]]) == 0
# The quiz's stated values and four candidates are checked independently.
q=[[1,1,0],[1,1,1],[0,0,1]]
assert layer_oracle(q,1) == [[2,3,None],[3,2,None],[None,None,None]]
assert layer_oracle(q,2)[1][0] == 4
# Unique richest first path forces 8; joint optimum attains 9.
g=[[0,0,1,1],[1,0,1,0],[1,1,1,1],[1,1,0,1]]
ps=prefixes(g,6)
score=lambda s:sum(g[r][c] for r,c in s)
best=max(score(s) for _,s in ps)
greedy=[s for _,s in ps if score(s)==best]
assert best==6 and len(greedy)==1
assert max(score(greedy[0]|s) for _,s in ps)==8 and oracle(g)==9
proc = subprocess.run(['node', str(ROOT/'tests/core.cjs')], input=json.dumps(fixtures), text=True, capture_output=True)
assert proc.returncode == 0, proc.stdout+proc.stderr
report={'kind':'author self-check','cases':len(cases),'exhaustive':'all official-valid n=1,2,3 ternary grids','seeded':140,'seed':741,'canonical':'executed Python3 official interface; unchanged input','intermediate':'every DP state compared with enumerated prefix unions in JS','boundaries':'n=50 all ones=196; all zero=0; single cells; obstacles; both official examples','quiz':'independent layer values verified','greedy':'unique best single path=6, forced total=8, joint total=9','js':proc.stdout.strip()}
(OUT/'numerical.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))

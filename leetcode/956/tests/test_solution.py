"""Run from repository root; OUTPUT_DIR redirects every generated artifact."""
import ast
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('candidate', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().tallestBillboard

def oracle(rods):
    best = 0
    for choices in itertools.product((0, 1, 2), repeat=len(rods)):
        a = sum(x for x, c in zip(rods, choices) if c == 1)
        b = sum(x for x, c in zip(rods, choices) if c == 2)
        if a == b:
            best = max(best, a)
    return best

def mitm(rods):
    # Signed difference + total used; independently joins two assignment halves.
    def half(xs):
        result = {}
        for choices in itertools.product((-1, 0, 1), repeat=len(xs)):
            delta = sum(x*c for x,c in zip(xs, choices))
            used = sum(x for x,c in zip(xs, choices) if c)
            result[delta] = max(result.get(delta, 0), used)
        return result
    m = len(rods)//2
    a, b = half(rods[:m]), half(rods[m:])
    return max(used+b[-d] for d,used in a.items() if -d in b)//2

count=0
for n in range(1,6):
    for values in itertools.product(range(1,5), repeat=n):
        rods=list(values); before=rods[:]
        assert solve(rods)==oracle(rods), rods
        assert rods==before
        count+=1
rng=random.Random(956)
for _ in range(100):
    rods=[rng.randint(1,15) for _ in range(rng.randint(1,8))]
    assert solve(rods)==oracle(rods), rods
large=[]
for rods,expected in [([1,2,3,6],6),([1,2,3,4,5,6],10),([1,2],0),([5],0),([2,2,2],2),([1000]*5,2000),([250]*20,2500),(list(range(240,260)),None)]:
    expected=mitm(rods) if expected is None else expected
    assert solve(rods)==expected
    large.append(dict(rods=rods,expected=expected))
source=(ROOT/'solution.py').read_text()
mirror=(ROOT/'python-code.js').read_text()
assert json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (".*");\n',mirror)[1])==source
# Reject duplicate object keys before evaluating the copy module.
copy=(ROOT/'copy.js').read_text()
keys=re.findall(r'(?:^|[,\n])\s*(\w+)\s*:',copy)
assert len(keys)==len(set(keys)), 'duplicate translation key'
# Execute the exact displayed baseline independently, not a rewritten substitute.
html=(ROOT/'index.html').read_text()
from html import unescape
baseline=unescape(re.search(r'id="baselineSource">(.*?)</code>',html,re.S)[1])
ns={};exec(baseline,ns)
for rods in ([1,2,3],[1,2],[2,2,2],[1,2,3,4,5,6]):
    assert ns['baseline'](rods)==oracle(rods)
result=dict(status='pass',exhaustive=count,seeded=100,seed=956,boundaries=large,mirrorExact=True,duplicateKeys=False,baselineExecuted=True)
(OUT/'python-results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))

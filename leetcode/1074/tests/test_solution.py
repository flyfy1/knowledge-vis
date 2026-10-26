"""Run: python3 -B leetcode/1074/tests/test_solution.py. OUTPUT_DIR optional."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import re
import time

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().numSubmatrixSumTarget


def direct(a, target):
    result = 0
    for top in range(len(a)):
        for bottom in range(top, len(a)):
            for left in range(len(a[0])):
                for right in range(left, len(a[0])):
                    total = 0
                    for r in range(top, bottom + 1):
                        for c in range(left, right + 1):
                            total += a[r][c]
                    result += int(total == target)
    return result


count = 0
started = time.time()

def check(a, target, expected=None):
    global count
    before = [r[:] for r in a]
    wanted = direct(a, target) if expected is None else expected
    got = solve(a, target)
    assert got == wanted, (a, target, wanted, got)
    assert before == a, 'submission mutated input'
    count += 1


for a, target, expected in [([[0,1,0],[1,1,1],[0,1,0]],0,4),
                            ([[1,-1],[-1,1]],0,5), ([[904]],0,0)]:
    check(a,target,expected)
for m,n in [(1,1),(1,2),(2,1),(2,2),(2,3),(3,2)]:
    for values in itertools.product([-1,0,1], repeat=m*n):
        a = [list(values[r*n:(r+1)*n]) for r in range(m)]
        for target in range(-3,4):
            check(a,target)
rng = random.Random(1074)
for _ in range(500):
    m,n = rng.randint(1,5),rng.randint(1,5)
    a = [[rng.randint(-5,5) for _ in range(n)] for _ in range(m)]
    check(a,rng.randint(-12,12))
for m,n in [(1,100),(100,1),(100,100)]:
    check([[0]*n for _ in range(m)],0,m*(m+1)*n*(n+1)//4)
    check([[1000]*n for _ in range(m)],10**8,0)
    check([[-1000]*n for _ in range(m)],-10**8,0)
check([[1000]*100 for _ in range(100)],10**7,1)
check([[-1000]*100 for _ in range(100)],-10**7,1)
check([[2,-2,2,-2]],0,4)
# Exact displayed baseline also executes, independent from optimized implementation.
html = (ROOT/'index.html').read_text()
baseline = re.search(r'<code>(def direct\(matrix, target\):.*?)</code>',html,re.S)[1]
namespace = {}
exec(baseline, namespace)
assert namespace['direct']([[1,-1],[-1,1]],0) == 5
# Reject duplicates before JSON parsing can silently overwrite keys.
def unique(pairs):
    d = {}
    for k,v in pairs:
        assert k not in d, ('duplicate copy key',k)
        d[k]=v
    return d
copy = (ROOT/'copy.js').read_text()
pairs = json.loads(copy[copy.index('{'):copy.rindex('}')+1],object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(s,str) and s for s in v) for v in pairs.values())
keys = re.findall(r'data-i18n="(.*?)"',html)
assert all(k in pairs for k in keys)
mirror = (ROOT/'python-code.js').read_text()
assert json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\n',mirror)[1]) == (ROOT/'solution.py').read_bytes().decode()
report = {'kind':'author self-check','python_cases':count,'exhaustive':'all matrices over {-1,0,1} in 1x1,1x2,2x1,2x2,2x3,3x2; targets -3..3','random':'500 seed=1074, up to 5x5','boundaries':'100x100 zeros, +/-1000, +/-1e8 targets; +/-1e7 full rectangle; single rows and columns','copy_keys':len(pairs),'source_mirror_exact':True,'baseline_exec':True,'seconds':round(time.time()-started,3)}
(OUT/'python-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))

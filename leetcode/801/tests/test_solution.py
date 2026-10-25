import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import sys
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().minSwap

# Independent enumeration: actually construct both rows; no DP guards reused.
def oracle(a, b, endpoint=None):
    answers = []
    for choices in itertools.product((0, 1), repeat=len(a)):
        if endpoint is not None and choices[-1] != endpoint:
            continue
        rows = tuple(zip(*[(b[i], a[i]) if c else (a[i], b[i])
                           for i, c in enumerate(choices)]))
        if all(all(x < y for x, y in zip(row, row[1:])) for row in rows):
            answers.append(sum(choices))
    return min(answers, default=float('inf'))

count = 0
for n in range(2, 5):
    for values in itertools.product(range(4), repeat=2*n):
        a, b = list(values[:n]), list(values[n:])
        expected = oracle(a, b)
        if expected == float('inf'):
            continue  # outside official solvable domain
        original = (a[:], b[:])
        assert solve(a, b) == expected, (a, b, expected)
        assert (a, b) == original
        count += 1
rng = random.Random(801)
random_cases = []
for _ in range(500):
    n = rng.randrange(2, 11)
    # Generate increasing final rows, then independently exchange columns.
    x = sorted(rng.sample(range(50), n)); y = sorted(rng.sample(range(50), n))
    a, b = x[:], y[:]
    for i in range(n):
        if rng.randrange(2): a[i], b[i] = b[i], a[i]
    assert solve(a, b) == oracle(a, b)
    random_cases.append({'a': a, 'b': b, 'costs': [[oracle(a[:i], b[:i], e) for e in (0,1)] for i in range(1,n+1)]})
fixtures = [([0,200000],[0,200000],0),([0,4,3,4],[0,2,5,6],1),([1,3,5,4],[1,2,3,7],1),([0,3,5,8,9],[2,1,4,6,9],1),([1,2],[1,2],0),([1,1],[0,2],1),([0,5,4,8,7],[1,2,6,5,9],2)]
for a,b,e in fixtures: assert solve(a,b)==oracle(a,b)==e
n=100000
a=list(range(n));b=list(range(n,2*n))
assert solve(a,b)==0
for i in range(0,n,2): a[i],b[i]=b[i],a[i]
assert solve(a,b)==50000
source=(ROOT/'solution.py').read_text()
mirror=(ROOT/'python-code.js').read_text()
assert json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').rstrip().removesuffix(';'))==source
# Parse the copy object before JavaScript can silently overwrite duplicate keys.
import re
keys=re.findall(r'(?:^|[,{])\s*([A-Za-z][A-Za-z0-9]*)\s*:\s*\[', (ROOT/'copy.js').read_text(), re.M)
assert len(keys)==len(set(keys))
(OUT/'oracle-cases.json').write_text(json.dumps(random_cases))
(OUT/'solution.json').write_text(json.dumps({'exhaustive_feasible_cases':count,'seeded':500,'maximum_n':100000,'official_examples':'pass','source_parity':'pass','duplicate_copy_keys':'none'},indent=2))
print('Python official interface, exhaustive feasible cases:',count,'; 500 seeded and maximum boundaries PASS')

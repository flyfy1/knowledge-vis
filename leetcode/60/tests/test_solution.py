"""Run: python3 leetcode/60/tests/test_solution.py. Optional OUTPUT_DIR."""
import sys
sys.dont_write_bytecode = True
import importlib.util
import itertools
import json
import math
import os
from pathlib import Path
import random
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('solution60', ROOT/'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().getPermutation
count = 0
for n in range(1, 8):
    for k, p in enumerate(itertools.permutations(map(str, range(1, n+1))), 1):
        assert solve(n, k) == ''.join(p), (n, k)
        count += 1

def rank(s):
    # Independent ranking: count smaller digits to the right, not unranking.
    return 1 + sum(sum(b < a for b in s[i+1:]) * math.factorial(len(s)-i-1)
                   for i, a in enumerate(s))

rng = random.Random(60018)
large = 0
for n in (8, 9):
    for k in [1, math.factorial(n), *[rng.randint(1, math.factorial(n)) for _ in range(500)]]:
        s = solve(n, k)
        assert sorted(s) == list(map(str, range(1, n+1)))
        assert rank(s) == k
        large += 1
for n in range(1, 10):
    assert solve(n, 1) == ''.join(map(str, range(1, n+1)))
    assert solve(n, math.factorial(n)) == ''.join(map(str, range(n, 0, -1)))
assert solve(3,3)=='213' and solve(4,9)=='2314' and solve(3,1)=='123'
mirror = (ROOT/'python-code.js').read_text().split('const PYTHON_SOURCE = ',1)[1].rstrip().removesuffix(';')
assert json.loads(mirror) == (ROOT/'solution.py').read_text()
report={'type':'author self-check','exhaustive_cases':count,'seeded_and_large_cases':large,'endpoints':'n=1..9','official_examples':3,'source_mirror':'exact','result':'pass'}
print(json.dumps(report, indent=2))
if os.environ.get('OUTPUT_DIR'):
    out=Path(os.environ['OUTPUT_DIR']);out.mkdir(parents=True,exist_ok=True)
    (out/'python-results.json').write_text(json.dumps(report,indent=2)+'\n')

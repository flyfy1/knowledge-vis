"""Execute the canonical interface against independent enumeration/period oracles."""
import importlib.util
import json
import os
from pathlib import Path
import random
import math

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().nthMagicalNumber
M = 1_000_000_007


def enumerate_oracle(n, a, b):
    x, remaining = 0, n
    while remaining:
        x += 1
        if x % a == 0 or x % b == 0:
            remaining -= 1
    return x


def period_oracle(n, a, b):
    # Construct actual values in one period; no prefix floor count or search.
    period = math.lcm(a, b)
    values = sorted(set(range(a, period + 1, a)) | set(range(b, period + 1, b)))
    blocks, offset = divmod(n - 1, len(values))
    return blocks * period + values[offset]


count = 0
for a in range(2, 16):
    for b in range(2, 16):
        for n in range(1, 41):
            expected = enumerate_oracle(n, a, b)
            assert solve(n, a, b) == expected % M, (n, a, b)
            assert period_oracle(n, a, b) == expected
            count += 1
rng = random.Random(878)
for _ in range(350):
    n, a, b = rng.randint(1, 10**9), rng.randint(2, 40000), rng.randint(2, 40000)
    assert solve(n, a, b) == period_oracle(n, a, b) % M, (n, a, b)
    count += 1
cases = [(1,2,3),(4,2,3),(10**9,40000,40000),(10**9,39999,40000),
         (10**9,2,40000),(10**9,39999,39999),(1,40000,39999),(7,3,5)]
results = []
for n,a,b in cases:
    raw = period_oracle(n,a,b)
    got = solve(n,a,b)
    assert got == raw % M
    results.append({'input':[n,a,b],'raw':raw,'residue':got})
report = {'result':'pass','exhaustive':7840,'seeded':350,'seed':878,'boundaries':results,
          'execution':'Actual Solution.nthMagicalNumber; no LeetCode submission performed',
          'oracles':'Direct divisibility enumeration; distinct values within one LCM period'}
(OUT/'python-result.json').write_text(json.dumps(report,indent=2)+'\n')
print('Python passed:',count+len(cases),'cases')

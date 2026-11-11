import importlib.util
import json
import os
import random
import re
import time
from pathlib import Path
from baseline import enumerate_commands

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('EVIDENCE_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().racecar

# Independent distance decomposition DP, no queue or car-state visitation.
def distance_oracle(limit):
    dp = [0] * (limit + 1)
    for t in range(1, limit + 1):
        n = t.bit_length()
        if t == (1 << n) - 1:
            dp[t] = n
            continue
        dp[t] = n + 1 + dp[(1 << n) - 1 - t]
        for m in range(n - 1):
            remaining = t - ((1 << (n - 1)) - 1) + ((1 << m) - 1)
            dp[t] = min(dp[t], n + m + 1 + dp[remaining])
    return dp

expected = distance_oracle(10000)
records = []
for t in range(1, 26):
    actual = solve(t)
    assert actual == enumerate_commands(t) == expected[t], (t, actual)
    records.append({'target': t, 'answer': actual, 'oracle': 'raw-string enumeration and independent distance DP'})
rng = random.Random(818)
for t in sorted(set([1, 3, 6, 9809, 9879, 10000, 9999, 8191, 8192] + [rng.randint(1, 1000) for _ in range(18)])):
    start = time.perf_counter()
    actual = solve(t)
    assert actual == expected[t], (t, actual, expected[t])
    records.append({'target': t, 'answer': actual, 'seconds': time.perf_counter() - start, 'oracle': 'distance DP numerical corroboration; correctness rests on lower-bound/goal-pop proof'})
for k in range(1, 14):
    t = (1 << k) - 1
    assert solve(t) == k
mirror = (ROOT / 'python-code.js').read_text()
assert json.loads(re.fullmatch(r'window.PYTHON_SOURCE = (.*);\n', mirror)[1]) == (ROOT / 'solution.py').read_text()
(OUT / 'python-results.json').write_text(json.dumps({'kind': 'author self-check', 'records': records, 'mersenne_boundaries': 13, 'sourceParity': True}, indent=2))
print('Python checks passed:', len(records), 'cases + 13 closed-form boundaries')

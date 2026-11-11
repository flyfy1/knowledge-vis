"""Compare solution.py (A*) with the independent distance DP for every target 1..10000.

The page (copy.js `routes`) quotes this run: 0 mismatches, mean and slowest per-target time,
and the DP's time for all targets. Timings depend on the machine; about 8 minutes in total.
Usage: python3 -B leetcode/818/tests/compare_dp_all.py [output.json]
"""
import importlib.util
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
check_source = (ROOT / 'tests/check.py').read_text()
namespace = {}
exec(check_source[check_source.index('def distance_oracle'):check_source.index('expected = ')], namespace)
distance_oracle = namespace['distance_oracle']

start = time.perf_counter()
dp = distance_oracle(10000)
dp_seconds = time.perf_counter() - start
mismatches, slowest, total = [], (0.0, 0), 0.0
for target in range(1, 10001):
    start = time.perf_counter()
    answer = mod.Solution().racecar(target)
    elapsed = time.perf_counter() - start
    total += elapsed
    if answer != dp[target]:
        mismatches.append(target)
    slowest = max(slowest, (elapsed, target))
report = {'targets': 10000, 'mismatches': mismatches, 'meanMs': round(total / 10, 1),
          'slowestSeconds': round(slowest[0], 3), 'slowestTarget': slowest[1],
          'dpAllTargetsSeconds': round(dp_seconds, 3)}
if len(sys.argv) > 1:
    Path(sys.argv[1]).write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
assert not mismatches

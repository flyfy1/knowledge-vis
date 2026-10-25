"""Run from any directory. OUTPUT_DIR controls all generated evidence."""
import importlib.util
import json
import os
from pathlib import Path
import random
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = Path(os.environ.get('OUTPUT_DIR', HERE / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)

def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

solve = load('solution', ROOT / 'solution.py').Solution().reachingPoints
baseline = load('baseline', HERE / 'baseline.py').baseline
rng = random.Random(780)
cases = []
for sx in range(1, 8):
    for sy in range(1, 8):
        for tx in range(1, 18):
            for ty in range(1, 18):
                cases.append(([sx, sy, tx, ty], baseline(sx, sy, tx, ty)))
for _ in range(1200):
    a = [rng.randint(1, 50) for _ in range(4)]
    cases.append((a, baseline(*a)))
# Construct legal large paths using forward moves, never backward arithmetic.
for _ in range(400):
    sx, sy = rng.randint(1, 100), rng.randint(1, 100)
    x, y = sx, sy
    for _ in range(70):
        if x + y > 10**9:
            break
        if rng.randrange(2):
            x += y
        else:
            y += x
    cases.append(([sx, sy, x, y], True))
known = [([1,1,3,5], True),([1,1,2,2], False),([1,1,1,1], True),([3,3,3,9], True),
         ([2,3,17,5], True),([2,3,3,4], False),([10**9,10**9,10**9,10**9], True),
         ([1,1,1,10**9], True),([1,1,10**9,1], True),([1,1,10**9,10**9], False),
         ([3,2,3,10**9], False),([3,2,3,999999998], True),([5,3,4,9], False)]
cases += known
for args, expected in cases:
    actual = solve(*args)
    assert type(actual) is bool and actual == expected, (args, expected, actual)
# The browser model is tested independently with identical forward-oracle fixtures.
proc = subprocess.run(['node', str(HERE/'test_core.cjs')], input=json.dumps(cases), text=True, capture_output=True, check=True)
report = {'canonicalPythonCases': len(cases), 'oracle': 'Forward BFS over bounded positive grid; seeded forward construction for large true cases; closed-form boundary expectations', 'seed':780, 'core': json.loads(proc.stdout)}
(OUT / 'numerical.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))

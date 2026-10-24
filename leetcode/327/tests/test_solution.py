"""Independent raw-slice oracle; canonical official interface is actually executed."""
import sys
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical', ROOT / 'solution.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
solution = m.Solution()

def oracle(a, low, high):
    return sum(low <= sum(a[i:j]) <= high
               for i in range(len(a)) for j in range(i + 1, len(a) + 1))

cases = 0
for n in range(1, 7):
    for a in itertools.product((-1, 0, 1), repeat=n):
        for low in range(-2, 3):
            for high in range(low, 3):
                nums = list(a)
                assert solution.countRangeSum(nums, low, high) == oracle(a, low, high), (a, low, high)
                assert nums == list(a)
                cases += 1
rng = random.Random(327)
for _ in range(1500):
    a = [rng.choice([-2**31, 2**31-1, rng.randrange(-30, 31)]) for _ in range(rng.randrange(1, 35))]
    low, high = sorted(rng.choices(range(-60, 61), k=2))
    assert solution.countRangeSum(a, low, high) == oracle(a, low, high)
    cases += 1
for a, lo, hi, result in [([-2,5,-1],-2,2,3),([0],0,0,1),([1,-1],-1,-1,1),([0]*65535,0,0,2147450880),([1]*100000,0,0,0),([2**31-1]*100000,-100000,100000,0)]:
    assert solution.countRangeSum(a, lo, hi) == result
# Inspect the real Python recursion's return invariant against original index blocks.
returns_checked = 0
for _ in range(40):
    nums = [rng.randrange(-5, 6) for _ in range(rng.randrange(1, 15))]
    low, high = sorted(rng.choices(range(-8, 9), k=2))
    original = [sum(nums[:i]) for i in range(len(nums) + 1)]
    def audit(frame, event, result):
        global returns_checked
        if frame.f_code.co_name == 'count' and event == 'return':
            lo, hi = frame.f_locals['lo'], frame.f_locals['hi']
            assert frame.f_locals['prefix'][lo:hi] == sorted(original[lo:hi])
            expected = sum(low <= original[j] - original[i] <= high
                           for i in range(lo, hi) for j in range(i + 1, hi))
            assert result == expected
            returns_checked += 1
        return audit
    sys.settrace(audit)
    try:
        solution.countRangeSum(nums, low, high)
    finally:
        sys.settrace(None)

mirror=(ROOT/'python-code.js').read_text()
assert mirror.startswith('window.PYTHON_SOURCE = ') and mirror.endswith(';\n')
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):-2]) == (ROOT/'solution.py').read_text()
# Duplicate-key check before Object.fromEntries can hide an accidental key overwrite.
import re
keys=re.findall(r"\['([^']+)',\[",(ROOT/'copy.js').read_text(),re.M)
assert len(keys)==len(set(keys))
assert len(keys)>70
report={'oracle_cases':cases,'canonical_returns_checked':returns_checked,'large_boundary_cases':3,'official_examples':2,'source_mirror_exact':True,'duplicate_copy_keys':False,'status':'PASS (author self-check)'}
(OUT/'python-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))

"""Author checks. OUTPUT_DIR redirects emitted evidence; no production writes."""
import collections
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import sys
import time

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('canonical629', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().kInversePairs
MOD = 1_000_000_007


def histogram(n):
    # Independent definition: enumerate every arrangement and every index pair.
    hist = collections.Counter()
    for a in itertools.permutations(range(1, n + 1)):
        count = 0
        for left in range(n):
            for right in range(left + 1, n):
                if a[left] > a[right]:
                    count += 1
        hist[count] += 1
    return [hist[j] for j in range(n * (n - 1) // 2 + 1)]


def direct(n, k):
    # Deliberately recompute each insertion sum; never use sliding subtraction.
    row = [1] + [0] * k
    for size in range(1, n + 1):
        row = [sum(row[j - x] for x in range(min(size - 1, j) + 1)) % MOD
               for j in range(k + 1)]
    return row[k]


def polynomial(n, k):
    # Coefficient of product(1-q^i)/(1-q)^n, with no DP window.
    numerator = [1] + [0] * k
    for i in range(1, min(n, k) + 1):
        for j in range(k, i - 1, -1):
            numerator[j] = (numerator[j] - numerator[j - i]) % MOD
    # Coefficients of (1-q)^(-n) are C(n+j-1,j).
    binom = [1]
    for j in range(1, k + 1):
        binom.append(binom[-1] * (n + j - 1) * pow(j, MOD - 2, MOD) % MOD)
    return sum(numerator[j] * binom[k - j] for j in range(k + 1)) % MOD


started = time.time()
hists = {n: histogram(n) for n in range(0, 9)}
cases = []
for n in range(1, 9):
    hist = hists[n]
    for k in range(len(hist) + 3):
        expected = hist[k] if k < len(hist) else 0
        assert solve(n, k) == expected, (n, k)
        cases.append([n, k, expected])
    assert sum(hist) == __import__('math').factorial(n)
    assert hist == hist[::-1]

rng = random.Random(629)
for _ in range(180):
    n, k = rng.randint(1, 45), rng.randint(0, 90)
    expected = direct(n, k)
    assert solve(n, k) == expected == polynomial(n, k), (n, k)
    cases.append([n, k, expected])

# Check the ACTUAL canonical function at the assignment boundary, not a rewrite.
source_lines = (ROOT / 'solution.py').read_text().splitlines()
assignment_line = next(i + 1 for i, s in enumerate(source_lines) if s.strip() == 'cur[j] = window')
invariant_checks = 0

def observe(frame, event, arg):
    global invariant_checks
    if frame.f_code.co_filename == str(ROOT / 'solution.py') and event == 'line' and frame.f_lineno == assignment_line:
        v = frame.f_locals
        i, j = v['i'], v['j']
        hist = hists[i]
        expected = hist[j] if j < len(hist) else 0
        assert v['window'] == expected
        assert v['window'] == sum(v['prev'][max(0, j-i+1):j+1]) % MOD
        assert v['cur'][:j] == [hist[z] if z < len(hist) else 0 for z in range(j)]
        invariant_checks += 1
    return observe

sys.settrace(observe)
for n in range(1, 8):
    for k in range(min(15, n*(n-1)//2) + 1):
        solve(n, k)
sys.settrace(None)

large = []
for n, k, closed in [(1000, 0, 1), (1000, 1, 999), (1000, 2, 499499),
                     (45, 990, 1), (45, 989, 44), (1, 1000, 0),
                     (1000, 1000, None), (46, 1000, None), (100, 500, None)]:
    expected = polynomial(n, k)
    if closed is not None:
        assert expected == closed, (n,k,expected,closed)
    actual = solve(n, k)
    assert actual == expected, (n,k,actual,expected)
    large.append([n,k,actual])

# Exact single-assignment mirror including final newline.
mirror = (ROOT / 'python-code.js').read_text()
assert mirror.startswith('window.PYTHON_SOURCE = ') and mirror.endswith(';\n')
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):-2]) == (ROOT / 'solution.py').read_bytes().decode('utf8')
(OUT / 'oracle-cases.json').write_text(json.dumps({'histograms':hists,'cases':cases,'large':large},indent=2)+'\n')
report = {'kind':'author canonical Python execution self-check','status':'PASS','exhaustiveN':'1..8, every feasible k plus impossible targets','seed':629,'seededCases':180,'intermediateCanonicalChecks':invariant_checks,'maxBounds':large,'seconds':round(time.time()-started,3)}
(OUT / 'python-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))

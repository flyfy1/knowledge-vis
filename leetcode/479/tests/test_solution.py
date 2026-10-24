"""Run from repo root; outputs may be redirected with LESSON_OUTPUT_DIR."""
import ast
import importlib.util
import json
import os
from pathlib import Path
import random
import subprocess
import time

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('LESSON_OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution479', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solution = mod.Solution()

def brute(lo, hi):
    best = 0
    for a in range(lo, hi + 1):
        for b in range(lo, a + 1):
            value = a*b
            digits = str(value)
            if digits == digits[::-1]:
                best = max(best, value)
    return best

expected_palindromes = [9, 9009, 906609, 99000099, 9966006699, 999000000999,
                        99956644665999, 9999000000009999]
# Independent exhaustive enumeration: no mirroring, candidate scan or square cutoff.
for n in (1, 2, 3):
    assert brute(10**(n-1), 10**n-1) == expected_palindromes[n-1]

results = []
for n, p in enumerate(expected_palindromes, 1):
    start = time.monotonic()
    got = solution.largestPalindrome(n)
    assert got == p % 1337, (n, got, p)
    results.append({'n': n, 'palindrome': p, 'residue': got,
                    'seconds': round(time.monotonic()-start, 4)})

# Certify all larger candidates independently using prime factorization/divisors.
# This is an oracle dependency only, not a shipped asset or solution dependency.
def divisors(value):
    # GNU coreutils factor is a different implementation from the search.
    line = subprocess.check_output(['factor', str(value)], text=True)
    primes = list(map(int, line.split(':', 1)[1].split()))
    assert __import__('math').prod(primes) == value
    ds = {1}
    for prime in primes:
        ds |= {d*prime for d in tuple(ds)}
    return sorted(ds)
certified = []
for n, p in enumerate(expected_palindromes, 1):
    lo, hi = 10**(n-1), 10**n-1
    witness = [(int(d), p//int(d)) for d in divisors(p)
               if lo <= d <= hi and lo <= p//int(d) <= hi][0]
    count = 0
    if n > 1:
        assert 10**(2*n-1) <= p <= hi*hi  # all shorter lengths are smaller
        # Every shorter length is < p. Independently form longer/equal-length
        # candidates from reversed character lists, then factor each larger one.
        for head in range(int(str(p)[:n]), int(str(hi*hi)[:n])+1):
            ds = list(str(head))
            candidate = int(''.join(ds + list(reversed(ds))))
            if p < candidate <= hi*hi:
                fs = divisors(candidate)
                assert not any(lo <= d <= hi and lo <= candidate//d <= hi for d in fs)
                count += 1
    certified.append({'n':n, 'witness':witness, 'larger_candidates_rejected':count})

# Exact source mirror and official signature.
mirror = (ROOT/'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = '+json.dumps((ROOT/'solution.py').read_text())+';\n'
assert str(__import__('inspect').signature(mod.Solution.largestPalindrome)) == '(self, n: int) -> int'
# Duplicate copy keys must be checked before JS overwrites them.
copy = (ROOT/'copy.js').read_text()
import re
keys = re.findall(r'(?:^|[\n,])\s*(\w+):\[',copy)
assert len(keys) == len(set(keys)), 'duplicate localization key'
assert len(keys) > 65
(OUT/'numerical.json').write_text(json.dumps({'authorSelfCheck':True, 'exhaustivePairOracle':[1,2,3],
    'officialRangeExecution':results, 'primeFactorCertificates':certified,
    'sourceParity':True,'duplicateCopyKeys':len(keys)}, indent=2)+'\n')
print(json.dumps({'passed':True, 'n':list(range(1,9)), 'certified':certified}))

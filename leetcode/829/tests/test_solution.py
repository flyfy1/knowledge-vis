"""Execute canonical Python against independently enumerated sequences and odd divisors.
OUTPUT_DIR redirects all emitted evidence. No source file is rewritten.
"""
import ast
import html
import re
import datetime
import importlib.util
import json
import math
import os
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('lesson829', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().consecutiveNumbersSum


def oracle(n):
    """No length formula: grow positive consecutive terms from each possible start."""
    found = []
    for start in range(1, n + 1):
        total, end = 0, start
        while total < n:
            total += end
            end += 1
        if total == n:
            found.append((start, end - start))
    return found


def odd_divisors(n):
    # Independently factor n's odd part. Each odd divisor gives exactly one
    # positive representation: centered odd length, or its even-length partner.
    while n % 2 == 0:
        n //= 2
    answer, d = 1, 3
    while d * d <= n:
        exponent = 0
        while n % d == 0:
            n //= d
            exponent += 1
        answer *= exponent + 1
        d += 2
    return answer * (2 if n > 1 else 1)


for n in range(1, 1001):
    want = oracle(n)
    assert solve(n) == len(want) == odd_divisors(n), (n, want)
    # Independent invariant audit, including guard equality and exact count scope.
    k, count = 1, 0
    while k * (k + 1) // 2 <= n:
        assert count == sum(length < k for _, length in want)
        r = n - k * (k - 1) // 2
        assert r >= k
        if r % k == 0:
            a = r // k
            assert (a, k) in want
            assert sum(range(a, a + k)) == n
            count += 1
        else:
            assert not any(length == k for _, length in want)
        k += 1
    assert count == len(want)
    assert not any(length >= k for _, length in want)

rng = random.Random(829)
large = [rng.randint(1, 10**9) for _ in range(250)]
large += [10**9, 999999999] + [2**j for j in range(30)]
large += [k*(k+1)//2 for k in [1,2,3,4,10,100,1000,44720]]
for n in large:
    assert solve(n) == odd_divisors(n), n
for n, answer in [(1,1),(5,2),(9,3),(15,4),(8,1),(16,1),(45,6),(6,2),(18,3),(10**9,10)]:
    assert solve(n) == answer
assert mod.Solution.consecutiveNumbersSum.__annotations__ == {'n':int,'return':int}
assert max(k for k in range(1,44722) if k*(k+1)//2 <= 10**9)==44720
source=ROOT.joinpath('solution.py').read_text()
mirror=ROOT.joinpath('python-code.js').read_text()
assert mirror.startswith('window.PYTHON_SOURCE = ')
assert json.loads(mirror[len('window.PYTHON_SOURCE = '):].strip().removesuffix(';')) == source
ast.parse(source)
# Execute the exact baseline shown to learners, rather than a separately edited copy.
page = ROOT.joinpath('index.html').read_text()
shown = html.unescape(re.search(r'<code>(def baseline.*?)</code>', page, re.S)[1])
ns = {}
exec(shown, ns)
for n in range(1, 101):
    assert ns['baseline'](n) == len(oracle(n)), n
result={'kind':'author computational self-check','result':'pass','smallExhaustive':'n=1..1000, independently grow terms from each start','largeSeed':829,'largeCases':len(large),'largeOracle':'factor the odd part and count its divisors','intermediate':'before each k, count equals oracle sequences with smaller length; guard ensures remaining>=k; exact sequence identity; stop excludes all untested lengths','officialExamples':{'5':2,'9':3,'15':4},'maxInput':{'n':10**9,'answer':10,'testedLengths':44720},'displayedBaseline':'executed exact HTML baseline n=1..100','sourceMirrorParity':True,'time':datetime.datetime.now(datetime.timezone.utc).isoformat()}
OUT.joinpath('python-results.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))

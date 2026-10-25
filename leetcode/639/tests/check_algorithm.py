"""Author self-check; run from any cwd. OUTPUT_DIR redirects every emitted artifact."""
import ast
import hashlib
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution639', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
solve = module.Solution().numDecodings
MOD = 1_000_000_007


def oracle(s):
    # Expand actual digits, then enumerate cut masks: no wildcard coefficients or DP.
    total = 0
    for digits in itertools.product(*('123456789' if c == '*' else c for c in s)):
        d = ''.join(digits)
        if not d:
            total += 1
            continue
        for mask in range(1 << (len(d) - 1)):
            start = 0
            valid = True
            for end in range(1, len(d) + 1):
                if end == len(d) or mask & (1 << (end - 1)):
                    token = d[start:end]
                    if token[0] == '0' or not 1 <= int(token) <= 26:
                        valid = False
                        break
                    start = end
            total += valid
    return total % MOD


cases = {'': 1}
for n in range(1, 4):
    for chars in itertools.product('0123456789*', repeat=n):
        s = ''.join(chars)
        cases[s] = oracle(s)
for chars in itertools.product('0127*', repeat=4):
    s = ''.join(chars)
    cases[s] = oracle(s)
rng = random.Random(639)
for _ in range(240):
    n = rng.randrange(1, 9)
    s = ''.join(rng.choice('0123456789*') for _ in range(n))
    if s.count('*') > 2:
        s = s.replace('*', '1', s.count('*') - 2)
    cases[s] = oracle(s)
for s in ['1*', '*', '2*', '**', '*0', '06', '10', '30', '***', '1*0', '*10', '11106']:
    cases[s] = oracle(s)
for s, expected in cases.items():
    if s:
        assert solve(s) == expected, (s, solve(s), expected)
# Exhaustive prefix expectations are already in the corpus, but add all random prefixes.
for s in list(cases):
    for i in range(1, len(s)):
        prefix = s[:i]
        if prefix not in cases:
            cases[prefix] = oracle(prefix)
            assert solve(prefix) == cases[prefix]

# Independent combinatorial closed form: choose k disjoint paired positions,
# each pair has 15 choices; each remaining position has 9 choices.
n = 100000
fact = [1] * (n + 1)
for i in range(1, n + 1):
    fact[i] = fact[i-1] * i % MOD
inv = [1] * (n + 1)
inv[n] = pow(fact[n], MOD-2, MOD)
for i in range(n, 0, -1):
    inv[i-1] = inv[i] * i % MOD
all_star = sum(fact[n-k] * inv[k] % MOD * inv[n-2*k] % MOD
               * pow(15, k, MOD) % MOD * pow(9, n-2*k, MOD)
               for k in range(n//2+1)) % MOD
assert solve('*' * n) == all_star
assert solve('10' * (n//2)) == 1
assert solve('0' * n) == 0
assert solve('1' + '0' * (n-1)) == 0
# Fibonacci by fast doubling, not prefix scan.
def fib(n):
    if n == 0:
        return 0, 1
    a, b = fib(n//2)
    c, d = a * (2*b-a) % MOD, (a*a+b*b) % MOD
    return (d, (c+d) % MOD) if n % 2 else (c, d)
assert solve('1' * n) == fib(n+1)[0]

# Execute the actual baseline displayed in the HTML, separate from cut-mask oracle.
import html
import re
baseline_text = re.search(r'data-i18n="baselineSource".*?<code>(.*?)</code>', (ROOT/'index.html').read_text(), re.S).group(1)
baseline_namespace = {}
exec(html.unescape(baseline_text), baseline_namespace)
for s, expected in cases.items():
    if s and len(s) <= 4:
        assert baseline_namespace['brute'](s) == expected, ('displayed baseline', s)

source = (ROOT/'solution.py').read_text()
mirror = (ROOT/'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n'
# copy.js is a flat object: detect key definitions before evaluating JavaScript.
import re
keys = re.findall(r'(?:^|[,\n])\s*(\w+)\s*:', (ROOT/'copy.js').read_text())
assert len(keys) == len(set(keys))
assert len(keys) > 80
(OUT/'oracle-cases.json').write_text(json.dumps(cases))
result = {'kind':'author self-check','oracle':'digit expansion + cut-mask enumeration',
          'cases':len(cases)-1,'maximumLength':n,'allStarExpected':all_star,
          'seed':639,'sourceSha256':hashlib.sha256(source.encode()).hexdigest(),
          'status':'passed'}
(OUT/'algorithm.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result))

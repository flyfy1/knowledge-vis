"""Author self-check for #772. OUTPUT_DIR (default tests/evidence) receives numerical.json and oracle-fixtures.json."""
import importlib.util
import itertools
import json
import os
import random
import re
import subprocess
import sys
import time
from pathlib import Path

sys.dont_write_bytecode = True
sys.setrecursionlimit(10000)
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = Path(os.environ.get('OUTPUT_DIR', HERE / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


solve = load('solution772', ROOT / 'solution.py').Solution().calculate
orc = load('oracle772', HERE / 'oracle.py')
oracle = orc.oracle
compared = 0
INT_MIN, INT_MAX = -2 ** 31, 2 ** 31 - 1


def check(s):
    global compared
    want = oracle(s)
    got = solve(s)
    assert got == want and type(got) is int, (s, got, want)
    compared += 1
    return want


# 1. Exhaustive: every string over "037+-*/()" of length 1..7 that is a valid expression without division by zero.
valid = 0
for n in range(1, 8):
    for chars in itertools.product('037+-*/()', repeat=n):
        s = ''.join(chars)
        try:
            oracle(s)
        except (SyntaxError, ZeroDivisionError):
            continue
        check(s)
        valid += 1
exhaustive = compared

# 2. Seeded random expressions (multi-digit numbers, nesting, optional spaces), 32-bit intermediates.
rng = random.Random(772)


def gen(depth):
    if depth == 0 or rng.random() < 0.3:
        return str(rng.choice([0, 1, 2, 3, 7, 9, 10, 12, 99, 1000, rng.randint(0, 99999)]))
    parts = [gen(depth - 1)]
    for _ in range(rng.randint(0, 3)):
        parts.append(rng.choice('+-*/'))
        parts.append(gen(depth - 1))
    e = ''.join(parts)
    return '(' + e + ')' if rng.random() < 0.5 else e


def within_32_bits(s):
    # Re-evaluate with an instrumented parser to make sure every intermediate fits the stated range.
    class P(orc.Parser):
        def expr(self):
            v = super().expr(); assert INT_MIN <= v <= INT_MAX; return v
        def term(self):
            v = super().term(); assert INT_MIN <= v <= INT_MAX; return v
    try:
        p = P(orc.tokenize(s)); p.expr(); return p.i == len(p.t)
    except AssertionError:
        return False


randomized = 0
while randomized < 6000:
    s = gen(rng.randint(1, 4))
    if rng.random() < 0.3:
        s = ' '.join(s)  # spaces between characters must be ignored... except inside numbers
        s = re.sub(r'(?<=\d) (?=\d)', '', s)
    try:
        oracle(s)
    except ZeroDivisionError:
        continue
    if not within_32_bits(s):
        continue
    check(s)
    randomized += 1

# 3. Named lesson cases.
named = {'14-3*(2+8)/4': 7, '(1-6)/2*3': -6, '2*(3+(4-1)*2)': 18, '((7))': 7, '1-7/2': -2, '20/(1-5)+1': -4,
         '8-(3-9)/4*2': 10, '14-3*10/4': 7, '(1-6)/2': -2, '7': 7, '0/5': 0, '1+1': 2, '2147483647': 2147483647,
         '0-2147483647-1': -2147483648, '(0-7)/(0-2)': 3, '7/(0-2)': -3}
for s, v in named.items():
    assert check(s) == v, s
# The prediction distractors are what their misconceptions produce.
assert 8 - ((3 - 9) // 4) * 2 == 12      # floor division
assert 8 - (3 - 9) / 4 * 2 == 11          # real division

# 4. Large inputs: depth ~2500 nesting (|s| = 10^4) and a long flat chain; no recursion inside the solution.
d = 2500
deep = '(' * d + '1' + '+1)' * d
assert len(deep) == 4 * d + 1 <= 10 ** 4 + 1
timings = {}
t0 = time.perf_counter(); assert solve(deep) == d + 1; timings['deep_2500'] = round(time.perf_counter() - t0, 4)
chain = '+'.join(['1*2*3/6'] * 1428)
t0 = time.perf_counter(); assert solve(chain) == 1428; timings['flat_chain'] = round(time.perf_counter() - t0, 4)
mixed = '-'.join(['(' * 20 + '9' + ')' * 20] * 240)
t0 = time.perf_counter(); assert solve(mixed) == 9 - 9 * 239; timings['mixed'] = round(time.perf_counter() - t0, 4)
assert all(v < 1 for v in timings.values())

# 5. The brute force shown in step 2: works on the main example, breaks on rewritten negatives,
#    and copies about 2d^2 characters on deep nesting.
ns = {}
html = (ROOT / 'index.html').read_text()
code = re.search(r'<pre tabindex="0" aria-label="Brute force Python"><code>(.*?)</code>', html, re.S).group(1)
code = code.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
exec(code, ns)
assert ns['brute']('14-3*(2+8)/4') == 7
for broken in ('(1-6)/2*3', '3-(1-6)'):
    try:
        ns['brute'](broken)
        raise AssertionError('brute force unexpectedly handled ' + broken)
    except ValueError:
        pass
copied, s = 0, deep
while '(' in s:
    close = s.index(')'); start = s.rindex('(', 0, close)
    s = s[:start] + str(ns['flat'](s[start + 1:close])) + s[close + 1:]
    copied += len(s)
assert 1.2e7 <= copied <= 1.3e7, copied

# 6. Mirror, copy shape, duplicate keys.
source = (ROOT / 'solution.py').read_text()
assert (ROOT / 'python-code.js').read_text() == 'window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n'


def unique(pairs):
    out = {}
    for k, v in pairs:
        assert k not in out, 'duplicate copy key ' + k
        out[k] = v
    return out


text = (ROOT / 'copy.js').read_text()
copy = json.loads(text[len('window.COPY = '):-2], object_pairs_hook=unique)
assert all(isinstance(v, list) and len(v) == 2 and all(isinstance(x, str) for x in v) for v in copy.values())
assert all(v[1].strip() for k, v in copy.items() if k != 'sep')
assert all(v[0].strip() for k, v in copy.items() if k != 'sep')
assert copy['sep'] == ['', ' ']  # sentence separator: none in Chinese, one space in English

# 7. Fixtures for core.js: answers plus, for every number or ')' token, the value of the current
#    level's prefix (total + term must equal it) and the value of each parked level.
def level_prefix_values(s):
    toks = orc.tokenize(s)
    out = []
    for k, tk in enumerate(toks):
        if tk.isdigit() or tk == ')':
            opens = []
            for j in range(k + 1):
                if toks[j] == '(':
                    opens.append(j)
                elif toks[j] == ')':
                    opens.pop()
            start = opens[-1] + 1 if opens else 0
            parked = []
            for idx, o in enumerate(opens):
                lo = opens[idx - 1] + 1 if idx else 0
                before = toks[lo:o - 1] if o > lo else []   # level content before its pending operator and "("
                parked.append(orc.oracle(''.join(before)) if before else 0)
            out.append([k, orc.oracle(''.join(toks[start:k + 1])), parked])
    return out


fixtures = []
frng = random.Random(7720)
pool = list(named)[:7] + ['((1+2)*(3-4))/5', '(((((6)))))', '9-8-7', '9/2/2', '1000*9/7-6']
while len(pool) < 700:
    s = gen(frng.randint(1, 3))
    if len(s) > 40 or s.count('(') > 6 or any(len(x) > 4 for x in re.findall(r'\d+', s)):
        continue
    try:
        oracle(s)
    except ZeroDivisionError:
        continue
    pool.append(s)
for s in pool:
    fixtures.append({'s': s, 'answer': oracle(s), 'prefix': level_prefix_values(s)})
(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
proc = subprocess.run(['node', str(HERE / 'test_core.cjs'), str(OUT / 'oracle-fixtures.json')], capture_output=True, text=True)
if proc.returncode:
    print(proc.stdout, proc.stderr)
    raise SystemExit('core test failed')
report = {'kind': 'author self-check against an independent recursive-descent oracle',
          'exhaustiveValidExpressions': exhaustive, 'seededRandomComparisons': randomized,
          'totalComparisons': compared, 'seed': 772, 'largeInputSeconds': timings,
          'bruteDeepCopiedChars': copied, 'copyPairs': len(copy), 'sourceMirrorExact': True,
          'core': json.loads(proc.stdout)}
(OUT / 'numerical.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))

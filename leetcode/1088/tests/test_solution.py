"""Check solution.py against two independent oracles, then emit fixtures for test_core.cjs.

Oracle A: turn every number 1..20000 one by one (plain loop, no counting tricks).
Oracle B: list every turnable number up to 10^9 with itertools.product, classify each by
          string reversal, and answer any n by binary search. Neither uses digit counting
          or outside-in construction, so they are independent of the lesson's method.
"""
import bisect
import html
import importlib.util
import itertools
import json
import os
import random
import re
import sys
import time
from pathlib import Path

R = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('EVIDENCE_DIR', R / 'tests' / 'evidence' / 'run'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution1088', R / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().confusingNumberII

TURN = {'0': '0', '1': '1', '6': '9', '8': '8', '9': '6'}


def turned(x):
    s = str(x)
    if any(ch not in TURN for ch in s):
        return None
    return int(''.join(TURN[ch] for ch in reversed(s)))


# Oracle B tables
t0 = time.time()
turnable, unchanged, confusing = [], [], []
for length in range(1, 10):
    for first in '1689':
        for rest in itertools.product('01689', repeat=length - 1):
            s = first + ''.join(rest)
            x = int(s)
            turnable.append(x)
            (unchanged if turned(x) == x else confusing).append(x)
turnable.append(10 ** 9)
confusing.append(10 ** 9)  # 1000000000 turns into 1
for lst in (turnable, unchanged, confusing):
    lst.sort()
oracle_build_seconds = time.time() - t0


def oracle_b(n):
    return bisect.bisect_right(confusing, n)


def parts_b(n):
    return bisect.bisect_right(turnable, n), bisect.bisect_right(unchanged, n)


# Capture the solution's intermediate counts without changing its source.
captured = {}


def tracer(frame, event, arg):
    if frame.f_code.co_name == 'confusingNumberII' and event == 'return':
        captured.clear()
        captured.update(turnable=frame.f_locals.get('turnable'), unchanged=frame.f_locals.get('unchanged'))
    return tracer


checks = 0
intermediate = 0


def check(n, expected=None):
    global checks, intermediate
    sys.settrace(tracer)
    got = solve(n)
    sys.settrace(None)
    want = oracle_b(n) if expected is None else expected
    assert got == want, (n, got, want)
    assert got == oracle_b(n), (n, got)
    s, u = parts_b(n)
    assert (captured['turnable'], captured['unchanged']) == (s, u), (n, captured, s, u)
    intermediate += 2
    checks += 1


# Oracle A: exhaustive 1..20000 by a running count.
running = 0
exhaustive = []
for n in range(1, 20001):
    r = turned(n)
    if r is not None and r != n:
        running += 1
    check(n, running)
    exhaustive.append(running)

# Hand-checked statements that appear in the lesson text.
for n, want in [(1, 0), (10, 3), (16, 4), (69, 10), (70, 10), (200, 40), (6189, 269), (8250, 394), (10 ** 9, 1950627)]:
    check(n, want)
assert parts_b(70) == (14, 4) and parts_b(6189)[0] == 294 and parts_b(200) == (49, 9) and parts_b(8250)[0] == 424
assert unchanged[:9] == [1, 8, 11, 69, 88, 96, 101, 111, 181]

# Boundaries: powers of ten, all-turnable bounds, and every side of unchanged numbers.
rng = random.Random(1088)
edges = {10 ** k for k in range(10)} | {10 ** k - 1 for k in range(1, 10)} | {999999999, 969696969, 888888888, 100000001}
for u in rng.sample(unchanged, 400) + unchanged[:60] + unchanged[-60:]:
    edges |= {u - 1, u, u + 1}
for n in sorted(e for e in edges if 1 <= e <= 10 ** 9):
    check(n)
# Seeded random: half uniform, half log-uniform so every length is exercised.
for i in range(4000):
    n = rng.randint(1, 10 ** 9) if i % 2 else int(10 ** rng.uniform(0, 9))
    check(max(1, min(n, 10 ** 9)))

# Maximum constraint timing (asymptotic claim is separate; this only records a measurement).
t0 = time.time()
for _ in range(20):
    assert solve(10 ** 9) == 1950627
max_seconds = (time.time() - t0) / 20
assert max_seconds < 0.05, max_seconds

# The baseline code displayed in step 2 must itself be correct.
page = (R / 'index.html').read_text()
ns = {}
for pid in ('bruteCode', 'dfsCode'):
    block = re.search(r'<pre[^>]*id="' + pid + r'"[^>]*><code>(.*?)</code></pre>', page, re.S)
    assert block, pid
    exec(html.unescape(block.group(1)), ns)
for n in list(range(1, 400)) + [rng.randint(1, 20000) for _ in range(30)]:
    assert ns['brute'](n) == exhaustive[n - 1], n
for n in [1, 70, 5000, 123456, 10 ** 6]:
    assert ns['generate_then_check'](n) == oracle_b(n), n

# Cost figures quoted in the lesson: final lists and all lists built by build() for d = 10.
def size(l):
    return 1 if l == 0 else 3 if l == 1 else 5 * size(l - 2)


assert sum(size(L) for L in range(1, 11)) == 6248
assert sum(sum(size(j) for j in range(L, -1, -2)) for L in range(1, 11)) == 7805
assert len(unchanged) + 2500 == 4998  # unchanged numbers of length <= 10 (none of length 10 is <= 1e9)
# Cross-review 2026-11-11: measure what solution.py itself builds, not only the model above. The first
# version re-evaluated build(length - 2) inside the comprehension once per pair (33,593 strings at d = 10).
built = {'strings': 0, 'calls': 0}


def build_counter(frame, event, arg):
    if frame.f_code.co_name == 'build' and event == 'return':
        built['strings'] += len(arg)
        built['calls'] += 1
    return build_counter


sys.settrace(build_counter)
assert solve(10 ** 9) == 1950627
sys.settrace(None)
assert built == {'strings': 7805, 'calls': 35}, built  # 35 = sum over L of (L // 2 + 1) calls

# Exact offline source mirror.
source = (R / 'solution.py').read_text()
mirror = (R / 'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n'


# Copy: duplicate keys rejected before parsing can overwrite; each value a nonempty zh/en pair.
def unique(pairs):
    d = {}
    for k, v in pairs:
        assert k not in d, k
        d[k] = v
    return d


text = (R / 'copy.js').read_text()
copy = json.loads(text.removeprefix('window.COPY = ').removesuffix(';\n'), object_pairs_hook=unique)
assert all(isinstance(v, list) and len(v) == 2 and all(isinstance(s, str) and s.strip() for s in v) for v in copy.values())
used = set(re.findall(r'data-i18n="(\w+)"', page)) | set(re.findall(r"t\('(\w+)'[,)]", (R / 'app.js').read_text()))
used |= {'wrong0', 'wrong1', 'wrong3', 'docTitle'}
missing = sorted(k for k in used if k not in copy)
assert not missing, missing
unused = sorted(k for k in copy if k not in used)

# Fixtures for the JavaScript simulation.
fixture_ns = sorted({*range(1, 400), *[rng.randint(1, 10 ** 9) for _ in range(600)], *[int(10 ** rng.uniform(0, 9)) for _ in range(600)],
                     *(e for e in edges if 1 <= e <= 10 ** 9)})
fixtures = [{'n': n, 'answer': oracle_b(n), 'turnable': parts_b(n)[0], 'unchanged': parts_b(n)[1]} for n in fixture_ns]
(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
report = {
    'kind': 'author computational self-check',
    'solutionChecks': checks,
    'intermediateCountsChecked': intermediate,
    'exhaustiveRange': '1..20000',
    'seededRandom': 4000,
    'oracleTables': {'turnable': len(turnable), 'unchanged': len(unchanged), 'confusing': len(confusing), 'buildSeconds': round(oracle_build_seconds, 2)},
    'maxCaseSecondsPerCall': round(max_seconds, 6),
    'baselineCodeChecked': True,
    'sourceParity': True,
    'copyKeys': len(copy),
    'unusedCopyKeys': unused,
    'fixtures': len(fixtures),
}
(OUT / 'numerical.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))

"""Author self-check for #1067 (Digit Count in Range).

Run from any directory: python3 -B leetcode/1067/tests/test_solution.py
EVIDENCE_DIR redirects generated JSON (default: tests/evidence).

Numbers are written in ordinary decimal, without leading zeros, so 100 holds two
zeros and 7 holds none. Oracles: literal string counting, and an independent
digit DP with a "number has started" flag. Neither shares code with solution.py.
"""
import html as html_lib
import importlib.util
import json
import os
import random
import re
import subprocess
import sys
from functools import lru_cache
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = Path(os.environ.get('EVIDENCE_DIR', HERE / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)

spec = importlib.util.spec_from_file_location('solution1067', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().digitsCount


def literal(d, low, high):
    return sum(str(x).count(str(d)) for x in range(low, high + 1))


def dp_upto(d, n):
    """Occurrences of d in 0..n by a digit DP over (position, tight, started)."""
    digits = list(map(int, str(n)))

    @lru_cache(None)
    def go(pos, tight, started):
        # returns (how many numbers complete from here, total occurrences in them)
        if pos == len(digits):
            return 1, 0
        numbers = occurrences = 0
        for digit in range(0, (digits[pos] if tight else 9) + 1):
            now_started = started or digit != 0
            count, occ = go(pos + 1, tight and digit == digits[pos], now_started)
            numbers += count
            occurrences += occ + (count if now_started and digit == d else 0)
        return numbers, occurrences

    return go(0, True, False)[1]


def dp(d, low, high):
    return dp_upto(d, high) - (dp_upto(d, low - 1) if low > 1 else 0)


stats = {'exhaustive': 0, 'randomSmallRange': 0, 'randomLarge': 0, 'known': 0, 'displayedBaseline': 0}
fixtures = []


def check(d, low, high, expected, label):
    got = solve(d, low, high)
    assert type(got) is int and got == expected, (label, d, low, high, got, expected)
    stats[label] += 1


# 1. Exhaustive: every d and every 1 <= low <= high <= 400, against literal prefix sums.
for d in range(10):
    prefix = [0]
    for x in range(1, 401):
        prefix.append(prefix[-1] + str(x).count(str(d)))
    for low in range(1, 401):
        for high in range(low, 401):
            check(d, low, high, prefix[high] - prefix[low - 1], 'exhaustive')
    assert dp(d, 1, 400) == prefix[400]

# 2. Seeded random: short ranges anywhere up to 2*10^8 (literal), long ranges (digit DP).
rng = random.Random(1067)
for _ in range(2500):
    d = rng.randint(0, 9)
    low = rng.randint(1, 2 * 10**8)
    high = min(2 * 10**8, low + rng.randint(0, 3000))
    truth = literal(d, low, high)
    assert dp(d, low, high) == truth
    check(d, low, high, truth, 'randomSmallRange')
for _ in range(2500):
    d = rng.randint(0, 9)
    low, high = sorted(rng.randint(1, 2 * 10**8) for _ in range(2))
    check(d, low, high, dp(d, low, high), 'randomLarge')
    if len(fixtures) < 300:
        fixtures.append({'d': d, 'low': low, 'high': high, 'answer': dp(d, low, high)})
for d in range(10):
    for low, high in [(1, 9), (1, 10), (10, 99), (1, 2 * 10**8), (2 * 10**8, 2 * 10**8), (10**8, 2 * 10**8), (99_999_999, 100_000_001)]:
        truth = dp(d, low, high)
        check(d, low, high, truth, 'known')
        fixtures.append({'d': d, 'low': low, 'high': high, 'answer': truth})

# 3. Public sample inputs, lesson cases and closed forms.
for d, low, high, truth in [(1, 1, 13, 6), (3, 100, 250, 35), (0, 1, 100, 11), (0, 1, 105, 16),
                            (0, 1, 9, 0), (5, 555, 555, 3), (0, 100, 100, 2), (0, 1000, 1000, 3)]:
    assert literal(d, low, high) == truth
    check(d, low, high, truth, 'known')
for k in range(1, 9):  # digits 1..9 appear k*10^(k-1) times among 1..10^k - 1
    for d in range(1, 10):
        check(d, 1, 10**k - 1, k * 10**(k - 1), 'known')

# Small fixtures for the browser model, with every d including 0.
for _ in range(400):
    d = rng.randint(0, 9)
    low = rng.randint(1, 500)
    high = low + rng.randint(0, 600)
    fixtures.append({'d': d, 'low': low, 'high': high, 'answer': literal(d, low, high)})

# The baseline displayed in step 1 is real code.
page = (ROOT / 'index.html').read_text()
namespace = {}
exec(html_lib.unescape(re.search(r'<code id="baselineCode">(.*?)</code>', page, re.S).group(1)), namespace)
for d in range(10):
    for low in range(1, 60, 7):
        for high in range(low, 130, 11):
            assert namespace['baseline'](d, low, high) == literal(d, low, high)
            stats['displayedBaseline'] += 1

# 4. Offline mirror and copy dictionary.
source = (ROOT / 'solution.py').read_text()
assert (ROOT / 'python-code.js').read_text() == 'window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n'


def unique(pairs):
    seen = {}
    for key, value in pairs:
        assert key not in seen, 'duplicate copy key ' + key
        seen[key] = value
    return seen


copy_text = (ROOT / 'copy.js').read_text()
copy = json.loads(copy_text.removeprefix('window.COPY = ').removesuffix(';\n'), object_pairs_hook=unique)
assert all(isinstance(v, list) and len(v) == 2 and all(isinstance(s, str) and s for s in v) for v in copy.values())

(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
core = subprocess.run(['node', str(HERE / 'test_core.cjs')], capture_output=True, text=True,
                      env={**os.environ, 'EVIDENCE_DIR': str(OUT)})
assert core.returncode == 0, core.stderr + core.stdout
report = {'kind': 'author computational self-check (not independent review)',
          'comparisons': stats, 'totalComparisons': sum(stats.values()), 'seed': 1067,
          'sourceParity': True, 'copyKeys': len(copy), 'core': json.loads(core.stdout)}
(OUT / 'numerical.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))

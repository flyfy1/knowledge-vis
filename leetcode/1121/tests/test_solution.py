"""Check solution.py against an exhaustive search that tries every split, then emit fixtures for test_core.cjs.

The oracle never uses the multiplicity formula: it places elements one at a time onto an existing
sequence whose last value is smaller, or onto a new sequence, and accepts only if every sequence
ends with length >= k (memoised on the multiset of (last value, length capped at k)).
"""
import importlib.util
import itertools
import json
import os
import random
import re
import sys
import time
from functools import lru_cache
from pathlib import Path

R = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('EVIDENCE_DIR', R / 'tests' / 'evidence' / 'run'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution1121', R / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().canDivideIntoSubsequences


def oracle(nums, k):
    nums = tuple(nums)

    @lru_cache(None)
    def go(i, seqs):
        if i == len(nums):
            return all(length >= k for _, length in seqs)
        x = nums[i]
        options = set()
        for j, (last, length) in enumerate(seqs):
            if last < x:
                options.add(tuple(sorted(seqs[:j] + ((x, min(k, length + 1)),) + seqs[j + 1:])))
        options.add(tuple(sorted(seqs + ((x, min(k, 1)),))))
        return any(go(i + 1, s) for s in options)

    return go(0, ())


checks = 0


def check(nums, k, expected=None):
    global checks
    before = list(nums)
    got = solve(nums, k)
    assert nums == before  # input not mutated
    want = oracle(nums, k) if expected is None else expected
    assert got is want, (nums, k, got, want)
    checks += 1


# Exhaustive: every non-decreasing array of length 1..9 over values 1..4, every k.
exhaustive = 0
for n in range(1, 10):
    for combo in itertools.combinations_with_replacement(range(1, 5), n):
        for k in range(1, n + 1):
            check(list(combo), k)
            exhaustive += 1
# Seeded random, longer arrays and wider values.
rng = random.Random(1121)
fixtures = []
for _ in range(3000):
    n = rng.randint(1, 14)
    nums = sorted(rng.randint(1, rng.choice([3, 6, 12])) for _ in range(n))
    k = rng.randint(1, n)
    check(nums, k)
    if len(fixtures) < 600 and n <= 24:
        fixtures.append({'nums': nums, 'k': k, 'answer': oracle(nums, k)})

# Lesson examples and boundaries (hand-verified in the copy).
for nums, k, want in [([1, 1, 2, 2, 3, 4], 3, True), ([1, 1, 1, 2, 3, 4, 5, 6], 3, False), ([1, 2, 2, 2, 3, 3, 4, 5, 6], 3, True),
                      ([2, 2, 2, 2], 1, True), ([2, 2, 2, 2], 2, False), ([3, 5, 7, 9], 4, True), ([7], 1, True),
                      ([1, 2, 2, 3, 3, 3, 4, 5, 6, 7], 3, True)]:
    check(nums, k, want)
    fixtures.append({'nums': nums, 'k': k, 'answer': want})
# Maximum constraints (formula vs a separate counter-based computation; the search oracle cannot run here).
for nums, k in [([1] * 100000, 1), ([1] * 100000, 2), (list(range(1, 100001)), 100000), (sorted([5] * 50000 + list(range(1, 50001))), 2),
                (sorted([5] * 50000 + list(range(1, 50001))), 3)]:
    t0 = time.time()
    got = solve(nums, k)
    from collections import Counter
    assert got == (max(Counter(nums).values()) * k <= len(nums))
    assert time.time() - t0 < 0.5

# Numbers quoted in step 2: Bell numbers B6 = 203 and B20 > 5e13.
def bell(n):
    row = [1]
    for _ in range(n):
        nxt = [row[-1]]
        for v in row:
            nxt.append(nxt[-1] + v)
        row = nxt
    return row[0]


assert bell(6) == 203 and bell(20) > 5 * 10 ** 13

# Source mirror and copy keys.
source = (R / 'solution.py').read_text()
assert (R / 'python-code.js').read_text() == 'window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n'


def unique(pairs):
    d = {}
    for key, v in pairs:
        assert key not in d, key
        d[key] = v
    return d


copy = json.loads((R / 'copy.js').read_text().removeprefix('window.COPY = ').removesuffix(';\n'), object_pairs_hook=unique)
assert all(isinstance(v, list) and len(v) == 2 and all(isinstance(s, str) and s.strip() for s in v) for v in copy.values())
page = (R / 'index.html').read_text()
used = set(re.findall(r'data-i18n="(\w+)"', page)) | set(re.findall(r"t\('(\w+)'[,)]", (R / 'app.js').read_text()))
used |= {'wrong0', 'wrong2', 'err_length', 'err_value', 'err_sorted', 'err_k'}
missing = sorted(key for key in used if key not in copy)
assert not missing, missing

(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
report = {'kind': 'author check: solution.py vs exhaustive split search', 'solutionChecks': checks, 'exhaustiveCases': exhaustive,
          'seededRandom': 3000, 'maxSizeCases': 5, 'sourceParity': True, 'copyKeys': len(copy), 'fixtures': len(fixtures)}
(OUT / 'numerical.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))

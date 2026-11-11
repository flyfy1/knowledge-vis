"""Author self-check for #1063 (Number of Valid Subarrays).

Run from any directory: python3 -B leetcode/1063/tests/test_solution.py
EVIDENCE_DIR redirects generated JSON (default: tests/evidence).

A subarray is valid when its leftmost element is not larger than any of its
elements (ties allowed). The oracles below check that definition literally and
share no code with solution.py.
"""
import html as html_lib
import importlib.util
import itertools
import json
import os
import random
import re
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = Path(os.environ.get('EVIDENCE_DIR', HERE / 'evidence'))
OUT.mkdir(parents=True, exist_ok=True)

spec = importlib.util.spec_from_file_location('solution1063', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().validSubarrays


def literal(nums):
    """Check every subarray against the definition with min()."""
    return sum(1 for i in range(len(nums)) for j in range(i, len(nums)) if nums[i] <= min(nums[i:j + 1]))


def by_next_smaller(nums):
    """Count per start: distance to the first strictly smaller element, found by
    jumping along already computed next-smaller links (no stack)."""
    n = len(nums)
    nxt = [n] * n
    for i in range(n - 2, -1, -1):
        j = i + 1
        while j < n and nums[j] >= nums[i]:
            j = nxt[j]
        nxt[i] = j
    return sum(nxt[i] - i for i in range(n))


stats = {'exhaustive': 0, 'random': 0, 'maxSize': 0, 'known': 0, 'displayedBaseline': 0}
fixtures = []


def check(nums, expected, label):
    original = list(nums)
    got = solve(nums)
    assert nums == original, 'input mutated'
    assert type(got) is int and got == expected, (label, nums[:20], got, expected)
    stats[label] += 1


# 1. Exhaustive: every array of length 1..7 over values 0..3 (21,844 arrays).
for n in range(1, 8):
    for nums in itertools.product(range(4), repeat=n):
        nums = list(nums)
        truth = literal(nums)
        assert by_next_smaller(nums) == truth
        check(nums, truth, 'exhaustive')
        if n <= 5 and len(fixtures) < 400 and random.Random(hash(tuple(nums)) & 0xffff).random() < .4:
            fixtures.append({'nums': nums, 'total': truth})

# 2. Seeded random arrays, including many duplicates and wide value ranges.
rng = random.Random(1063)
for _ in range(3000):
    n = rng.randint(1, 60)
    top = rng.choice([1, 3, 10, 100, 10**5])
    nums = [rng.randint(0, top) for _ in range(n)]
    truth = literal(nums)
    check(nums, truth, 'random')
    if n <= 10 and top <= 100 and len(fixtures) < 800:
        fixtures.append({'nums': nums, 'total': truth})

# 3. Maximum size n = 5*10^4 with closed forms and the independent next-smaller oracle.
N = 5 * 10**4
for nums, truth in [
    (list(range(N)), N * (N + 1) // 2),                 # non-decreasing: every subarray valid
    ([7] * N, N * (N + 1) // 2),                        # all equal: ties keep every start alive
    (list(range(N, 0, -1)), N),                         # strictly decreasing: singletons only
    ([10**5, 0] * (N // 2), N // 2 + (N // 2) ** 2),   # each 10^5 dies at once; zeros never die
]:
    assert by_next_smaller(nums) == truth
    check(nums, truth, 'maxSize')
for _ in range(20):
    nums = [rng.randint(0, rng.choice([2, 100, 10**5])) for _ in range(N)]
    check(nums, by_next_smaller(nums), 'maxSize')

# 4. Public sample inputs (outputs computed by the literal oracle) and lesson cases.
for nums, truth in [([1, 4, 2, 5, 3], 11), ([3, 2, 1], 3), ([2, 2, 2], 6),
                    ([3, 1, 2, 2, 0], 8), ([0], 1), ([5, 5], 3), ([1, 2, 3, 4, 5], 15)]:
    assert literal(nums) == truth
    check(nums, truth, 'known')

# The baseline shown in step 1 is real code: run it against the literal oracle.
page = (ROOT / 'index.html').read_text()
namespace = {}
exec(html_lib.unescape(re.search(r'<code id="baselineCode">(.*?)</code>', page, re.S).group(1)), namespace)
for n in range(1, 7):
    for nums in itertools.product(range(3), repeat=n):
        assert namespace['baseline'](list(nums)) == literal(list(nums))
        stats['displayedBaseline'] += 1

# Cross-review 2026-11-11: step 1 quotes the displayed baseline's comparison count on
# [1,4,2,5,3]. Count `nums[j] < nums[i]` evaluations of that exact loop (j starts at i).
def baseline_comparisons(nums, stop):
    count = 0
    for i in range(len(nums)):
        for j in range(i, len(nums)):
            count += 1
            if stop and nums[j] < nums[i]:
                break
    return count
assert 'for j in range(i, len(nums)):' in page and 'if nums[j] &lt; nums[i]:' in page
assert (baseline_comparisons([1, 4, 2, 5, 3], True), baseline_comparisons([1, 4, 2, 5, 3], False)) == (13, 15)

# 5. Offline mirror and copy dictionary.
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
assert all('13' in text and '15' in text for text in copy['s1e']), 'step 1 must quote 13 vs 15 comparisons'

(OUT / 'oracle-fixtures.json').write_text(json.dumps(fixtures) + '\n')
core = subprocess.run(['node', str(HERE / 'test_core.cjs')], capture_output=True, text=True,
                      env={**os.environ, 'EVIDENCE_DIR': str(OUT)})
assert core.returncode == 0, core.stderr + core.stdout
report = {'kind': 'author computational self-check (not independent review)',
          'comparisons': stats, 'totalComparisons': sum(stats.values()), 'seed': 1063,
          'sourceParity': True, 'copyKeys': len(copy), 'core': json.loads(core.stdout)}
(OUT / 'numerical.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))

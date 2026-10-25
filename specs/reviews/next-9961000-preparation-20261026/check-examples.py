"""Direct tiny-case oracles for dispatcher notes; no proposed lesson solution."""
import datetime
import itertools
import json
import math
import pathlib


def squareful(nums):
    # Deliberately enumerate value sequences, then deduplicate whole permutations.
    return sorted(p for p in set(itertools.permutations(nums))
                  if all(math.isqrt(a + b) ** 2 == a + b
                         for a, b in zip(p, p[1:])))


def merge_all_choices(piles, k):
    # Enumerate every legal next row state, with no interval DP or greedy pruning.
    if len(piles) == 1:
        return 0, []
    best, best_path = math.inf, []
    for start in range(len(piles) - k + 1):
        cost = sum(piles[start:start + k])
        after = piles[:start] + (cost,) + piles[start + k:]
        later, path = merge_all_choices(after, k)
        if cost + later < best:
            best = cost + later
            best_path = [dict(before=piles, start=start, k=k,
                              cost=cost, after=after)] + path
    return best, best_path


out = dict(observedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
           scope="Tiny direct enumeration only; no canonical algorithm, performance, lesson or review acceptance claim.",
           cases996=[], cases1000=[])
for nums, expected, origin in [
    ([1, 17, 8], 2, 'official'), ([2, 2, 2], 1, 'official'),
    ([1, 1, 8], 1, 'original'), ([2, 2, 7], 3, 'original'),
    ([0, 0, 1], 3, 'original'), ([1], 1, 'original'),
    ([0], 1, 'original'), ([1, 1], 0, 'original'),
    ([10**9, 999967841], 2, 'original'),
    ([10**9, 999967842], 0, 'original'),
]:
    assert all(0 <= x <= 10**9 for x in nums) and 1 <= len(nums) <= 12
    valid = squareful(nums)
    assert len(valid) == expected
    out['cases996'].append(dict(nums=nums, expected=expected, actual=len(valid),
                                distinctValuePermutations=valid, origin=origin))
for piles, k, expected, origin in [
    ([3, 2, 4, 1], 2, 20, 'official'),
    ([3, 2, 4, 1], 3, -1, 'official'),
    ([3, 5, 1, 2, 6], 3, 25, 'official'),
    ([6, 4, 4, 6], 2, 40, 'original'),
    ([1, 100, 1], 2, 203, 'original'),
    ([7], 30, 0, 'original'),
    ([1, 2], 30, -1, 'original'),
    ([1, 1, 1, 1, 1], 3, 8, 'original'),
]:
    assert 1 <= len(piles) <= 30 and 2 <= k <= 30
    assert all(1 <= x <= 100 for x in piles)
    cost, path = merge_all_choices(tuple(piles), k)
    actual = -1 if cost == math.inf else cost
    assert actual == expected
    out['cases1000'].append(dict(stones=piles, k=k, expected=expected,
                                 actual=actual, oneMinimumHistory=path, origin=origin))
out['passed'] = True
pathlib.Path(__file__).with_name('example-checks.json').write_text(json.dumps(out, indent=2) + '\n')
print('18 tiny checks passed: 10 unique-permutation counts, 8 complete legal-merge enumerations.')

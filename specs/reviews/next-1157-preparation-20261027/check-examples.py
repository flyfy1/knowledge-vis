"""Direct query oracle and tiny cancellation-merge semantics, not a data structure."""
from bisect import bisect_left, bisect_right
from collections import Counter
from functools import lru_cache
import itertools
import json
from pathlib import Path


def query_oracle(arr, left, right, threshold):
    assert 1 <= len(arr) <= 20000 and all(1 <= value <= 20000 for value in arr)
    assert 0 <= left <= right < len(arr)
    size = right - left + 1
    assert size // 2 < threshold <= size
    counts = Counter(arr[left:right + 1])
    answers = [value for value, count in counts.items() if count >= threshold]
    assert len(answers) <= 1
    return answers[0] if answers else -1, counts


def merge(a, b):
    """Cancel unequal residual values; zero balance has canonical candidate None."""
    ca, ba = a
    cb, bb = b
    if ba == 0:
        return b
    if bb == 0:
        return a
    if ca == cb:
        return ca, ba + bb
    if ba == bb:
        return None, 0
    return (ca, ba - bb) if ba > bb else (cb, bb - ba)


@lru_cache(None)
def all_merge_summaries(values):
    """All binary parenthesizations, keeping leaf order, for at most five values."""
    assert 1 <= len(values) <= 5
    if len(values) == 1:
        return frozenset({(values[0], 1)})
    return frozenset(merge(a, b)
                     for split in range(1, len(values))
                     for a in all_merge_summaries(values[:split])
                     for b in all_merge_summaries(values[split:]))


def scan_summary(values):
    result = (None, 0)
    for value in values:
        result = merge(result, (value, 1))
    return result


fixtures = [
    ([1, 1, 2, 2, 1, 1], 0, 5, 4, 1),
    ([1, 1, 2, 2, 1, 1], 0, 3, 3, -1),
    ([1, 1, 2, 2, 1, 1], 2, 3, 2, 2),
    ([20000], 0, 0, 1, 20000),
    ([1, 2], 0, 1, 2, -1),
    ([1, 1, 2], 0, 2, 2, 1),
    ([1, 1, 2], 0, 2, 3, -1),
    ([1, 2, 3], 0, 2, 2, -1),
    ([9, 2, 2, 9], 1, 2, 2, 2),
    ([1, 2, 1], 1, 1, 1, 2),
    ([1, 2, 1], 2, 2, 1, 1),
    ([7, 7, 7, 7], 0, 3, 4, 7),
]
results = []
for arr, left, right, threshold, expected in fixtures:
    actual, counts = query_oracle(arr, left, right, threshold)
    assert actual == expected
    candidate, balance = scan_summary(arr[left:right + 1])
    actual_frequency = counts.get(candidate, 0)
    positions = [i for i, value in enumerate(arr) if value == candidate]
    occurrence_count = bisect_right(positions, right) - bisect_left(positions, left)
    assert occurrence_count == actual_frequency
    verified = candidate if balance > 0 and occurrence_count >= threshold else -1
    assert verified == expected
    results.append({'arr': arr, 'left': left, 'right': right, 'threshold': threshold,
                    'expected': expected, 'counter': dict(counts), 'candidate': candidate,
                    'unmatchedBalance': balance, 'actualCandidateFrequency': actual_frequency,
                    'candidatePositions': positions, 'inclusiveOccurrenceCount': occurrence_count})

# Actual non-associativity, even though each result is a valid cancellation residue.
a, b, c = (1, 1), (2, 1), (3, 1)
left_grouped = merge(merge(a, b), c)
right_grouped = merge(a, merge(b, c))
assert left_grouped == (3, 1) and right_grouped == (1, 1)
# A strict majority pins the candidate, but not the residual balance.
majority_summaries = all_merge_summaries((1, 1, 1, 2, 3))
assert majority_summaries == frozenset({(1, 1), (1, 3)})

arrays_checked = thresholds_checked = summaries_checked = 0
for length in range(1, 6):
    for values in itertools.product((1, 2, 3), repeat=length):
        summaries = all_merge_summaries(values)
        counts = Counter(values)
        majority = next((v for v, count in counts.items() if 2 * count > length), None)
        for candidate, balance in summaries:
            assert 0 <= balance <= length and (length - balance) % 2 == 0
            if majority is not None:
                assert candidate == majority and balance > 0
            summaries_checked += 1
        for threshold in range(length // 2 + 1, length + 1):
            expected, _ = query_oracle(values, 0, length - 1, threshold)
            for candidate, balance in summaries:
                verified = candidate if balance > 0 and counts[candidate] >= threshold else -1
                assert verified == expected
            thresholds_checked += 1
        arrays_checked += 1

output = {
    'scope': 'Source/semantic preparation; no efficient data structure, lesson or judge acceptance.',
    'fixtures': results,
    'nonAssociativity': {'values': [1, 2, 3], 'leftGrouped': left_grouped,
                         'rightGrouped': right_grouped},
    'majorityDifferentBalances': {'values': [1, 1, 1, 2, 3], 'actualMajorityCount': 3,
                                  'summaries': sorted(majority_summaries)},
    'finiteMergeEvidence': {'alphabet': [1, 2, 3], 'lengths': [1, 5],
                            'arrays': arrays_checked, 'validThresholdQueries': thresholds_checked,
                            'distinctSummaryChecks': summaries_checked,
                            'allBinaryParenthesizationsIncluded': True},
}
Path(__file__).with_name('example-checks.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'{len(fixtures)} direct fixtures; {arrays_checked} tiny arrays; {thresholds_checked} valid threshold queries; {summaries_checked} summary checks passed')

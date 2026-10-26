"""Dispatcher experiments, not a lesson implementation or judge submission."""
import hashlib
import json
from pathlib import Path


class QueryLimitExceeded(Exception):
    pass


class MountainArray:
    """Local test double. Only get/length are passed through the experiment."""

    def __init__(self, values):
        self._values = tuple(values)
        self.calls = []

    def get(self, index):
        assert 0 <= index < len(self._values), index
        self.calls.append(index)
        if len(self.calls) > 100:
            raise QueryLimitExceeded("101st get call")
        return self._values[index]

    def length(self):
        return len(self._values)


def search_experiment(target, mountain_arr):
    """One uncached peak/ascending/descending experiment using only the API."""
    n = mountain_arr.length()
    left, right = 0, n - 1
    while left < right:
        middle = (left + right) // 2
        if mountain_arr.get(middle) < mountain_arr.get(middle + 1):
            left = middle + 1
        else:
            right = middle
    peak = left
    for left, right, ascending in [(0, peak, True), (peak + 1, n - 1, False)]:
        while left <= right:
            middle = (left + right) // 2
            value = mountain_arr.get(middle)
            if value == target:
                return middle
            if (value < target) == ascending:
                left = middle + 1
            else:
                right = middle - 1
    return -1


def check(values, target, expected=None):
    # Full-array inspection belongs to the independent harness, never the API consumer.
    assert 3 <= len(values) <= 10000
    assert 0 <= target <= 10**9
    assert all(0 <= value <= 10**9 for value in values)
    peak = values.index(max(values))
    assert 0 < peak < len(values) - 1
    assert all(a < b for a, b in zip(values[:peak], values[1:peak + 1]))
    assert all(a > b for a, b in zip(values[peak:], values[peak + 1:]))
    oracle = next((i for i, value in enumerate(values) if value == target), -1)
    if expected is not None:
        assert oracle == expected
    api = MountainArray(values)
    actual = search_experiment(target, api)
    assert actual == oracle, (values, target, actual, oracle)
    assert len(api.calls) <= 56
    return {"length": len(values), "peakIndex": peak, "target": target,
            "expected": oracle, "actual": actual, "getCalls": len(api.calls),
            "queriedIndices": api.calls}


tiny_cases = [
    ([1, 2, 3, 4, 5, 3, 1], 3, 2),  # Official: both slopes.
    ([0, 1, 2, 4, 2, 1], 3, -1),  # Official: absent between values.
    ([0, 1, 0], 0, 0),
    ([0, 1, 0], 1, 1),
    ([0, 1, 0], 2, -1),
    ([2, 5, 4, 3, 1], 1, 4),  # Earliest legal peak; right endpoint.
    ([0, 2, 4, 6, 1], 0, 0),  # Latest legal peak; left endpoint.
    ([2, 5, 4, 3, 1], 0, -1),  # Below both endpoints.
    ([0, 10**9, 1], 10**9, 1),
    ([0, 10**9, 1], 1, 2),
]
tiny_results = [{"values": values, **check(values, target, expected)}
                for values, target, expected in tiny_cases]

# Small exhaustive family: independently choose the two strict slopes below a peak.
family_count = 0
family_max_calls = 0
for peak_value in range(1, 5):
    for left_mask in range(1, 1 << peak_value):
        for right_mask in range(1, 1 << peak_value):
            left = [v for v in range(peak_value) if left_mask & (1 << v)]
            right = [v for v in reversed(range(peak_value)) if right_mask & (1 << v)]
            values = left + [peak_value] + right
            for target in range(peak_value + 2):
                result = check(values, target)
                family_count += 1
                family_max_calls = max(family_max_calls, result['getCalls'])

# Three reproducible maximum-length shapes; sampled targets, not all possible mountains.
large_results = []
for peak in [1, 4999, 9998]:
    values = list(range(peak)) + [20000] + list(range(9999 - peak, 0, -1))
    assert len(values) == 10000
    for target in [0, 1, peak - 1, 9999 - peak, 10000, 20000, 10**9]:
        result = check(values, target)
        result['arrayRecipe'] = 'range(peak) + [20000] + descending(9999 - peak ... 1)'
        result['arraySha256'] = hashlib.sha256(json.dumps(values).encode()).hexdigest()
        large_results.append(result)

# A valid 102-element mountain makes linear scanning exceed the budget.
limit_values = list(range(101)) + [99]
api = MountainArray(limit_values)
for index in range(100):
    api.get(index)
assert len(api.calls) == 100
try:
    api.get(100)
    raise AssertionError('The 101st call was not rejected')
except QueryLimitExceeded:
    pass
repeated = MountainArray([0, 1, 0])
for _ in range(100):
    repeated.get(1)
try:
    repeated.get(1)
    raise AssertionError('Repeated accesses must count too')
except QueryLimitExceeded:
    pass
api2 = MountainArray([0, 1, 0])
for _ in range(101):
    assert api2.length() == 3
assert api2.calls == []

output = {
    'scope': 'Independent semantic oracle plus illustrative API-only query experiments; no lesson acceptance or official judge run.',
    'tinyCases': tiny_results,
    'smallFamily': {'cases': family_count, 'peakValues': [1, 2, 3, 4], 'maxGetCalls': family_max_calls},
    'maximumLengthSamples': large_results,
    'maximumLengthMaxGetCalls': max(x['getCalls'] for x in large_results),
    'budgetBoundary': {'validArrayLength': 102, 'peakIndex': 100, 'missingTarget': 102,
                       'acceptedGetCalls': 100, 'rejectedGetCall': 101,
                       'repeatedSameIndexRejectedCall': 101,
                       'lengthCalls': 101, 'getCallsFromLength': 0}
}
Path(__file__).with_name('example-checks.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'{len(tiny_results)} tiny cases; {family_count} small-family checks; {len(large_results)} maximum-length samples; budget boundary passed')
print(f'Maximum sampled get calls: {output["maximumLengthMaxGetCalls"]}')

"""Hand traces checked by a scan-only model, with and without tail trimming."""
import json
from pathlib import Path


class ScanOracle:
    def __init__(self, capacity, trim_tail=False):
        assert 1 <= capacity <= 20000
        self.capacity = capacity
        self.stacks = []
        self.trim_tail = trim_tail

    def apply(self, method, argument=None):
        result = None
        if method == 'push':
            assert 1 <= argument <= 20000
            index = next((i for i, stack in enumerate(self.stacks)
                          if len(stack) < self.capacity), len(self.stacks))
            if index == len(self.stacks):
                self.stacks.append([])
            self.stacks[index].append(argument)
        elif method == 'pop':
            index = next((i for i in range(len(self.stacks) - 1, -1, -1)
                          if self.stacks[i]), None)
            result = self.stacks[index].pop() if index is not None else -1
        elif method == 'popAtStack':
            assert 0 <= argument <= 100000
            result = (self.stacks[argument].pop()
                      if argument < len(self.stacks) and self.stacks[argument] else -1)
        else:
            raise AssertionError(method)
        if self.trim_tail:
            while self.stacks and not self.stacks[-1]:
                self.stacks.pop()
        assert all(len(stack) <= self.capacity for stack in self.stacks)
        return result

    def snapshot(self):
        # Omit only empty trailing stacks; never compact an interior hole.
        stacks = [stack[:] for stack in self.stacks]
        while stacks and not stacks[-1]:
            stacks.pop()
        return stacks


# Each step is (method, argument, independently hand-written result, expected state).
# Stack contents are bottom-to-top; their positions are the original stack indices.
traces = [
    ('official', 2, [
        ('push', 1, None, [[1]]),
        ('push', 2, None, [[1, 2]]),
        ('push', 3, None, [[1, 2], [3]]),
        ('push', 4, None, [[1, 2], [3, 4]]),
        ('push', 5, None, [[1, 2], [3, 4], [5]]),
        ('popAtStack', 0, 2, [[1], [3, 4], [5]]),
        ('push', 20, None, [[1, 20], [3, 4], [5]]),
        ('push', 21, None, [[1, 20], [3, 4], [5, 21]]),
        ('popAtStack', 0, 20, [[1], [3, 4], [5, 21]]),
        ('popAtStack', 2, 21, [[1], [3, 4], [5]]),
        ('pop', None, 5, [[1], [3, 4]]),
        ('pop', None, 4, [[1], [3]]),
        ('pop', None, 3, [[1]]),
        ('pop', None, 1, []),
        ('pop', None, -1, []),
    ]),
    ('capacity_one_middle_hole', 1, [
        ('push', 1, None, [[1]]),
        ('push', 2, None, [[1], [2]]),
        ('push', 3, None, [[1], [2], [3]]),
        ('popAtStack', 1, 2, [[1], [], [3]]),
        ('push', 9, None, [[1], [9], [3]]),
        ('pop', None, 3, [[1], [9]]),
        ('pop', None, 9, [[1]]),
        ('pop', None, 1, []),
        ('pop', None, -1, []),
    ]),
    ('two_nonfull_holes_use_leftmost', 2, [
        ('push', 1, None, [[1]]),
        ('push', 2, None, [[1, 2]]),
        ('push', 3, None, [[1, 2], [3]]),
        ('push', 4, None, [[1, 2], [3, 4]]),
        ('push', 5, None, [[1, 2], [3, 4], [5]]),
        ('popAtStack', 0, 2, [[1], [3, 4], [5]]),
        ('popAtStack', 1, 4, [[1], [3], [5]]),
        ('push', 6, None, [[1, 6], [3], [5]]),
        ('push', 7, None, [[1, 6], [3, 7], [5]]),
    ]),
    ('indices_stay_fixed_then_reuse_zero', 1, [
        ('push', 4, None, [[4]]),
        ('push', 5, None, [[4], [5]]),
        ('popAtStack', 0, 4, [[], [5]]),
        ('popAtStack', 0, -1, [[], [5]]),
        ('popAtStack', 1, 5, []),
        ('push', 6, None, [[6]]),
        ('popAtStack', 1, -1, [[6]]),
        ('pop', None, 6, []),
    ]),
    ('trimmed_tail_index_reappears', 2, [
        ('push', 1, None, [[1]]),
        ('push', 2, None, [[1, 2]]),
        ('push', 3, None, [[1, 2], [3]]),
        ('popAtStack', 1, 3, [[1, 2]]),
        ('popAtStack', 1, -1, [[1, 2]]),
        ('push', 4, None, [[1, 2], [4]]),
        ('pop', None, 4, [[1, 2]]),
        ('pop', None, 2, [[1]]),
        ('push', 5, None, [[1, 5]]),
        ('popAtStack', 0, 5, [[1]]),
        ('pop', None, 1, []),
    ]),
    ('empty_far_index_and_repeated_values', 2, [
        ('pop', None, -1, []),
        ('popAtStack', 100000, -1, []),
        ('push', 20000, None, [[20000]]),
        ('popAtStack', 100000, -1, [[20000]]),
        ('pop', None, 20000, []),
        ('pop', None, -1, []),
        ('push', 7, None, [[7]]),
        ('push', 7, None, [[7, 7]]),
        ('pop', None, 7, [[7]]),
        ('pop', None, 7, []),
    ]),
    ('maximum_capacity_small_content', 20000, [
        ('push', 1, None, [[1]]),
        ('push', 2, None, [[1, 2]]),
        ('popAtStack', 0, 2, [[1]]),
        ('pop', None, 1, []),
    ]),
]

results = []
operations = 0
for name, capacity, steps in traces:
    kept = ScanOracle(capacity)
    trimmed = ScanOracle(capacity, trim_tail=True)
    records = []
    for method, argument, expected, state in steps:
        for oracle in (kept, trimmed):
            assert oracle.apply(method, argument) == expected, (name, method, argument)
            assert oracle.snapshot() == state, (name, method, state, oracle.snapshot())
        records.append({'method': method, 'argument': argument, 'result': expected,
                        'stacksBottomToTop': state, 'retainedSlots': len(kept.stacks),
                        'trimmedSlots': len(trimmed.stacks)})
        operations += 1
    results.append({'name': name, 'capacity': capacity, 'steps': records})

output = {'scope': 'Independent hand fixtures and scan oracle only; no heap algorithm or lesson acceptance.',
          'traces': results, 'traceCount': len(traces), 'operationCount': operations,
          'trimmedAndUntrimmedAgreeAtEveryStep': True}
Path(__file__).with_name('example-checks.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'{len(traces)} hand traces / {operations} operations passed for both retained-tail and trimmed-tail scan models')

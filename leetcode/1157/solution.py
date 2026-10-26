from bisect import bisect_left, bisect_right
from collections import defaultdict


class MajorityChecker:
    @staticmethod
    def _merge(a, b):
        # Each pair represents equal survivors after deleting unlike pairs.
        x, p = a
        y, q = b
        if x == y:
            return (x, p + q)
        if p > q:
            return (x, p - q)
        if q > p:
            return (y, q - p)
        return (0, 0)

    def __init__(self, arr: list[int]):
        self.positions = defaultdict(list)
        for i, value in enumerate(arr):
            self.positions[value].append(i)
        self.size = 1
        while self.size < len(arr):
            self.size *= 2
        self.tree = [(0, 0)] * (2 * self.size)
        for i, value in enumerate(arr):
            self.tree[self.size + i] = (value, 1)
        for node in range(self.size - 1, 0, -1):
            self.tree[node] = self._merge(self.tree[2 * node],
                                          self.tree[2 * node + 1])

    def query(self, left: int, right: int, threshold: int) -> int:
        # [lo, hi) is a half-open interval of tree nodes at the same level.
        lo, hi = left + self.size, right + self.size + 1
        summary = (0, 0)
        while lo < hi:
            if lo % 2 == 1:
                summary = self._merge(summary, self.tree[lo])
                lo += 1
            if hi % 2 == 1:
                hi -= 1
                summary = self._merge(summary, self.tree[hi])
            lo //= 2
            hi //= 2
        candidate, balance = summary
        if balance == 0:
            return -1
        indices = self.positions[candidate]
        count = bisect_right(indices, right) - bisect_left(indices, left)
        return candidate if count >= threshold else -1

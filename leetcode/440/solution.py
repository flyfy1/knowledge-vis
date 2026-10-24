class Solution:
    def findKthNumber(self, n: int, k: int) -> int:
        def prefix_size(prefix: int) -> int:
            first, stop = prefix, prefix + 1
            total = 0
            while first <= n:
                total += min(n + 1, stop) - first
                first *= 10
                stop *= 10
            return total

        prefix = 1
        remaining = k - 1
        while remaining > 0:
            size = prefix_size(prefix)
            if size <= remaining:
                prefix += 1
                remaining -= size
            else:
                prefix *= 10
                remaining -= 1
        return prefix

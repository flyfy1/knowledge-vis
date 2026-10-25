class Solution:
    def findKthNumber(self, m: int, n: int, k: int) -> int:
        if m > n:
            m, n = n, m
        lo, hi = 1, m * n
        while lo < hi:
            mid = (lo + hi) // 2
            count = 0
            for i in range(1, m + 1):
                count += min(n, mid // i)
            if count >= k:
                hi = mid
            else:
                lo = mid + 1
        return lo

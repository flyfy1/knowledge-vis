class Solution:
    def splitArray(self, nums: list[int], k: int) -> int:
        lo, hi = max(nums), sum(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            groups, current = 1, 0
            for x in nums:
                if current + x > mid:
                    groups += 1
                    current = x
                else:
                    current += x
            if groups <= k:
                hi = mid
            else:
                lo = mid + 1
        return lo

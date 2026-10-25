class Solution:
    def smallestDistancePair(self, nums: list[int], k: int) -> int:
        a = sorted(nums)
        lo, hi = 0, a[-1] - a[0]
        while lo < hi:
            mid = (lo + hi) // 2
            count = 0
            left = 0
            for right in range(len(a)):
                while a[right] - a[left] > mid:
                    left += 1
                count += right - left
            if count >= k:
                hi = mid
            else:
                lo = mid + 1
        return lo

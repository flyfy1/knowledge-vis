class Solution:
    def containsNearbyAlmostDuplicate(self, nums: list[int], indexDiff: int, valueDiff: int) -> bool:
        width = valueDiff + 1
        buckets = {}
        for i, x in enumerate(nums):
            # Keep only previous positions within indexDiff of i.
            if i > indexDiff:
                old = nums[i - indexDiff - 1]
                del buckets[old // width]

            bucket = x // width
            if bucket in buckets:
                return True
            if bucket - 1 in buckets and abs(x - buckets[bucket - 1]) <= valueDiff:
                return True
            if bucket + 1 in buckets and abs(x - buckets[bucket + 1]) <= valueDiff:
                return True
            buckets[bucket] = x
        return False

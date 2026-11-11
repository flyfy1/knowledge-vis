from typing import List


class Solution:
    def canDivideIntoSubsequences(self, nums: List[int], k: int) -> bool:
        # Step 3: the most repeated value needs that many different sequences.
        # nums is sorted, so equal values sit next to each other: measure runs.
        most = run = 1
        for i in range(1, len(nums)):
            run = run + 1 if nums[i] == nums[i - 1] else 1
            most = max(most, run)
        # Steps 3-4: necessary (most sequences, each of length >= k) and
        # sufficient (deal nums round-robin into `most` piles).
        return most * k <= len(nums)

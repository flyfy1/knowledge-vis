class Solution:
    def xorGame(self, nums: list[int]) -> bool:
        total = 0
        for value in nums:
            total ^= value
        return total == 0 or len(nums) % 2 == 0

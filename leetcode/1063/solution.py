class Solution:
    def validSubarrays(self, nums: list[int]) -> int:
        # alive holds the values of every start that is still <= everything
        # seen since it; read bottom to top they never decrease.
        alive = []
        total = 0
        for value in nums:
            while alive and alive[-1] > value:
                alive.pop()  # a smaller value arrived: that start is dead for good
            alive.append(value)  # the new element starts a subarray of its own
            total += len(alive)  # one valid subarray ends here per alive start
        return total

class Solution:
    def subarraysWithKDistinct(self, nums: list[int], k: int) -> int:
        def at_most(limit: int) -> int:
            freq = {}
            left = 0
            total = 0
            for right, value in enumerate(nums):
                freq[value] = freq.get(value, 0) + 1
                while len(freq) > limit:
                    outgoing = nums[left]
                    freq[outgoing] -= 1
                    if freq[outgoing] == 0:
                        del freq[outgoing]
                    left += 1
                total += right - left + 1
            return total

        return at_most(k) - at_most(k - 1)

class Solution:
    def countTriplets(self, nums: list[int]) -> int:
        bits = max(1, max(nums).bit_length())
        size = 1 << bits
        pair = [0] * size
        for a in nums:
            for b in nums:
                pair[a & b] += 1

        subset = pair.copy()
        for bit in range(bits):
            flag = 1 << bit
            for mask in range(size):
                if mask & flag:
                    subset[mask] += subset[mask ^ flag]

        full = size - 1
        return sum(subset[full ^ x] for x in nums)

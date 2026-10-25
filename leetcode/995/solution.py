class Solution:
    def minKBitFlips(self, nums: list[int], k: int) -> int:
        n = len(nums)
        expire = [0] * (n + 1)
        parity = 0
        flips = 0
        for i in range(n):
            parity ^= expire[i]
            if (nums[i] ^ parity) == 0:
                if i + k > n:
                    return -1
                flips += 1
                parity ^= 1
                expire[i + k] ^= 1
        return flips

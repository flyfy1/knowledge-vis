class Solution:
    def sumSubseqWidths(self, nums: list[int]) -> int:
        mod = 1_000_000_007
        a = sorted(nums)
        n = len(a)
        power = [1] * n
        for i in range(1, n):
            power[i] = power[i - 1] * 2 % mod

        ans = 0
        for i, value in enumerate(a):
            ans = (ans + value * (power[i] - power[n - 1 - i])) % mod
        return ans

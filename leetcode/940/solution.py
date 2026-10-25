class Solution:
    def distinctSubseqII(self, s: str) -> int:
        mod = 1_000_000_007
        ending = [0] * 26
        total = 0
        for char in s:
            index = ord(char) - ord('a')
            new = (total + 1) % mod
            total = (total - ending[index] + new) % mod
            ending[index] = new
        return total

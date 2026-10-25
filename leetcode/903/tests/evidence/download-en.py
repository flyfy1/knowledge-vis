class Solution:
    def numPermsDISequence(self, s: str) -> int:
        mod = 10**9 + 7
        dp = [1]
        for ch in s:
            m = len(dp)
            nxt = [0] * (m + 1)
            total = 0
            if ch == "I":
                for j in range(m + 1):
                    nxt[j] = total
                    if j < m:
                        total = (total + dp[j]) % mod
            else:
                for j in range(m - 1, -1, -1):
                    total = (total + dp[j]) % mod
                    nxt[j] = total
            dp = nxt
        return sum(dp) % mod

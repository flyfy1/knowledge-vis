class Solution:
    def numMusicPlaylists(self, n: int, goal: int, k: int) -> int:
        mod = 1_000_000_007
        dp = [0] * (n + 1)
        dp[0] = 1
        for i in range(1, goal + 1):
            nxt = [0] * (n + 1)
            for j in range(1, min(i, n) + 1):
                new = dp[j - 1] * (n - j + 1)
                replay = dp[j] * max(j - k, 0)
                nxt[j] = (new + replay) % mod
            dp = nxt
        return dp[n]

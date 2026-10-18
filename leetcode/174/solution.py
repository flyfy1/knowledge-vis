class Solution:
    def calculateMinimumHP(self, dungeon: list[list[int]]) -> int:
        m, n = len(dungeon), len(dungeon[0])
        dp = [float("inf")] * (n + 1)
        dp[n - 1] = 1
        for r in range(m - 1, -1, -1):
            for c in range(n - 1, -1, -1):
                dp[c] = max(1, min(dp[c], dp[c + 1]) - dungeon[r][c])
        return dp[0]

class Solution:
    def minDeletionSize(self, strs: list[str]) -> int:
        n, m = len(strs), len(strs[0])
        dp = [1] * m
        for j in range(m):
            for i in range(j):
                compatible = True
                for r in range(n):
                    if strs[r][i] > strs[r][j]:
                        compatible = False
                        break
                if compatible:
                    dp[j] = max(dp[j], dp[i] + 1)
        return m - max(dp)

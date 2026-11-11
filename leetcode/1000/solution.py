class Solution:
    def mergeStones(self, stones: list[int], k: int) -> int:
        n = len(stones)
        if (n - 1) % (k - 1) != 0:
            return -1
        prefix = [0]
        for value in stones:
            prefix.append(prefix[-1] + value)
        inf = float("inf")
        dp = [[[inf] * (k + 1) for _ in range(n)] for _ in range(n)]
        for i in range(n):
            dp[i][i][1] = 0
        for length in range(2, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                for p in range(2, min(k, length) + 1):
                    if (length - p) % (k - 1) != 0:
                        continue
                    for m in range(i, j):
                        candidate = dp[i][m][1] + dp[m + 1][j][p - 1]
                        dp[i][j][p] = min(dp[i][j][p], candidate)
                if (length - 1) % (k - 1) == 0:
                    dp[i][j][1] = dp[i][j][k] + prefix[j + 1] - prefix[i]
        return int(dp[0][n - 1][1])

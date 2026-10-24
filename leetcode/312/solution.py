from typing import List

class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        values = [1] + nums + [1]
        n = len(values)
        dp = [[0] * n for _ in range(n)]
        for width in range(2, n):
            for left in range(0, n - width):
                right = left + width
                best = 0
                for last in range(left + 1, right):
                    best = max(best, dp[left][last] + dp[last][right]
                               + values[left] * values[last] * values[right])
                dp[left][right] = best
        return dp[0][n - 1]

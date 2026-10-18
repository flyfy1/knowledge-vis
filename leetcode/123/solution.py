class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        h1 = h2 = float("-inf")
        s1 = s2 = 0
        for p in prices:
            # Tuple right-hand sides all use yesterday's states.
            h1, s1, h2, s2 = (
                max(h1, -p),
                max(s1, h1 + p),
                max(h2, s1 - p),
                max(s2, h2 + p),
            )
        return s2

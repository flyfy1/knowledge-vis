class Solution:
    def tallestBillboard(self, rods: list[int]) -> int:
        # dp[d] is the largest shorter height with absolute gap d.
        dp = {0: 0}
        for x in rods:
            old = dp
            dp = old.copy()  # Skip x; all reads below use the old prefix.
            for d, h in old.items():
                dp[d + x] = max(dp.get(d + x, 0), h)
                gap = abs(d - x)
                short = h + min(d, x)
                dp[gap] = max(dp.get(gap, 0), short)
        return dp[0]

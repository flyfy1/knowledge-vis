class Solution:
    def profitableSchemes(self, n: int, minProfit: int, group: list[int], profit: list[int]) -> int:
        mod = 1_000_000_007
        dp = [[0] * (minProfit + 1) for _ in range(n + 1)]
        dp[0][0] = 1
        for people, gain in zip(group, profit):
            nxt = [row[:] for row in dp]  # Skip this crime.
            for used in range(n + 1):
                if used + people > n:
                    continue
                for earned in range(minProfit + 1):
                    capped = min(minProfit, earned + gain)
                    nxt[used + people][capped] = (
                        nxt[used + people][capped] + dp[used][earned]
                    ) % mod
            dp = nxt
        return sum(row[minProfit] for row in dp) % mod

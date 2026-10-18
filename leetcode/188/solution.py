class Solution:
    def maxProfit(self, k: int, prices: list[int]) -> int:
        # cash[t]: flat, at most t trades; hold[t]: at most t buys.
        cash = [0] * (k + 1)
        hold = [float('-inf')] * (k + 1)
        for price in prices:
            old_cash, old_hold = cash[:], hold[:]
            for t in range(1, k + 1):
                hold[t] = max(old_hold[t], old_cash[t - 1] - price)
                cash[t] = max(old_cash[t], old_hold[t] + price)
        return cash[k]

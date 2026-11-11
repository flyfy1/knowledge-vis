class Solution:
    def racecar(self, target: int) -> int:
        # dp[t] = fewest commands to cover distance t, starting at speed 1
        # facing the target (an R always restarts the car in that state).
        dp = [0] * (target + 1)
        for t in range(1, target + 1):
            n = t.bit_length()          # n A's reach 2**n - 1 >= t
            if t == (1 << n) - 1:
                dp[t] = n               # exact hit with one run
                continue
            # Overshoot: n A's, R, then cover the gap 2**n - 1 - t.
            best = n + 1 + dp[(1 << n) - 1 - t]
            # Stop short: n-1 A's, R, m A's back, R, then cover the rest.
            for m in range(n - 1):
                rest = t - ((1 << (n - 1)) - 1) + ((1 << m) - 1)
                best = min(best, (n - 1) + 1 + m + 1 + dp[rest])
            dp[t] = best
        return dp[target]

class Solution:
    def superEggDrop(self, k: int, n: int) -> int:
        # dp[e] is the floor capacity with the completed move budget.
        dp = [0] * (k + 1)
        moves = 0
        while dp[k] < n:
            moves += 1
            # Descend so both operands still belong to the previous budget.
            for eggs in range(k, 0, -1):
                dp[eggs] = dp[eggs - 1] + 1 + dp[eggs]
        return moves

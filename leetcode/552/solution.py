class Solution:
    def checkRecord(self, n: int) -> int:
        mod = 1_000_000_007
        dp = [[0] * 3 for _ in range(2)]
        dp[0][0] = 1
        for _ in range(n):
            nxt = [[0] * 3 for _ in range(2)]
            for a in range(2):
                for l in range(3):
                    count = dp[a][l]
                    # P ends the late streak.
                    nxt[a][0] = (nxt[a][0] + count) % mod
                    # A is allowed only if no absence has been used.
                    if a == 0:
                        nxt[1][0] = (nxt[1][0] + count) % mod
                    # L is allowed only before a third consecutive L.
                    if l < 2:
                        nxt[a][l + 1] = (nxt[a][l + 1] + count) % mod
            dp = nxt
        return sum(sum(row) for row in dp) % mod

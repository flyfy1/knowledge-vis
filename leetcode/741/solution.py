class Solution:
    def cherryPickup(self, grid: list[list[int]]) -> int:
        n = len(grid)
        impossible = -10**9
        dp = [[impossible] * n for _ in range(n)]
        dp[0][0] = grid[0][0]
        for t in range(1, 2 * n - 1):
            ndp = [[impossible] * n for _ in range(n)]
            low, high = max(0, t - n + 1), min(n - 1, t)
            for r1 in range(low, high + 1):
                c1 = t - r1
                if grid[r1][c1] == -1:
                    continue
                for r2 in range(low, high + 1):
                    c2 = t - r2
                    if grid[r2][c2] == -1:
                        continue
                    best = impossible
                    for p1 in (r1, r1 - 1):
                        for p2 in (r2, r2 - 1):
                            if p1 >= 0 and p2 >= 0:
                                best = max(best, dp[p1][p2])
                    if best == impossible:
                        continue
                    gain = grid[r1][c1]
                    if r1 != r2:
                        gain += grid[r2][c2]
                    ndp[r1][r2] = best + gain
            dp = ndp
        return max(0, dp[n - 1][n - 1])

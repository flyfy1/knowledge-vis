from typing import List


class Solution:
    def uniquePathsIII(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        remaining = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] != -1:
                    remaining += 1
                if grid[r][c] == 1:
                    start_r, start_c = r, c

        def dfs(r: int, c: int, remaining: int) -> int:
            saved = grid[r][c]
            grid[r][c] = -1
            remaining -= 1
            if saved == 2:
                total = int(remaining == 0)
            else:
                total = 0
                for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != -1:
                        total += dfs(nr, nc, remaining)
            grid[r][c] = saved
            return total

        return dfs(start_r, start_c, remaining)

class Solution:
    def largestIsland(self, grid: list[list[int]]) -> int:
        n = len(grid)
        labels = [[0] * n for _ in range(n)]
        area = {0: 0}
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))
        component = 2
        best = 0
        for r in range(n):
            for c in range(n):
                if grid[r][c] != 1 or labels[r][c] != 0:
                    continue
                labels[r][c] = component
                stack = [(r, c)]
                size = 0
                while stack:
                    x, y = stack.pop()
                    size += 1
                    for dx, dy in directions:
                        nx, ny = x + dx, y + dy
                        if (0 <= nx < n and 0 <= ny < n
                                and grid[nx][ny] == 1 and labels[nx][ny] == 0):
                            labels[nx][ny] = component
                            stack.append((nx, ny))
                area[component] = size
                best = max(best, size)
                component += 1
        for r in range(n):
            for c in range(n):
                if grid[r][c] != 0:
                    continue
                seen = set()
                for dx, dy in directions:
                    nr, nc = r + dx, c + dy
                    if 0 <= nr < n and 0 <= nc < n:
                        seen.add(labels[nr][nc])
                candidate = 1 + sum(area[k] for k in seen)
                best = max(best, candidate)
        return best

def threshold_baseline(grid):
    n = len(grid)
    for t in range(grid[0][0], n * n):
        seen = {(0, 0)}
        stack = [(0, 0)]
        while stack:
            r, c = stack.pop()
            for dr, dc in ((-1, 0), (0, -1), (0, 1), (1, 0)):
                nr, nc = r + dr, c + dc
                if (0 <= nr < n and 0 <= nc < n
                        and grid[nr][nc] <= t
                        and (nr, nc) not in seen):
                    seen.add((nr, nc))
                    stack.append((nr, nc))
        if (n - 1, n - 1) in seen:
            return t

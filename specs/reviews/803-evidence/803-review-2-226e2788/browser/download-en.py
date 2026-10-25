class Solution:
    def hitBricks(self, grid: list[list[int]], hits: list[list[int]]) -> list[int]:
        m, n = len(grid), len(grid[0])
        roof = m * n
        parent = list(range(roof + 1))
        size = [1] * (roof + 1)
        work = [row[:] for row in grid]
        for r, c in hits:
            work[r][c] = 0

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def union(a, b):
            a, b = find(a), find(b)
            if a == b:
                return
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]

        for r in range(m):
            for c in range(n):
                if work[r][c]:
                    cell = r * n + c
                    if r == 0:
                        union(cell, roof)
                    if r > 0 and work[r - 1][c]:
                        union(cell, cell - n)
                    if c > 0 and work[r][c - 1]:
                        union(cell, cell - 1)

        result = [0] * len(hits)
        for i in range(len(hits) - 1, -1, -1):
            r, c = hits[i]
            if grid[r][c] == 0:
                continue
            before = size[find(roof)]
            work[r][c] = 1
            cell = r * n + c
            if r == 0:
                union(cell, roof)
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and work[nr][nc]:
                    union(cell, nr * n + nc)
            after = size[find(roof)]
            result[i] = max(0, after - before - 1)
        return result

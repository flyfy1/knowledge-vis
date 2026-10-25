class Solution:
    def containVirus(self, isInfected: list[list[int]]) -> int:
        grid = [row[:] for row in isInfected]
        m, n = len(grid), len(grid[0])
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))
        total = 0
        while True:
            seen = set()
            regions = []
            for r in range(m):
                for c in range(n):
                    if grid[r][c] != 1 or (r, c) in seen:
                        continue
                    cells, frontier, needed = [], set(), 0
                    stack = [(r, c)]
                    seen.add((r, c))
                    while stack:
                        x, y = stack.pop()
                        cells.append((x, y))
                        for dx, dy in directions:
                            a, b = x + dx, y + dy
                            if not (0 <= a < m and 0 <= b < n):
                                continue
                            if grid[a][b] == 0:
                                frontier.add((a, b))
                                needed += 1
                            elif grid[a][b] == 1 and (a, b) not in seen:
                                seen.add((a, b))
                                stack.append((a, b))
                    regions.append((cells, frontier, needed))
            if not regions:
                return total
            chosen = max(range(len(regions)), key=lambda i: len(regions[i][1]))
            if not regions[chosen][1]:
                return total
            total += regions[chosen][2]
            for r, c in regions[chosen][0]:
                grid[r][c] = -1
            # All frontiers were computed before any cell changed this day.
            for i, (_, frontier, _) in enumerate(regions):
                if i != chosen:
                    for r, c in frontier:
                        grid[r][c] = 1

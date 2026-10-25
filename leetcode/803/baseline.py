"""Independent forward-search oracle; deliberately no reverse processing or DSU."""
def roof_reachable(grid):
    m, n = len(grid), len(grid[0])
    seen = {(0, c) for c in range(n) if grid[0][c]}
    pending = list(seen)
    while pending:
        r, c = pending.pop()
        for x, y in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if 0 <= x < m and 0 <= y < n and grid[x][y] and (x, y) not in seen:
                seen.add((x, y))
                pending.append((x, y))
    return seen


def baseline(grid, hits):
    work = [row[:] for row in grid]
    result = []
    for r, c in hits:
        if not work[r][c]:
            result.append(0)
            continue
        before = roof_reachable(work)
        work[r][c] = 0
        after = roof_reachable(work)
        fallen = before - after - {(r, c)}
        result.append(len(fallen))
        for x, y in fallen:
            work[x][y] = 0
    return result

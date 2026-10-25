"""Independent exponential reference: enumerate path coordinate sets, no DP."""
def prefixes(grid, t):
    n = len(grid)
    def visit(r, c, cells):
        if r >= n or c >= n or grid[r][c] == -1:
            return
        cells = cells | {(r, c)}
        if r + c == t:
            yield (r, c), cells
        else:
            yield from visit(r + 1, c, cells)
            yield from visit(r, c + 1, cells)
    return list(visit(0, 0, set()))

def layer_oracle(grid, t):
    result = [[None] * len(grid) for _ in grid]
    paths = prefixes(grid, t)
    for (a, sa) in paths:
        for (b, sb) in paths:
            score = sum(grid[r][c] for r, c in sa | sb)
            old = result[a[0]][b[0]]
            result[a[0]][b[0]] = score if old is None else max(old, score)
    return result

def oracle(grid):
    return max(0, layer_oracle(grid, 2 * len(grid) - 2)[-1][-1] or 0)

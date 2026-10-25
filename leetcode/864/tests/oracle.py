"""Independent reference: explicit inventory sets and synchronous edge relaxation."""
from itertools import combinations


def graph_distances(grid):
    letters = sorted({ch for row in grid for ch in row if ch.islower()})
    inventories = [frozenset(part) for size in range(len(letters) + 1)
                   for part in combinations(letters, size)]
    nodes = [(r, c, bag) for r, row in enumerate(grid)
             for c, ch in enumerate(row) if ch != '#' for bag in inventories]
    edges = []
    start = None
    for r, c, bag in nodes:
        if grid[r][c] == '@' and not bag:
            start = (r, c, bag)
        for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            nr, nc = r + dr, c + dc
            if not (0 <= nr < len(grid) and 0 <= nc < len(grid[0])):
                continue
            ch = grid[nr][nc]
            if ch == '#' or (ch.isupper() and ch.lower() not in bag):
                continue
            new_bag = bag | {ch} if ch.islower() else bag
            edges.append(((r, c, bag), (nr, nc, new_bag)))
    distance = {start: 0}
    for _ in range(len(nodes) - 1):
        updated = distance.copy()
        for u, v in edges:
            if u in distance:
                candidate = distance[u] + 1
                if candidate < updated.get(v, float('inf')):
                    updated[v] = candidate
        if updated == distance:
            break
        distance = updated
    goal = frozenset(letters)
    answer = min((d for (_, _, bag), d in distance.items() if bag == goal), default=-1)
    return answer, distance

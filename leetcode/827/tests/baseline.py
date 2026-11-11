def baseline(grid):
    n = len(grid)

    def largest(board):
        visited = set()
        best = 0
        for r in range(n):
            for c in range(n):
                if not board[r][c] or (r, c) in visited:
                    continue
                pending = [(r, c)]
                visited.add((r, c))
                count = 0
                for x, y in pending:
                    count += 1
                    for a, b in ((x-1, y), (x+1, y), (x, y-1), (x, y+1)):
                        if 0 <= a < n and 0 <= b < n and board[a][b] and (a, b) not in visited:
                            visited.add((a, b))
                            pending.append((a, b))
                best = max(best, count)
        return best

    best = largest(grid)
    for r in range(n):
        for c in range(n):
            if grid[r][c] == 0:
                board = [row[:] for row in grid]
                board[r][c] = 1
                best = max(best, largest(board))
    return best

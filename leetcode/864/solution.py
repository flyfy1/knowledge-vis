from collections import deque


class Solution:
    def shortestPathAllKeys(self, grid: list[str]) -> int:
        m, n = len(grid), len(grid[0])
        target = 0
        for r in range(m):
            for c in range(n):
                ch = grid[r][c]
                if ch == '@':
                    start = (r, c, 0)
                elif 'a' <= ch <= 'f':
                    target |= 1 << (ord(ch) - ord('a'))

        queue = deque([(start[0], start[1], 0, 0)])
        seen = {start}
        while queue:
            r, c, mask, distance = queue.popleft()
            if mask == target:
                return distance
            for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                nr, nc = r + dr, c + dc
                if not (0 <= nr < m and 0 <= nc < n):
                    continue
                ch = grid[nr][nc]
                if ch == '#':
                    continue
                if 'A' <= ch <= 'F' and not (mask & (1 << (ord(ch) - ord('A')))):
                    continue
                next_mask = mask
                if 'a' <= ch <= 'f':
                    next_mask |= 1 << (ord(ch) - ord('a'))
                state = (nr, nc, next_mask)
                if state not in seen:
                    seen.add(state)
                    queue.append((nr, nc, next_mask, distance + 1))
        return -1

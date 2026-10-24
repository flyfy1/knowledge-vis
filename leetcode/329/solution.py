from collections import deque


class Solution:
    def longestIncreasingPath(self, matrix: list[list[int]]) -> int:
        m, n = len(matrix), len(matrix[0])
        directions = ((1, 0), (-1, 0), (0, 1), (0, -1))
        out = [[0] * n for _ in range(m)]
        for r in range(m):
            for c in range(n):
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < m and 0 <= nc < n and matrix[nr][nc] > matrix[r][c]:
                        out[r][c] += 1
        queue = deque((r, c) for r in range(m) for c in range(n) if out[r][c] == 0)
        rounds = 0
        while queue:
            rounds += 1
            for _ in range(len(queue)):
                r, c = queue.popleft()
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < m and 0 <= nc < n and matrix[nr][nc] < matrix[r][c]:
                        out[nr][nc] -= 1
                        if out[nr][nc] == 0:
                            queue.append((nr, nc))
        return rounds

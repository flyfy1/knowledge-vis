from heapq import heappop, heappush


class Solution:
    def swimInWater(self, grid: list[list[int]]) -> int:
        n = len(grid)
        dist = [[float("inf")] * n for _ in range(n)]
        dist[0][0] = grid[0][0]
        heap = [(grid[0][0], 0, 0)]
        while heap:
            cost, r, c = heappop(heap)
            if cost != dist[r][c]:
                continue
            if r == n - 1 and c == n - 1:
                return cost
            for dr, dc in ((-1, 0), (0, -1), (0, 1), (1, 0)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n:
                    candidate = max(cost, grid[nr][nc])
                    if candidate < dist[nr][nc]:
                        dist[nr][nc] = candidate
                        heappush(heap, (candidate, nr, nc))
        raise RuntimeError("A valid square grid is connected")

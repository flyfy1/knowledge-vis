from heapq import heappop, heappush


class Solution:
    def trapRainWater(self, heightMap: list[list[int]]) -> int:
        m, n = len(heightMap), len(heightMap[0])
        seen = [[False] * n for _ in range(m)]
        heap = []
        # Every boundary cell already has an escape route: itself.
        for r in range(m):
            for c in range(n):
                if r in (0, m - 1) or c in (0, n - 1):
                    seen[r][c] = True
                    heappush(heap, (heightMap[r][c], r, c))

        water = 0
        while heap:
            level, r, c = heappop(heap)
            for dr, dc in ((-1, 0), (0, -1), (0, 1), (1, 0)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and not seen[nr][nc]:
                    seen[nr][nc] = True
                    ground = heightMap[nr][nc]
                    water += max(0, level - ground)
                    heappush(heap, (max(level, ground), nr, nc))
        return water

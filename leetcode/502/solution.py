import heapq


class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: list[int], capital: list[int]) -> int:
        projects = sorted((c, p, i) for i, (c, p) in enumerate(zip(capital, profits)))
        ready = []
        j = 0
        n = len(projects)
        for _ in range(min(k, n)):
            while j < n and projects[j][0] <= w:
                _, profit, project_id = projects[j]
                heapq.heappush(ready, (-profit, project_id))
                j += 1
            if not ready:
                break
            negative_profit, _ = heapq.heappop(ready)
            w -= negative_profit
        return w

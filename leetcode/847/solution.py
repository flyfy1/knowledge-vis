from collections import deque


class Solution:
    def shortestPathLength(self, graph: list[list[int]]) -> int:
        n = len(graph)
        full = (1 << n) - 1
        queue = deque((u, 1 << u, 0) for u in range(n))
        seen = {(u, 1 << u) for u in range(n)}

        while queue:
            u, mask, distance = queue.popleft()
            if mask == full:
                return distance
            for v in graph[u]:
                next_mask = mask | (1 << v)
                state = (v, next_mask)
                if state not in seen:
                    seen.add(state)
                    queue.append((v, next_mask, distance + 1))
        return -1  # Unreachable for a connected input graph.

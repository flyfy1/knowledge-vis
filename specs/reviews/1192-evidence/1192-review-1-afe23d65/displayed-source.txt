from typing import List

class Solution:
    def criticalConnections(self, n: int, connections: List[List[int]]) -> List[List[int]]:
        graph = [[] for _ in range(n)]
        for edge_id, (a, b) in enumerate(connections):
            graph[a].append((b, edge_id))
            graph[b].append((a, edge_id))
        tin = [-1] * n
        low = [0] * n
        bridges = []
        timer = 0

        def dfs(u: int, parent_edge: int) -> None:
            nonlocal timer
            tin[u] = low[u] = timer
            timer += 1
            for v, edge_id in graph[u]:
                if edge_id == parent_edge:
                    continue
                if tin[v] != -1:
                    low[u] = min(low[u], tin[v])
                else:
                    dfs(v, edge_id)
                    low[u] = min(low[u], low[v])
                    if low[v] > tin[u]:
                        bridges.append([u, v])

        for u in range(n):
            if tin[u] == -1:
                dfs(u, -1)
        return bridges

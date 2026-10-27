from typing import List

class Solution:
    def criticalConnections(self, n: int, connections: List[List[int]]) -> List[List[int]]:
        graph = [[] for _ in range(n)]
        for edge_id, (a, b) in enumerate(connections):
            graph[a].append((b, edge_id))
            graph[b].append((a, edge_id))
        tin = [-1] * n
        low = [0] * n
        parent = [-1] * n
        parent_edge = [-1] * n
        bridges = []
        timer = 0

        # Keep the DFS call stack on the heap so a valid path of 10^5 nodes
        # does not depend on Python's small interpreter recursion limit.
        for root in range(n):
            if tin[root] != -1:
                continue
            tin[root] = low[root] = timer
            timer += 1
            stack = [(root, 0)]
            while stack:
                u, next_index = stack[-1]
                if next_index == len(graph[u]):
                    stack.pop()
                    p = parent[u]
                    if p != -1:
                        low[p] = min(low[p], low[u])
                        if low[u] > tin[p]:
                            bridges.append([p, u])
                    continue

                v, edge_id = graph[u][next_index]
                stack[-1] = (u, next_index + 1)
                if edge_id == parent_edge[u]:
                    continue
                if tin[v] != -1:
                    low[u] = min(low[u], tin[v])
                    continue
                parent[v] = u
                parent_edge[v] = edge_id
                tin[v] = low[v] = timer
                timer += 1
                stack.append((v, 0))
        return bridges

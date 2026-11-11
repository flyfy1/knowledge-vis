from heapq import heappop, heappush


class Solution:
    def reachableNodes(self, edges: list[list[int]], maxMoves: int, n: int) -> int:
        graph = [[] for _ in range(n)]
        for u, v, cnt in edges:
            graph[u].append((v, cnt + 1))
            graph[v].append((u, cnt + 1))

        dist = [float('inf')] * n
        dist[0] = 0
        heap = [(0, 0)]
        while heap:
            distance, u = heappop(heap)
            if distance != dist[u]:
                continue
            for v, weight in graph[u]:
                candidate = distance + weight
                if candidate < dist[v]:
                    dist[v] = candidate
                    heappush(heap, (candidate, v))

        answer = 0
        for distance in dist:
            if distance <= maxMoves:
                answer += 1
        for u, v, cnt in edges:
            a = max(0, maxMoves - dist[u])
            b = max(0, maxMoves - dist[v])
            answer += min(cnt, a + b)
        return answer

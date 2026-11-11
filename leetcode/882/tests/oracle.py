from collections import deque


def baseline(edges, maxMoves, n):
    graph = [[] for _ in range(n)]
    for u, v, cnt in edges:
        previous = u
        for _ in range(cnt):
            node = len(graph)
            graph.append([])
            graph[previous].append(node)
            graph[node].append(previous)
            previous = node
        graph[previous].append(v)
        graph[v].append(previous)
    distance = [-1] * len(graph)
    distance[0] = 0
    queue = deque([0])
    while queue:
        u = queue.popleft()
        if distance[u] == maxMoves:
            continue
        for v in graph[u]:
            if distance[v] == -1:
                distance[v] = distance[u] + 1
                queue.append(v)
    return sum(d != -1 for d in distance)

from collections import deque


def baseline(routes, source, target):
    if source == target:
        return 0
    stops = [set(route) for route in routes]
    graph = [[] for _ in routes]
    for i in range(len(routes)):
        for j in range(i):
            if stops[i] & stops[j]:
                graph[i].append(j)
                graph[j].append(i)
    queue = deque((i, 1) for i, s in enumerate(stops) if source in s)
    seen = {i for i, _ in queue}
    while queue:
        bus, count = queue.popleft()
        if target in stops[bus]:
            return count
        for nxt in graph[bus]:
            if nxt not in seen:
                seen.add(nxt)
                queue.append((nxt, count + 1))
    return -1

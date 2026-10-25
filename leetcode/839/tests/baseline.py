def baseline(strs):
    n = len(strs)
    graph = [[] for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            d = sum(strs[i][k] != strs[j][k]
                    for k in range(len(strs[i])))
            if d == 0 or d == 2:  # anagrams are guaranteed
                graph[i].append(j)
                graph[j].append(i)
    seen = set()
    groups = 0
    for start in range(n):
        if start in seen:
            continue
        groups += 1
        seen.add(start)
        queue = [start]
        head = 0
        while head < len(queue):
            node = queue[head]
            head += 1
            for nxt in graph[node]:
                if nxt not in seen:
                    seen.add(nxt)
                    queue.append(nxt)
    return groups

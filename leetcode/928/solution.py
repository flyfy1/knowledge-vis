class Solution:
    def minMalwareSpread(self, graph: list[list[int]], initial: list[int]) -> int:
        n = len(graph)
        infected = set(initial)
        component = [-1] * n
        saved = [0] * n
        group = 0

        for start in range(n):
            if start in infected or component[start] != -1:
                continue
            component[start] = group
            stack = [start]
            size = 0
            boundary = set()
            while stack:
                node = stack.pop()
                size += 1
                for neighbor in range(n):
                    if not graph[node][neighbor]:
                        continue
                    if neighbor in infected:
                        boundary.add(neighbor)
                    elif component[neighbor] == -1:
                        component[neighbor] = group
                        stack.append(neighbor)
            if len(boundary) == 1:
                owner = next(iter(boundary))
                saved[owner] += size
            group += 1

        answer = min(initial)
        for node in initial:
            if (saved[node] > saved[answer] or
                    (saved[node] == saved[answer] and node < answer)):
                answer = node
        return answer

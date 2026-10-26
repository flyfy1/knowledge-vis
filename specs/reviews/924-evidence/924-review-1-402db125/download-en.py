class Solution:
    def minMalwareSpread(self, graph: list[list[int]], initial: list[int]) -> int:
        n = len(graph)
        component = [-1] * n
        sizes = []
        for start in range(n):
            if component[start] != -1:
                continue
            group = len(sizes)
            component[start] = group
            stack = [start]
            size = 0
            while stack:
                node = stack.pop()
                size += 1
                for neighbor in range(n):
                    if graph[node][neighbor] and component[neighbor] == -1:
                        component[neighbor] = group
                        stack.append(neighbor)
            sizes.append(size)

        count = [0] * len(sizes)
        for node in initial:
            count[component[node]] += 1

        answer = min(initial)
        best_saved = -1
        for node in initial:
            group = component[node]
            saved = sizes[group] if count[group] == 1 else 0
            if saved > best_saved or (saved == best_saved and node < answer):
                answer = node
                best_saved = saved
        return answer

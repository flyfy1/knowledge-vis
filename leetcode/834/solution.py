class Solution:
    def sumOfDistancesInTree(self, n: int, edges: list[list[int]]) -> list[int]:
        graph = [[] for _ in range(n)]
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        parent = [-1] * n
        order = [0]
        # In a tree, excluding the parent visits each child exactly once.
        for u in order:
            for v in graph[u]:
                if v != parent[u]:
                    parent[v] = u
                    order.append(v)

        size = [1] * n
        down = [0] * n
        # Children finish before their parents.
        for v in reversed(order[1:]):
            u = parent[v]
            size[u] += size[v]
            down[u] += down[v] + size[v]

        answer = [0] * n
        answer[0] = down[0]
        # Parents have full answers before their children.
        for v in order[1:]:
            u = parent[v]
            answer[v] = answer[u] + n - 2 * size[v]
        return answer

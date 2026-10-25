class Solution:
    def findRedundantDirectedConnection(self, edges: list[list[int]]) -> list[int]:
        n = len(edges)
        incoming = [-1] * (n + 1)
        earlier = later = -1
        for i, (u, v) in enumerate(edges):
            if incoming[v] != -1:
                earlier, later = incoming[v], i
            else:
                incoming[v] = i

        leader = list(range(n + 1))
        size = [1] * (n + 1)

        def find(x):
            while x != leader[x]:
                leader[x] = leader[leader[x]]
                x = leader[x]
            return x

        for i, (u, v) in enumerate(edges):
            if i == later:
                continue
            a, b = find(u), find(v)
            if a == b:
                return edges[earlier if earlier != -1 else i][:]
            if size[a] < size[b]:
                a, b = b, a
            leader[b] = a
            size[a] += size[b]

        return edges[later][:]

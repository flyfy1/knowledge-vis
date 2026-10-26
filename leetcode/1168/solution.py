class Solution:
    def minCostToSupplyWater(self, n, wells, pipes):
        edges = [(w, 0, i + 1) for i, w in enumerate(wells)]
        edges += [(c, u, v) for u, v, c in pipes]
        parent = list(range(n + 1))
        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        total = 0
        for cost, u, v in sorted(edges):
            ru, rv = find(u), find(v)
            if ru != rv:
                parent[rv] = ru
                total += cost
        return total

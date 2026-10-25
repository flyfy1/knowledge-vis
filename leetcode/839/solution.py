class Solution:
    def numSimilarGroups(self, strs: list[str]) -> int:
        n = len(strs)
        parent = list(range(n))
        size = [1] * n
        groups = n

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def similar(a, b):
            differences = 0
            for k in range(len(a)):
                if a[k] != b[k]:
                    differences += 1
                    if differences > 2:
                        return False
            return differences == 0 or differences == 2

        for i in range(n):
            for j in range(i + 1, n):
                if similar(strs[i], strs[j]):
                    a, b = find(i), find(j)
                    if a != b:
                        if size[a] < size[b]:
                            a, b = b, a
                        parent[b] = a
                        size[a] += size[b]
                        groups -= 1
        return groups

class Solution:
    def largestComponentSize(self, nums: list[int]) -> int:
        n = len(nums)
        parent = list(range(n))
        size = [1] * n

        def find(i):
            while parent[i] != i:
                parent[i] = parent[parent[i]]
                i = parent[i]
            return i

        def union(i, j):
            a, b = find(i), find(j)
            if a == b:
                return
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]

        owner = {}
        for i, value in enumerate(nums):
            x = value
            p = 2
            while p * p <= x:
                if x % p == 0:
                    if p in owner:
                        union(i, owner[p])
                    else:
                        owner[p] = i
                    while x % p == 0:
                        x //= p
                p += 1
            if x > 1:
                if x in owner:
                    union(i, owner[x])
                else:
                    owner[x] = i

        counts = [0] * n
        for i in range(n):
            counts[find(i)] += 1
        return max(counts)

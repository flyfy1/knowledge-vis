class Solution:
    def shortestSuperstring(self, words: list[str]) -> str:
        n = len(words)
        overlap = [[0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i != j:
                    for k in range(min(len(words[i]), len(words[j])), 0, -1):
                        if words[i].endswith(words[j][:k]):
                            overlap[i][j] = k
                            break

        size = 1 << n
        dp = [[float('inf')] * n for _ in range(size)]
        parent = [[-1] * n for _ in range(size)]
        for j in range(n):
            dp[1 << j][j] = len(words[j])
        for mask in range(1, size):
            for j in range(n):
                if not mask & (1 << j):
                    continue
                previous = mask ^ (1 << j)
                if previous == 0:
                    continue
                for i in range(n):
                    if previous & (1 << i):
                        candidate = dp[previous][i] + len(words[j]) - overlap[i][j]
                        if candidate < dp[mask][j]:
                            dp[mask][j] = candidate
                            parent[mask][j] = i

        mask = size - 1
        last = min(range(n), key=lambda j: dp[mask][j])
        order = []
        while last != -1:
            order.append(last)
            before = parent[mask][last]
            mask ^= 1 << last
            last = before
        order.reverse()
        pieces = [words[order[0]]]
        for i, j in zip(order, order[1:]):
            pieces.append(words[j][overlap[i][j]:])
        return ''.join(pieces)

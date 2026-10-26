class Solution:
    def longestDupSubstring(self, s: str) -> str:
        n = len(s)
        sa = list(range(n))
        rank = [ord(c) - ord('a') for c in s]
        k = 1
        while k < n:
            def key(i):
                return (rank[i], rank[i + k] if i + k < n else -1)

            sa.sort(key=key)
            new_rank = [0] * n
            for p in range(1, n):
                new_rank[sa[p]] = new_rank[sa[p - 1]] + (key(sa[p]) != key(sa[p - 1]))
            rank = new_rank
            if rank[sa[-1]] == n - 1:
                break
            k *= 2

        inverse = [0] * n
        for p, i in enumerate(sa):
            inverse[i] = p
        h = best_len = best_start = 0
        for i in range(n):
            p = inverse[i]
            if p == 0:
                h = 0
                continue
            j = sa[p - 1]
            while i + h < n and j + h < n and s[i + h] == s[j + h]:
                h += 1
            if h > best_len:
                best_len, best_start = h, i
            h = max(0, h - 1)
        return s[best_start:best_start + best_len]

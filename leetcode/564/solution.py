class Solution:
    def nearestPalindromic(self, n: str) -> str:
        d = len(n)
        h = (d + 1) // 2
        p = int(n[:h])
        candidates = {10 ** (d - 1) - 1, 10 ** d + 1}
        for q in (p - 1, p, p + 1):
            s = str(q)
            if q < 0 or len(s) != h or (d > 1 and s[0] == '0'):
                continue
            tail = s[:-1] if d % 2 else s
            candidates.add(int(s + tail[::-1]))
        x = int(n)
        candidates.discard(x)
        return str(min(candidates, key=lambda y: (abs(y - x), y)))

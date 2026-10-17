class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        n = len(p)
        previous = [False] * (n + 1)
        previous[0] = True
        for j in range(1, n + 1):
            previous[j] = previous[j - 1] and p[j - 1] == "*"
        for char in s:
            current = [False] * (n + 1)
            for j in range(1, n + 1):
                if p[j - 1] == "*":
                    current[j] = current[j - 1] or previous[j]
                else:
                    current[j] = p[j - 1] in (char, "?") and previous[j - 1]
            previous = current
        return previous[n]

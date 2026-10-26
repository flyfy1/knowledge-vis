class Solution:
    def orderlyQueue(self, s: str, k: int) -> str:
        if k == 1:
            best = s
            for i in range(1, len(s)):
                candidate = s[i:] + s[:i]
                if candidate < best:
                    best = candidate
            return best
        return ''.join(sorted(s))

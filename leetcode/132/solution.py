class Solution:
    def minCut(self, s: str) -> int:
        n = len(s)
        palindrome = [bytearray(n) for _ in range(n)]
        pieces = [0] + [n + 1] * n
        for r in range(n):
            for l in range(r + 1):
                if s[l] == s[r] and (r - l < 2 or palindrome[l + 1][r - 1]):
                    palindrome[l][r] = 1
                    pieces[r + 1] = min(pieces[r + 1], pieces[l] + 1)
        return pieces[n] - 1

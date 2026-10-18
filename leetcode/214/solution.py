class Solution:
    def shortestPalindrome(self, s: str) -> str:
        t = s + "#" + s[::-1]
        pi = [0] * len(t)
        for i in range(1, len(t)):
            j = pi[i - 1]
            while j > 0 and t[i] != t[j]:
                j = pi[j - 1]
            if t[i] == t[j]:
                j += 1
            pi[i] = j
        longest = pi[-1]
        return s[longest:][::-1] + s

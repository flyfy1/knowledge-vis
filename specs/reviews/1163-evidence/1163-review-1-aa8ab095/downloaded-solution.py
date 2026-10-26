class Solution:
    def lastSubstring(self, s: str) -> str:
        n = len(s)
        i, j, k = 0, 1, 0
        while j + k < n and i + k < n:
            if s[i + k] == s[j + k]:
                k += 1
            elif s[i + k] < s[j + k]:
                i = i + k + 1
                if i <= j:
                    i = j + 1
                k = 0
            else:
                j = j + k + 1
                if j <= i:
                    j = i + 1
                k = 0
        return s[min(i, j):]

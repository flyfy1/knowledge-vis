class Solution:
    def uniqueLetterString(self, s: str) -> int:
        n = len(s)
        prev = [-1] * n
        nxt = [n] * n
        last = {}
        for i, ch in enumerate(s):
            prev[i] = last.get(ch, -1)
            last[ch] = i
        last = {}
        for i in range(n - 1, -1, -1):
            ch = s[i]
            nxt[i] = last.get(ch, n)
            last[ch] = i
        answer = 0
        for i in range(n):
            answer += (i - prev[i]) * (nxt[i] - i)
        return answer

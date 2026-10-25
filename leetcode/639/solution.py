class Solution:
    def numDecodings(self, s: str) -> int:
        MOD = 1_000_000_007

        def single(c):
            if c == '*':
                return 9
            return int(c != '0')

        def pair(a, b):
            if a == '*' and b == '*':
                return 15  # 11..19 and 21..26
            if a == '*':
                return 2 if b <= '6' else 1
            if b == '*':
                return 9 if a == '1' else 6 if a == '2' else 0
            return int(a != '0' and 10 <= int(a + b) <= 26)

        prev2, prev1 = 1, single(s[0])
        for i in range(1, len(s)):
            current = (single(s[i]) * prev1
                       + pair(s[i - 1], s[i]) * prev2) % MOD
            prev2, prev1 = prev1, current
        return prev1

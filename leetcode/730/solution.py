class Solution:
    def countPalindromicSubsequences(self, s: str) -> int:
        MOD = 1_000_000_007
        n = len(s)
        next_pos = [[n] * 4 for _ in range(n + 1)]
        for i in range(n - 1, -1, -1):
            next_pos[i] = next_pos[i + 1][:]
            next_pos[i][ord(s[i]) - ord('a')] = i
        prev_pos = [[-1] * 4 for _ in range(n)]
        last = [-1] * 4
        for j, ch in enumerate(s):
            last[ord(ch) - ord('a')] = j
            prev_pos[j] = last[:]

        dp = [[0] * n for _ in range(n)]
        for length in range(1, n + 1):
            for i in range(n - length + 1):
                j = i + length - 1
                total = 0
                for c in range(4):
                    left = next_pos[i][c]
                    right = prev_pos[j][c]
                    if left > right:
                        continue
                    if left == right:
                        total += 1
                    else:
                        inner = dp[left + 1][right - 1] if left + 1 <= right - 1 else 0
                        total += 2 + inner
                dp[i][j] = total % MOD
        return dp[0][n - 1]

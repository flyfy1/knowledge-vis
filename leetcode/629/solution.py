class Solution:
    def kInversePairs(self, n: int, k: int) -> int:
        MOD = 1_000_000_007
        if k > n * (n - 1) // 2:
            return 0

        # The empty permutation has zero inverse pairs.
        prev = [0] * (k + 1)
        prev[0] = 1
        for i in range(1, n + 1):
            cur = [0] * (k + 1)
            window = 0
            for j in range(k + 1):
                window += prev[j]
                if j >= i:
                    window -= prev[j - i]
                window %= MOD
                cur[j] = window
            prev = cur
        return prev[k]

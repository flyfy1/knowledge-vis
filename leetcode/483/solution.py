class Solution:
    def smallestGoodBase(self, n: str) -> str:
        N = int(n)
        L = N.bit_length()
        # m is the highest exponent: there are m + 1 ones.
        for m in range(L - 1, 1, -1):
            lo, hi = 2, 1 << ((L + m - 1) // m)
            while lo <= hi:
                k = (lo + hi) // 2
                total = 1
                for _ in range(m):
                    total = total * k + 1
                    if total > N:
                        break
                if total == N:
                    return str(k)
                if total < N:
                    lo = k + 1
                else:
                    hi = k - 1
        # Two ones always work: N = 1 + (N - 1).
        return str(N - 1)

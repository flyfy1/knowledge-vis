class Solution:
    def getPermutation(self, n: int, k: int) -> str:
        factorial = [1] * (n + 1)
        for m in range(1, n + 1):
            factorial[m] = factorial[m - 1] * m

        unused = [str(digit) for digit in range(1, n + 1)]
        prefix = []
        r = k - 1
        for m in range(n, 0, -1):
            block = factorial[m - 1]
            q, r = divmod(r, block)
            prefix.append(unused.pop(q))
        return ''.join(prefix)

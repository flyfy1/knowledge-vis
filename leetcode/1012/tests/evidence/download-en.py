class Solution:
    def numDupDigitsAtMostN(self, n: int) -> int:
        def perm(a, k):
            ways = 1
            for j in range(k):
                ways *= a - j
            return ways

        digits = list(map(int, str(n)))
        length = len(digits)
        unique = 0
        for size in range(1, length):
            unique += 9 * perm(9, size - 1)

        used = set()
        for i, limit in enumerate(digits):
            start = 1 if i == 0 else 0
            for digit in range(start, limit):
                if digit not in used:
                    unique += perm(9 - i, length - i - 1)
            if limit in used:
                return n - unique
            used.add(limit)
        return n - (unique + 1)

from bisect import bisect_left, insort


class Solution:
    def maxSumSubmatrix(self, matrix: list[list[int]], k: int) -> int:
        m, n = len(matrix), len(matrix[0])
        a, b = min(m, n), max(m, n)
        best = float('-inf')
        for top in range(a):
            sums = [0] * b
            for bottom in range(top, a):
                for col in range(b):
                    sums[col] += (matrix[bottom][col] if m <= n
                                  else matrix[col][bottom])
                seen = [0]
                prefix = 0
                for value in sums:
                    prefix += value
                    pos = bisect_left(seen, prefix - k)
                    if pos < len(seen):
                        best = max(best, prefix - seen[pos])
                        if best == k:
                            return k
                    insort(seen, prefix)
        return int(best)

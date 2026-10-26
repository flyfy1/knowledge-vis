class Solution:
    def numSubmatrixSumTarget(self, matrix: list[list[int]], target: int) -> int:
        m, n = len(matrix), len(matrix[0])
        answer = 0
        for top in range(m):
            cols = [0] * n
            for bottom in range(top, m):
                for c in range(n):
                    cols[c] += matrix[bottom][c]
                seen = {0: 1}
                s = 0
                for value in cols:
                    s += value
                    answer += seen.get(s - target, 0)
                    seen[s] = seen.get(s, 0) + 1
        return answer

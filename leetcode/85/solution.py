class Solution:
    def maximalRectangle(self, matrix: list[list[str]]) -> int:
        if not matrix:
            return 0
        cols = len(matrix[0])
        heights = [0] * (cols + 1)
        best = 0
        for row in matrix:
            for c in range(cols):
                heights[c] = heights[c] + 1 if row[c] == "1" else 0
            stack = [-1]
            for i in range(cols + 1):
                while stack[-1] != -1 and heights[stack[-1]] > heights[i]:
                    j = stack.pop()
                    left = stack[-1]
                    width = i - left - 1
                    best = max(best, heights[j] * width)
                stack.append(i)
        return best

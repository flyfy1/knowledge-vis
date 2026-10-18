class Solution:
    def largestRectangleArea(self, heights: list[int]) -> int:
        stack = []
        best = 0
        n = len(heights)
        for i in range(n + 1):
            current = heights[i] if i < n else -1
            while stack and heights[stack[-1]] > current:
                j = stack.pop()
                left = stack[-1] if stack else -1
                width = i - left - 1
                best = max(best, heights[j] * width)
            if i < n:
                stack.append(i)
        return best

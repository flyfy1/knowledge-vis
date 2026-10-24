from collections import deque

class Solution:
    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:
        """Return the maximum of every contiguous window of width k."""
        q: deque[int] = deque()  # indices; values decrease from left to right
        answer: list[int] = []
        for i, value in enumerate(nums):
            while q and q[0] <= i - k:
                q.popleft()
            while q and nums[q[-1]] <= value:
                q.pop()
            q.append(i)
            if i >= k - 1:
                answer.append(nums[q[0]])
        return answer

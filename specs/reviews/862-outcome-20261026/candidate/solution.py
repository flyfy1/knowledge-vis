from collections import deque


class Solution:
    def shortestSubarray(self, nums: list[int], k: int) -> int:
        prefix = [0]
        for value in nums:
            prefix.append(prefix[-1] + value)

        candidates = deque()
        best = len(nums) + 1
        for j, total in enumerate(prefix):
            while candidates and total - prefix[candidates[0]] >= k:
                i = candidates.popleft()
                best = min(best, j - i)
            while candidates and prefix[candidates[-1]] >= total:
                candidates.pop()
            candidates.append(j)

        return best if best <= len(nums) else -1

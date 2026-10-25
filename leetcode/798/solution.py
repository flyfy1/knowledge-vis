class Solution:
    def bestRotation(self, nums: list[int]) -> int:
        n = len(nums)
        diff = [0] * (n + 1)

        def add(left: int, right: int) -> None:
            diff[left] += 1
            diff[right + 1] -= 1

        for i, value in enumerate(nums):
            if value == 0:
                continue
            left = (i - value + 1) % n
            right = i
            if left <= right:
                add(left, right)
            else:
                add(left, n - 1)
                add(0, right)

        bad = 0
        least_bad = n + 1
        answer = 0
        for k in range(n):
            bad += diff[k]
            if bad < least_bad:
                least_bad = bad
                answer = k
        return answer

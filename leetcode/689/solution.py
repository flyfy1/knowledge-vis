class Solution:
    def maxSumOfThreeSubarrays(self, nums: list[int], k: int) -> list[int]:
        n = len(nums)
        m = n - k + 1
        w = [sum(nums[:k])]
        for i in range(1, m):
            w.append(w[-1] - nums[i - 1] + nums[i + k - 1])

        left = [0] * m
        for i in range(1, m):
            left[i] = i if w[i] > w[left[i - 1]] else left[i - 1]

        right = [m - 1] * m
        for i in range(m - 2, -1, -1):
            right[i] = i if w[i] >= w[right[i + 1]] else right[i + 1]

        best_sum = -1
        answer = []
        for j in range(k, m - k):
            candidate = [left[j - k], j, right[j + k]]
            total = sum(w[i] for i in candidate)
            if total > best_sum or (total == best_sum and candidate < answer):
                best_sum = total
                answer = candidate
        return answer

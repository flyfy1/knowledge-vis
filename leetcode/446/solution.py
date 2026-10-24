class Solution:
    def numberOfArithmeticSlices(self, nums: list[int]) -> int:
        dp = [{} for _ in nums]
        answer = 0
        for i in range(len(nums)):
            for j in range(i):
                d = nums[i] - nums[j]
                c = dp[j].get(d, 0)
                answer += c
                dp[i][d] = dp[i].get(d, 0) + c + 1
        return answer

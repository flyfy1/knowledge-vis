from collections import Counter
from math import isqrt


class Solution:
    def numSquarefulPerms(self, nums: list[int]) -> int:
        frequency = Counter(nums)
        values = sorted(frequency)
        counts = [frequency[x] for x in values]
        k = len(values)
        compatible = [[False] * k for _ in range(k)]
        for i in range(k):
            for j in range(k):
                total = values[i] + values[j]
                root = isqrt(total)
                compatible[i][j] = root * root == total

        def dfs(last, left):
            if left == 0:
                return 1
            answer = 0
            for j in range(k):
                if counts[j] == 0:
                    continue
                if last != -1 and not compatible[last][j]:
                    continue
                counts[j] -= 1
                answer += dfs(j, left - 1)
                counts[j] += 1
            return answer

        return dfs(-1, len(nums))

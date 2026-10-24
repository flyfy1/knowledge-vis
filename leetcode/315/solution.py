from typing import List


class Solution:
    def countSmaller(self, nums: List[int]) -> List[int]:
        if not nums:
            return []
        ranks = {value: i + 1 for i, value in enumerate(sorted(set(nums)))}
        bit = [0] * (len(ranks) + 1)

        def add(index: int) -> None:
            while index < len(bit):
                bit[index] += 1
                index += index & -index

        def prefix(index: int) -> int:
            total = 0
            while index:
                total += bit[index]
                index -= index & -index
            return total

        answer = [0] * len(nums)
        for position in range(len(nums) - 1, -1, -1):
            rank = ranks[nums[position]]
            answer[position] = prefix(rank - 1)
            add(rank)
        return answer

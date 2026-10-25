from heapq import heapify, heappop, heappush


class Solution:
    def smallestRange(self, nums: list[list[int]]) -> list[int]:
        heap = [(row[0], i, 0) for i, row in enumerate(nums)]
        heapify(heap)
        current_max = max(row[0] for row in nums)
        best_left, best_right = heap[0][0], current_max

        while True:
            left, row_id, index = heappop(heap)
            if (current_max - left, left) < (best_right - best_left, best_left):
                best_left, best_right = left, current_max
            if index + 1 == len(nums[row_id]):
                return [best_left, best_right]
            successor = nums[row_id][index + 1]
            current_max = max(current_max, successor)
            heappush(heap, (successor, row_id, index + 1))

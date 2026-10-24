from typing import List


class Solution:
    def medianSlidingWindow(self, nums: List[int], k: int) -> List[float]:
        values = sorted(set(nums))
        rank = {value: i for i, value in enumerate(values)}
        size = 1
        while size < len(values):
            size *= 2
        tree = [0] * (2 * size)

        def add(value: int, delta: int) -> None:
            node = size + rank[value]
            tree[node] += delta
            node //= 2
            while node:
                tree[node] = tree[2 * node] + tree[2 * node + 1]
                node //= 2

        def select(r: int) -> int:
            node = 1
            while node < size:
                left_count = tree[2 * node]
                if r <= left_count:
                    node *= 2
                else:
                    r -= left_count
                    node = 2 * node + 1
            return values[node - size]

        answer = []
        for i, value in enumerate(nums):
            if i >= k:
                add(nums[i - k], -1)
            add(value, 1)
            if i >= k - 1:
                a = select((k + 1) // 2)
                b = select((k + 2) // 2)
                answer.append((a + b) / 2.0)
        return answer

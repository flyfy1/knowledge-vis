from typing import List


class Solution:
    def sumCounts(self, nums: List[int]) -> int:
        mod = 10**9 + 7
        n = len(nums)
        total = [0] * (4 * n)
        square = [0] * (4 * n)
        lazy = [0] * (4 * n)

        def apply(node: int, left: int, right: int, k: int) -> None:
            length = right - left + 1
            # Use the old sum before updating it.
            square[node] = (
                square[node] + 2 * k * total[node] + k * k * length
            ) % mod
            total[node] = (total[node] + k * length) % mod
            lazy[node] += k

        def push(node: int, left: int, right: int) -> None:
            k = lazy[node]
            if k:
                mid = (left + right) // 2
                apply(node * 2, left, mid, k)
                apply(node * 2 + 1, mid + 1, right, k)
                lazy[node] = 0

        def add(node: int, left: int, right: int, ql: int, qr: int) -> None:
            if ql <= left and right <= qr:
                apply(node, left, right, 1)
                return

            push(node, left, right)
            mid = (left + right) // 2
            if ql <= mid:
                add(node * 2, left, mid, ql, qr)
            if qr > mid:
                add(node * 2 + 1, mid + 1, right, ql, qr)

            total[node] = (total[node * 2] + total[node * 2 + 1]) % mod
            square[node] = (square[node * 2] + square[node * 2 + 1]) % mod

        last = {}
        answer = 0
        for right, x in enumerate(nums):
            previous = last.get(x, -1)
            add(1, 0, n - 1, previous + 1, right)
            answer = (answer + square[1]) % mod
            last[x] = right

        return answer

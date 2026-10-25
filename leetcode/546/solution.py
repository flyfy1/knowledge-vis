from functools import cache


class Solution:
    def removeBoxes(self, boxes: list[int]) -> int:
        @cache
        def dp(l: int, r: int, k: int) -> int:
            # k extra boxes of color boxes[r] are saved on the right.
            if l > r:
                return 0
            best = dp(l, r - 1, 0) + (k + 1) ** 2
            for m in range(l, r):
                if boxes[m] == boxes[r]:
                    best = max(
                        best,
                        dp(m + 1, r - 1, 0) + dp(l, m, k + 1),
                    )
            return best

        return dp(0, len(boxes) - 1, 0)

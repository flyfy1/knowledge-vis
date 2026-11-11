class Solution:
    def preimageSizeFZF(self, k: int) -> int:
        def zeros(x: int) -> int:
            total = 0
            while x:
                x //= 5
                total += x
            return total

        def first_at_least(target: int) -> int:
            lo, hi = 0, 5 * (target + 1)
            while lo < hi:
                mid = (lo + hi) // 2
                if zeros(mid) < target:
                    lo = mid + 1
                else:
                    hi = mid
            return lo

        return first_at_least(k + 1) - first_at_least(k)

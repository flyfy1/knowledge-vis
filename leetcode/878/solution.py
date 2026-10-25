from math import gcd


class Solution:
    def nthMagicalNumber(self, n: int, a: int, b: int) -> int:
        lcm = (a // gcd(a, b)) * b
        lo, hi = 1, n * min(a, b)
        while lo < hi:
            mid = (lo + hi) // 2
            count = mid // a + mid // b - mid // lcm
            if count < n:
                lo = mid + 1
            else:
                hi = mid
        return lo % 1_000_000_007

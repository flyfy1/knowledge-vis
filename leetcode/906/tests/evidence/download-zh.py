from math import isqrt


class Solution:
    def superpalindromesInRange(self, left: str, right: str) -> int:
        low, high = int(left), int(right)
        limit = isqrt(high)
        count = 0
        for odd in (True, False):
            seed = 1
            while True:
                s = str(seed)
                tail = s[:-1] if odd else s
                root = int(s + tail[::-1])
                if root > limit:
                    break
                square = root * root
                digits = str(square)
                if low <= square <= high and digits == digits[::-1]:
                    count += 1
                seed += 1
        return count

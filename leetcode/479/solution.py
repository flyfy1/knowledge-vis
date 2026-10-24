class Solution:
    def largestPalindrome(self, n: int) -> int:
        if n == 1:
            return 9
        lo, hi = 10 ** (n - 1), 10 ** n - 1
        for length in range(2 * n, 0, -1):
            half = (length + 1) // 2
            for prefix in range(10 ** half - 1, 10 ** (half - 1) - 1, -1):
                s = str(prefix)
                tail = s[:-1] if length % 2 else s
                p = int(s + tail[::-1])
                if p > hi * hi:
                    continue
                x = hi
                while x >= lo and x * x >= p:
                    if p % x == 0 and p // x >= lo:
                        return p % 1337
                    x -= 1
        raise AssertionError("A product palindrome exists for every valid n")

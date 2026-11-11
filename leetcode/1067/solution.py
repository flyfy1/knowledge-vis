class Solution:
    def digitsCount(self, d: int, low: int, high: int) -> int:
        def count_upto(n: int) -> int:
            # How many times digit d is written in 1, 2, ..., n (no leading zeros).
            total = 0
            power = 1  # place value: 1 = ones, 10 = tens, ...
            while power <= n:
                left = n // (power * 10)  # digits to the left of this place
                cur = n // power % 10     # the digit of n at this place
                right = n % power         # digits to the right of this place
                if d == 0:
                    if left == 0:  # this place would hold a leading zero
                        break
                    left -= 1      # the left part must be at least 1
                total += left * power      # complete blocks of 10 * power numbers
                if cur > d:
                    total += power         # the last block passes d completely
                elif cur == d:
                    total += right + 1     # the last block stops inside the d-run
                power *= 10
            return total

        return count_upto(high) - count_upto(low - 1)

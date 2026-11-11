class Solution:
    def atMostNGivenDigitSet(self, digits: list[str], n: int) -> int:
        bound = str(n)
        length = len(bound)
        m = len(digits)
        powers = [1] * (length + 1)
        for r in range(1, length + 1):
            powers[r] = powers[r - 1] * m

        total = 0
        for size in range(1, length):
            total += powers[size]

        for i, current in enumerate(bound):
            smaller = 0
            matched = False
            for digit in digits:
                if digit < current:
                    smaller += 1
                if digit == current:
                    matched = True
            remaining = length - i - 1
            total += smaller * powers[remaining]
            if not matched:
                return total

        return total + 1

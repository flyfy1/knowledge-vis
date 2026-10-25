class Solution:
    def leastOpsExpressTarget(self, x: int, target: int) -> int:
        # Charge every term its joining sign; remove one sign at the end.
        k = 0
        positive = negative = 0
        while target:
            target, digit = divmod(target, x)
            if k == 0:
                # One is x/x: division plus joining sign.
                positive = digit * 2
                negative = (x - digit) * 2
            else:
                next_positive = min(positive + digit * k,
                                    negative + (digit + 1) * k)
                next_negative = min(positive + (x - digit) * k,
                                    negative + (x - digit - 1) * k)
                positive, negative = next_positive, next_negative
            k += 1
        return min(positive, negative + k) - 1

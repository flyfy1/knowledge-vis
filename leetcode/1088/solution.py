class Solution:
    def confusingNumberII(self, n: int) -> int:
        s = str(n)
        L = len(s)
        ok_digits = [0, 1, 6, 8, 9]

        # Part 1 (step 4): count turnable numbers = numbers in 1..n whose every digit can turn.
        turnable = 0
        for length in range(1, L):
            # first digit: 1, 6, 8 or 9; every later digit: any of the 5
            turnable += 4 * 5 ** (length - 1)
        prefix_all_turnable = True
        for i, ch in enumerate(s):
            d = int(ch)
            # Agree with n before position i, go strictly lower here, anything after.
            lower = [v for v in ok_digits if v < d and (i > 0 or v > 0)]
            turnable += len(lower) * 5 ** (L - 1 - i)
            if d not in ok_digits:
                prefix_all_turnable = False
                break  # no turnable number can agree with n through this digit
        if prefix_all_turnable:
            turnable += 1  # n itself is turnable

        # Part 2 (step 5): turnable numbers that turn back into themselves.
        pairs = [("0", "0"), ("1", "1"), ("6", "9"), ("8", "8"), ("9", "6")]

        def build(length):
            # Every digit string of this length that reads the same after turning.
            if length == 0:
                return [""]
            if length == 1:
                return ["0", "1", "8"]
            inner = build(length - 2)  # built once, then wrapped by each of the 5 pairs
            return [a + mid + b for a, b in pairs for mid in inner]

        unchanged = 0
        for length in range(1, L + 1):
            for t in build(length):
                if t[0] != "0" and int(t) <= n:
                    unchanged += 1

        # Step 3: every turnable number is either unchanged or confusing.
        return turnable - unchanged

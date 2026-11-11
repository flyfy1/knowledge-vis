class Solution:
    def calculate(self, s: str) -> int:
        def apply(total, term, op, value):
            # Feed one number (or one finished parenthesis) to the current level.
            if op == "+":
                return total + term, value       # close the old term, open +value
            if op == "-":
                return total + term, -value      # close the old term, open -value
            if op == "*":
                return total, term * value       # extend the open term
            q = abs(term) // abs(value)          # "/" truncates toward zero
            return total, q if (term < 0) == (value < 0) else -q

        total, term, op = 0, 0, "+"              # the expression starts as "0 + ..."
        parked = []                              # outer levels waiting for a ")"
        i, n = 0, len(s)
        while i < n:
            ch = s[i]
            if ch.isdigit():
                value = 0
                while i < n and s[i].isdigit():
                    value = value * 10 + int(s[i])
                    i += 1
                total, term = apply(total, term, op, value)
                continue
            if ch == "(":
                parked.append((total, term, op))
                total, term, op = 0, 0, "+"
            elif ch == ")":
                value = total + term
                total, term, op = parked.pop()
                total, term = apply(total, term, op, value)
            elif ch in "+-*/":
                op = ch
            i += 1
        return total + term

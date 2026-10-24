class Solution:
    def calculate(self, s: str) -> int:
        total, sign = 0, 1
        stack = []
        i = 0
        while i < len(s):
            c = s[i]
            if c.isdigit():
                number = 0
                while i < len(s) and s[i].isdigit():
                    number = number * 10 + int(s[i])
                    i += 1
                total += sign * number
                continue
            if c == '+':
                sign = 1
            elif c == '-':
                sign = -1
            elif c == '(':
                stack.append((total, sign))
                total, sign = 0, 1
            elif c == ')':
                outer_total, outer_sign = stack.pop()
                total = outer_total + outer_sign * total
            i += 1
        return total

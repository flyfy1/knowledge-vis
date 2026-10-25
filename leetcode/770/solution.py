import re


class Solution:
    def basicCalculatorIV(self, expression: str, evalvars: list[str],
                          evalints: list[int]) -> list[str]:
        values = dict(zip(evalvars, evalints))
        tokens = re.findall(r'[a-z]+|\d+|[()+*\-]', expression)
        pos = 0

        def combine(left, right, sign=1):
            result = left.copy()
            for key, coefficient in right.items():
                result[key] = result.get(key, 0) + sign * coefficient
                if result[key] == 0:
                    del result[key]
            return result

        def multiply(left, right):
            result = {}
            for a, ca in left.items():
                for b, cb in right.items():
                    key = tuple(sorted(a + b))
                    result[key] = result.get(key, 0) + ca * cb
                    if result[key] == 0:
                        del result[key]
            return result

        def atom():
            nonlocal pos
            token = tokens[pos]
            pos += 1
            if token == '(':
                result = expr()
                pos += 1  # Consume the matching ')'; input is valid.
                return result
            if token.isdigit() or token in values:
                value = int(token) if token.isdigit() else values[token]
                return {(): value} if value else {}
            return {(token,): 1}

        def term():
            nonlocal pos
            result = atom()
            while pos < len(tokens) and tokens[pos] == '*':
                pos += 1
                result = multiply(result, atom())
            return result

        def expr():
            nonlocal pos
            result = term()
            while pos < len(tokens) and tokens[pos] in ('+', '-'):
                operator = tokens[pos]
                pos += 1
                result = combine(result, term(), 1 if operator == '+' else -1)
            return result

        polynomial = expr()
        keys = sorted(polynomial, key=lambda k: (-len(k), k))
        return ['*'.join((str(polynomial[k]),) + k) for k in keys]

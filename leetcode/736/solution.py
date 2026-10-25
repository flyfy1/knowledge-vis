import re


class Solution:
    def evaluate(self, expression: str) -> int:
        tokens = re.findall(r'\(|\)|[^ ()]+', expression)
        i = 0
        bindings = {}

        def evaluate():
            nonlocal i
            token = tokens[i]
            i += 1
            if token != '(':
                if token[0].islower():
                    return bindings[token][-1]
                return int(token)

            op = tokens[i]
            i += 1
            if op in ('add', 'mult'):
                left = evaluate()
                right = evaluate()
                i += 1  # closing parenthesis
                return left + right if op == 'add' else left * right

            assigned = []
            while True:
                token = tokens[i]
                if not token[0].islower() or tokens[i + 1] == ')':
                    result = evaluate()
                    break
                name = token
                i += 1
                value = evaluate()  # RHS sees previous bindings
                bindings.setdefault(name, []).append(value)
                assigned.append(name)
            i += 1  # closing parenthesis
            for name in reversed(assigned):
                bindings[name].pop()
                if not bindings[name]:
                    del bindings[name]
            return result

        return evaluate()

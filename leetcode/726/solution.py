class Solution:
    def countOfAtoms(self, formula: str) -> str:
        stack = [{}]
        i, n = 0, len(formula)

        def read_count():
            nonlocal i
            start = i
            while i < n and formula[i].isdigit():
                i += 1
            return int(formula[start:i]) if i > start else 1

        while i < n:
            if formula[i] == '(':
                stack.append({})
                i += 1
            elif formula[i] == ')':
                i += 1
                multiplier = read_count()
                child = stack.pop()
                for atom, count in child.items():
                    stack[-1][atom] = stack[-1].get(atom, 0) + count * multiplier
            else:
                start = i
                i += 1
                while i < n and formula[i].islower():
                    i += 1
                atom = formula[start:i]
                count = read_count()
                stack[-1][atom] = stack[-1].get(atom, 0) + count

        return ''.join(atom + (str(count) if count > 1 else '')
                       for atom, count in sorted(stack[0].items()))

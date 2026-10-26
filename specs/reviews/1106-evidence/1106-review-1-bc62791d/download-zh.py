class Solution:
    def parseBoolExpr(self, expression: str) -> bool:
        stack = []
        for char in expression:
            if char == ',':
                continue
            if char != ')':
                stack.append(char)
                continue

            has_true = False
            has_false = False
            while stack[-1] != '(':
                value = stack.pop()
                if value == 't':
                    has_true = True
                else:
                    has_false = True
            stack.pop()  # Remove '('.
            operator = stack.pop()
            if operator == '!':
                result = not has_true
            elif operator == '&':
                result = not has_false
            else:
                result = has_true
            stack.append('t' if result else 'f')

        return stack[0] == 't'

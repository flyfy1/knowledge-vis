class Solution:
    def isNumber(self, s: str) -> bool:
        digit = dot = exp = False
        for i, ch in enumerate(s):
            if '0' <= ch <= '9':
                digit = True
            elif ch in '+-':
                if i != 0 and s[i - 1] not in 'eE':
                    return False
            elif ch == '.':
                if dot or exp:
                    return False
                dot = True
            elif ch in 'eE':
                if exp or not digit:
                    return False
                exp = True
                digit = False
            else:
                return False
        return digit

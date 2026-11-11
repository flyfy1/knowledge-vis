def baseline(expression):
    s = expression
    while ')' in s:
        right = s.index(')')
        left = s.rfind('(', 0, right)
        operator = s[left - 1]
        values = s[left + 1:right].split(',')
        if operator == '!':
            value = values[0] == 'f'
        elif operator == '&':
            value = all(x == 't' for x in values)
        else:
            value = any(x == 't' for x in values)
        s = s[:left - 1] + ('t' if value else 'f') + s[right + 1:]
    return s == 't'

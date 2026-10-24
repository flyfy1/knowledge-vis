def baseline(s):
    s = s.replace(' ', '')
    depth = 0
    for i in range(len(s) - 1, -1, -1):
        c = s[i]
        if c == ')': depth += 1
        elif c == '(': depth -= 1
        elif depth == 0 and c in '+-' and i > 0:
            a, b = baseline(s[:i]), baseline(s[i + 1:])
            return a + b if c == '+' else a - b
    if s[0] == '-': return -baseline(s[1:])
    if s[0] == '(': return baseline(s[1:-1])
    return int(s)

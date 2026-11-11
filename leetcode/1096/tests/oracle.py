"""Independent innermost textual substitution; no U/T parser."""
def baseline(expression):
    words = set()

    def visit(s):
        if "}" not in s:
            words.add(s)
            return
        right = s.index("}")
        left = s.rfind("{", 0, right)
        for part in s[left + 1:right].split(","):
            visit(s[:left] + part + s[right + 1:])

    visit(expression)
    return sorted(words)

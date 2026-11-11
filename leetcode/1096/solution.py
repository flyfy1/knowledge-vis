class Solution:
    def braceExpansionII(self, expression: str) -> list[str]:
        i = 0
        n = len(expression)

        def parse() -> set[str]:
            nonlocal i
            union = set()
            term = {""}
            while i < n and expression[i] != "}":
                if expression[i] == ",":
                    union.update(term)
                    term = {""}
                    i += 1
                else:
                    if expression[i] == "{":
                        i += 1
                        atom = parse()
                        i += 1  # Consume the child's closing brace.
                    else:
                        atom = {expression[i]}
                        i += 1
                    term = {left + right for left in term for right in atom}
            return union | term

        return sorted(parse())

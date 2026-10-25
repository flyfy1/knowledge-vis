class Solution:
    def isValid(self, code: str) -> bool:
        stack = []
        i, n = 0, len(code)
        while i < n:
            # Only the first opening tag may occur outside the root.
            if i > 0 and not stack:
                return False
            if code.startswith("<![CDATA[", i):
                if not stack:
                    return False
                j = code.find("]]>", i + 9)
                if j == -1:
                    return False
                i = j + 3
            elif code[i] == "<":
                closing = code.startswith("</", i)
                start = i + (2 if closing else 1)
                j = code.find(">", start)
                if j == -1:
                    return False
                name = code[start:j]
                if not 1 <= len(name) <= 9 or any(
                    not "A" <= ch <= "Z" for ch in name
                ):
                    return False
                if closing:
                    if not stack or stack[-1] != name:
                        return False
                    stack.pop()
                else:
                    stack.append(name)
                i = j + 1
            else:
                if not stack:
                    return False
                i += 1
        return n > 0 and not stack

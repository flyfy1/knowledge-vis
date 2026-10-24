from typing import List

class Solution:
    def removeInvalidParentheses(self, s: str) -> List[str]:
        ans = set()
        def remove(text: str, scan: int, last: int, pair: tuple[str, str]) -> None:
            balance = 0
            for i in range(scan, len(text)):
                if text[i] == pair[0]:
                    balance += 1
                elif text[i] == pair[1]:
                    balance -= 1
                if balance >= 0:
                    continue
                for j in range(last, i + 1):
                    if text[j] == pair[1] and (j == last or text[j - 1] != pair[1]):
                        remove(text[:j] + text[j + 1:], i, j, pair)
                return
            reversed_text = text[::-1]
            if pair[0] == '(':
                remove(reversed_text, 0, 0, (')', '('))
            else:
                ans.add(reversed_text)
        remove(s, 0, 0, ('(', ')'))
        return list(ans)

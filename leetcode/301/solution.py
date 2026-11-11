from typing import List

class Solution:
    def removeInvalidParentheses(self, s: str) -> List[str]:
        # 1. Walk the balance once: every dip below 0 forces one ")" deletion,
        #    and every "(" still open at the end forces one "(" deletion.
        left_rem = right_rem = 0
        for ch in s:
            if ch == '(':
                left_rem += 1
            elif ch == ')':
                if left_rem > 0:
                    left_rem -= 1
                else:
                    right_rem += 1

        answers = set()
        path = []

        # 2. Decide keep/delete for each character, spending exactly that budget.
        def dfs(i: int, balance: int, left_rem: int, right_rem: int) -> None:
            if left_rem + right_rem > len(s) - i:
                return  # not enough characters left to spend the budget
            if i == len(s):
                if balance == 0:
                    answers.add(''.join(path))  # a set: equal strings collapse
                return
            ch = s[i]
            if ch == '(' and left_rem > 0:
                dfs(i + 1, balance, left_rem - 1, right_rem)    # delete "("
            if ch == ')' and right_rem > 0:
                dfs(i + 1, balance, left_rem, right_rem - 1)    # delete ")"
            if ch == ')' and balance == 0:
                return  # keeping it would make this prefix invalid
            path.append(ch)                                     # keep ch
            step = 1 if ch == '(' else -1 if ch == ')' else 0
            dfs(i + 1, balance + step, left_rem, right_rem)
            path.pop()

        dfs(0, 0, left_rem, right_rem)
        return list(answers)

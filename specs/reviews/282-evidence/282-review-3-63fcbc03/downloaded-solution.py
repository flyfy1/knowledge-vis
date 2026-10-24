from typing import List

class Solution:
    def addOperators(self, num: str, target: int) -> List[str]:
        answer: List[str] = []

        def dfs(index: int, expression: str, value: int, last: int) -> None:
            if index == len(num):
                if value == target:
                    answer.append(expression)
                return
            for end in range(index, len(num)):
                if end > index and num[index] == '0':
                    break
                token = num[index:end + 1]
                current = int(token)
                if index == 0:
                    dfs(end + 1, token, current, current)
                else:
                    dfs(end + 1, expression + '+' + token, value + current, current)
                    dfs(end + 1, expression + '-' + token, value - current, -current)
                    repaired = value - last + last * current
                    dfs(end + 1, expression + '*' + token, repaired, last * current)

        dfs(0, '', 0, 0)
        return answer

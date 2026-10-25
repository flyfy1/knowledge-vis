from fractions import Fraction


class Solution:
    def judgePoint24(self, cards: list[int]) -> bool:
        def search(values):
            if len(values) == 1:
                return values[0] == 24
            for i in range(len(values)):
                for j in range(i + 1, len(values)):
                    a, b = values[i], values[j]
                    rest = [v for k, v in enumerate(values) if k not in (i, j)]
                    candidates = {a + b, a * b, a - b, b - a}
                    if b != 0:
                        candidates.add(a / b)
                    if a != 0:
                        candidates.add(b / a)
                    for value in candidates:
                        if search(rest + [value]):
                            return True
            return False

        return search([Fraction(card) for card in cards])

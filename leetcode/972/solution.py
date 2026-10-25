from fractions import Fraction


class Solution:
    def isRationalEqual(self, s: str, t: str) -> bool:
        def value(text: str) -> Fraction:
            integer, dot, rest = text.partition('.')
            finite, opening, repeating = rest.partition('(')
            scale = 10 ** len(finite)
            result = Fraction(int(integer), 1)
            result += Fraction(int(finite or '0'), scale)
            if opening:
                block = repeating[:-1]
                result += Fraction(int(block), scale * (10 ** len(block) - 1))
            return result

        return value(s) == value(t)

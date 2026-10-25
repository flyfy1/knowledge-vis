from bisect import bisect_left, bisect_right


class RangeModule:
    def __init__(self):
        self.points = []

    def addRange(self, left: int, right: int) -> None:
        i = bisect_left(self.points, left)
        j = bisect_right(self.points, right)
        replacement = ([left] if i % 2 == 0 else [])
        replacement += ([right] if j % 2 == 0 else [])
        self.points[i:j] = replacement

    def queryRange(self, left: int, right: int) -> bool:
        a = bisect_right(self.points, left)
        b = bisect_left(self.points, right)
        return a == b and a % 2 == 1

    def removeRange(self, left: int, right: int) -> None:
        i = bisect_left(self.points, left)
        j = bisect_right(self.points, right)
        replacement = ([left] if i % 2 == 1 else [])
        replacement += ([right] if j % 2 == 1 else [])
        self.points[i:j] = replacement

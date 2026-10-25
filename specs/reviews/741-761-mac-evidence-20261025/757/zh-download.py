class Solution:
    def intersectionSizeTwo(self, intervals: list[list[int]]) -> int:
        ordered = sorted(intervals, key=lambda interval: (interval[1], -interval[0]))
        p = q = -1
        size = 0
        for l, r in ordered:
            if l > q:
                p, q = r - 1, r
                size += 2
            elif l > p:
                p, q = q, r
                size += 1
        return size

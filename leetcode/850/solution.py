class Solution:
    def rectangleArea(self, rectangles: list[list[int]]) -> int:
        xs = sorted({x for x1, _, x2, _ in rectangles for x in (x1, x2)})
        area = 0
        for left, right in zip(xs, xs[1:]):
            intervals = []
            for x1, y1, x2, y2 in rectangles:
                if x1 <= left and right <= x2:
                    intervals.append((y1, y2))
            intervals.sort()
            height = 0
            end = -1
            for lo, hi in intervals:
                if lo > end:
                    height += hi - lo
                    end = hi
                elif hi > end:
                    height += hi - end
                    end = hi
            area += (right - left) * height
        return area % 1_000_000_007

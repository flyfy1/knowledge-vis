class Solution:
    def isRectangleCover(self, rectangles: list[list[int]]) -> bool:
        min_x = min_y = float('inf')
        max_x = max_y = float('-inf')
        area = 0
        corners = set()
        for x, y, a, b in rectangles:
            min_x, min_y = min(min_x, x), min(min_y, y)
            max_x, max_y = max(max_x, a), max(max_y, b)
            area += (a - x) * (b - y)
            for point in ((x, y), (x, b), (a, y), (a, b)):
                if point in corners:
                    corners.remove(point)
                else:
                    corners.add(point)
        expected = {(min_x, min_y), (min_x, max_y),
                    (max_x, min_y), (max_x, max_y)}
        return area == (max_x - min_x) * (max_y - min_y) and corners == expected

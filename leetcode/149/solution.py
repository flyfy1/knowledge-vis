from math import gcd


class Solution:
    def maxPoints(self, points: list[list[int]]) -> int:
        best = 1
        for i, (x, y) in enumerate(points):
            counts = {}
            for j in range(i + 1, len(points)):
                dx = points[j][0] - x
                dy = points[j][1] - y
                g = gcd(abs(dx), abs(dy))
                dx //= g
                dy //= g
                if dx < 0 or (dx == 0 and dy < 0):
                    dx, dy = -dx, -dy
                key = (dy, dx)
                counts[key] = counts.get(key, 0) + 1
                best = max(best, counts[key] + 1)
        return best

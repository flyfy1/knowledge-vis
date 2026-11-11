from collections import deque


class Solution:
    def isEscapePossible(self, blocked: list[list[int]], source: list[int], target: list[int]) -> bool:
        walls = {tuple(cell) for cell in blocked}
        limit = len(walls) ** 2
        side = 10 ** 6

        def escapes(start, goal):
            start, goal = tuple(start), tuple(goal)
            seen = {start}
            queue = deque([start])
            while queue and len(seen) <= limit:
                x, y = queue.popleft()
                if (x, y) == goal:
                    return True
                for dx, dy in ((1, 0), (0, 1), (-1, 0), (0, -1)):
                    cell = (x + dx, y + dy)
                    if (0 <= cell[0] < side and 0 <= cell[1] < side
                            and cell not in walls and cell not in seen):
                        seen.add(cell)
                        queue.append(cell)
            return len(seen) > limit

        return escapes(source, target) and escapes(target, source)

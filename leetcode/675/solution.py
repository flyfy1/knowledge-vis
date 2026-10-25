from collections import deque


class Solution:
    def cutOffTree(self, forest: list[list[int]]) -> int:
        rows, cols = len(forest), len(forest[0])
        trees = sorted((height, r, c)
                       for r, row in enumerate(forest)
                       for c, height in enumerate(row) if height > 1)
        if forest[0][0] == 0:
            return -1

        def distance(sr, sc, tr, tc):
            queue = deque([(sr, sc, 0)])
            seen = {(sr, sc)}
            while queue:
                r, c, steps = queue.popleft()
                if (r, c) == (tr, tc):
                    return steps
                for nr, nc in ((r - 1, c), (r + 1, c),
                               (r, c - 1), (r, c + 1)):
                    if (0 <= nr < rows and 0 <= nc < cols
                            and forest[nr][nc] > 0
                            and (nr, nc) not in seen):
                        seen.add((nr, nc))
                        queue.append((nr, nc, steps + 1))
            return -1

        total = 0
        sr = sc = 0
        for _, tr, tc in trees:
            steps = distance(sr, sc, tr, tc)
            if steps == -1:
                return -1
            total += steps
            sr, sc = tr, tc
        return total

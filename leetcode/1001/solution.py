from collections import Counter


class Solution:
    def gridIllumination(self, n: int, lamps: list[list[int]], queries: list[list[int]]) -> list[int]:
        active = set(map(tuple, lamps))
        rows, cols, down, up = Counter(), Counter(), Counter(), Counter()
        for r, c in active:
            rows[r] += 1
            cols[c] += 1
            down[r - c] += 1
            up[r + c] += 1

        ans = []
        for r, c in queries:
            ans.append(int(rows[r] > 0 or cols[c] > 0 or
                           down[r - c] > 0 or up[r + c] > 0))
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    x, y = r + dr, c + dc
                    if (x, y) in active:
                        active.remove((x, y))
                        for counter, key in ((rows, x), (cols, y),
                                             (down, x - y), (up, x + y)):
                            counter[key] -= 1
                            if counter[key] == 0:
                                del counter[key]
        return ans

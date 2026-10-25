from collections import deque


class Solution:
    def slidingPuzzle(self, board: list[list[int]]) -> int:
        start = "".join(str(value) for row in board for value in row)
        neighbors = ((1, 3), (0, 2, 4), (1, 5), (0, 4), (1, 3, 5), (2, 4))
        queue = deque([(start, 0)])
        seen = {start}
        while queue:
            state, moves = queue.popleft()
            if state == "123450":
                return moves
            zero = state.index("0")
            for other in neighbors[zero]:
                tiles = list(state)
                tiles[zero], tiles[other] = tiles[other], tiles[zero]
                nxt = "".join(tiles)
                if nxt not in seen:
                    seen.add(nxt)
                    queue.append((nxt, moves + 1))
        return -1

from typing import List


class Solution:
    def solveSudoku(self, board: List[List[str]]) -> None:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        empty = []
        for r in range(9):
            for c in range(9):
                if board[r][c] == ".":
                    empty.append((r, c))
                else:
                    value = board[r][c]
                    rows[r].add(value)
                    cols[c].add(value)
                    boxes[(r // 3) * 3 + c // 3].add(value)

        def search(pos):
            if pos == len(empty):
                return True
            r, c = empty[pos]
            box = (r // 3) * 3 + c // 3
            for value in "123456789":
                if value in rows[r] or value in cols[c] or value in boxes[box]:
                    continue
                board[r][c] = value
                rows[r].add(value)
                cols[c].add(value)
                boxes[box].add(value)
                if search(pos + 1):
                    return True
                board[r][c] = "."
                rows[r].remove(value)
                cols[c].remove(value)
                boxes[box].remove(value)
            return False

        search(0)

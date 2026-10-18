class Solution:
    def totalNQueens(self, n: int) -> int:
        cols, down, up = set(), set(), set()
        count = 0

        def search(r: int) -> None:
            nonlocal count
            if r == n:
                count += 1
                return
            for c in range(n):
                if c in cols or r - c in down or r + c in up:
                    continue
                cols.add(c)
                down.add(r - c)
                up.add(r + c)
                search(r + 1)
                cols.remove(c)
                down.remove(r - c)
                up.remove(r + c)

        search(0)
        return count

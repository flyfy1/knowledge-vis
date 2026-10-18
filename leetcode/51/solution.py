class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        answers = []
        placement = []
        cols, down, up = set(), set(), set()

        def search(r):
            if r == n:
                answers.append([
                    "." * c + "Q" + "." * (n - c - 1)
                    for c in placement
                ])
                return
            for c in range(n):
                if c in cols or r - c in down or r + c in up:
                    continue
                placement.append(c)
                cols.add(c)
                down.add(r - c)
                up.add(r + c)
                search(r + 1)
                placement.pop()
                cols.remove(c)
                down.remove(r - c)
                up.remove(r + c)

        search(0)
        return answers

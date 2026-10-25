class Solution:
    def movesToChessboard(self, board: list[list[int]]) -> int:
        n = len(board)
        # Every row must equal the first row or its complement.
        for i in range(n):
            for j in range(n):
                if board[0][0] ^ board[i][0] ^ board[0][j] ^ board[i][j]:
                    return -1

        def axis_cost(get_bit):
            ones = sum(get_bit(i) for i in range(n))
            best = n
            for start in (0, 1):
                # Alternating target starts with this bit.
                if ones != n // 2 + (start if n % 2 else 0):
                    continue
                mismatches = sum(
                    get_bit(i) != (start ^ (i % 2)) for i in range(n)
                )
                best = min(best, mismatches // 2)
            return -1 if best == n else best

        rows = axis_cost(lambda i: board[i][0])
        cols = axis_cost(lambda j: board[0][j])
        if rows == -1 or cols == -1:
            return -1
        return rows + cols

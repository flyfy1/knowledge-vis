from functools import cache


class Solution:
    def findMinStep(self, board: str, hand: str) -> int:
        def collapse(row):
            # Reach a stable row before the next player move.
            while True:
                i = 0
                while i < len(row):
                    j = i + 1
                    while j < len(row) and row[j] == row[i]:
                        j += 1
                    if j - i >= 3:
                        row = row[:i] + row[j:]
                        break
                    i = j
                else:
                    return row

        impossible = 6  # At most five balls can be spent.

        @cache
        def solve(row, remaining):
            if not row:
                return 0
            if not remaining:
                return impossible
            # Every surviving color must eventually form a run of at least 3.
            for color in set(row):
                if row.count(color) + remaining.count(color) < 3:
                    return impossible
            best = impossible
            for k, color in enumerate(remaining):
                if k and remaining[k - 1] == color:
                    continue  # Identical hand balls have identical choices.
                rest = remaining[:k] + remaining[k + 1:]
                for gap in range(len(row) + 1):
                    if gap and row[gap - 1] == color:
                        continue  # Same string as inserting earlier in this run.
                    after = collapse(row[:gap] + color + row[gap:])
                    best = min(best, 1 + solve(after, rest))
                    if best == 1:
                        return best  # A nonempty row needs at least one move.
            return best

        answer = solve(board, ''.join(sorted(hand)))
        return -1 if answer == impossible else answer

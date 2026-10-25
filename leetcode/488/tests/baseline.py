from collections import deque
import re


def baseline(board, hand):
    queue = deque([(board, hand, 0)])
    while queue:
        row, remaining, used = queue.popleft()
        if not row:
            return used
        for k, color in enumerate(remaining):
            for gap in range(len(row) + 1):
                after = row[:gap] + color + row[gap:]
                while True:
                    reduced = re.sub(r'(.)\1{2,}', '', after)
                    if reduced == after:
                        break
                    after = reduced
                rest = remaining[:k] + remaining[k + 1:]
                queue.append((after, rest, used + 1))
    return -1

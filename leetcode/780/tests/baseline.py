from collections import deque


def baseline(sx, sy, tx, ty):
    if sx > tx or sy > ty:
        return False
    queue = deque([(sx, sy)])
    seen = {(sx, sy)}
    while queue:
        x, y = queue.popleft()
        if (x, y) == (tx, ty):
            return True
        for a, b in ((x + y, y), (x, x + y)):
            if a <= tx and b <= ty and (a, b) not in seen:
                seen.add((a, b))
                queue.append((a, b))
    return False

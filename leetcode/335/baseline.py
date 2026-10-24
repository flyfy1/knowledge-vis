def turn(a, b, c):
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])

def intersects(a, b, c, d):
    boxes_overlap = all(
        max(min(a[k], b[k]), min(c[k], d[k])) <=
        min(max(a[k], b[k]), max(c[k], d[k]))
        for k in (0, 1)
    )
    return (boxes_overlap and turn(a, b, c) * turn(a, b, d) <= 0
            and turn(c, d, a) * turn(c, d, b) <= 0)



def first_crossing(distance):
    """Coordinate oracle: first (new, old) nonadjacent intersecting pair, or None."""
    points = [(0, 0)]
    directions = [(0, 1), (-1, 0), (0, -1), (1, 0)]
    for i, length in enumerate(distance):
        dx, dy = directions[i % 4]
        a = points[-1]
        b = (a[0] + dx * length, a[1] + dy * length)
        for j in range(i - 1):
            if intersects(a, b, points[j], points[j + 1]):
                return i, j
        points.append(b)
    return None

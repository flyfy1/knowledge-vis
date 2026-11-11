"""Independent oracle for #759: mark every unit cell [t, t+1) between the earliest start and
the latest end as busy or free, then report maximal free runs. Integer endpoints only."""


def oracle(schedule):
    busy = [(s, e) for person in schedule for s, e in person]
    lo, hi = min(s for s, _ in busy), max(e for _, e in busy)
    free_cell = [not any(s <= t < e for s, e in busy) for t in range(lo, hi)]
    runs, t = [], 0
    while t < len(free_cell):
        if free_cell[t]:
            u = t
            while u < len(free_cell) and free_cell[u]:
                u += 1
            runs.append([lo + t, lo + u])
            t = u
        else:
            t += 1
    return runs


def piece_oracle(schedule):
    """Coordinate-compressed variant for large times: test each piece between consecutive endpoints."""
    busy = [(s, e) for person in schedule for s, e in person]
    points = sorted({p for iv in busy for p in iv})
    runs = []
    for a, b in zip(points, points[1:]):
        if not any(s <= a and b <= e for s, e in busy):
            if runs and runs[-1][1] == a:
                runs[-1][1] = b
            else:
                runs.append([a, b])
    return runs

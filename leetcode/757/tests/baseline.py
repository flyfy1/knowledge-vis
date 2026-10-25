from itertools import combinations

def exhaustive(intervals):
    lo = min(l for l, r in intervals)
    hi = max(r for l, r in intervals)
    for size in range(hi - lo + 2):
        for points in combinations(range(lo, hi + 1), size):
            if all(sum(l <= x <= r for x in points) >= 2
                   for l, r in intervals):
                return size

from itertools import combinations


def baseline(quality, wage, k):
    best = float('inf')
    for group in combinations(range(len(quality)), k):
        rate = max(wage[i] / quality[i] for i in group)
        total = sum(quality[i] for i in group)
        best = min(best, rate * total)
    return best

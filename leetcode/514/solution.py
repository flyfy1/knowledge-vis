class Solution:
    def findRotateSteps(self, ring: str, key: str) -> int:
        n = len(ring)
        previous = {0: 0}
        for char in key:
            current = {}
            for target, letter in enumerate(ring):
                if letter != char:
                    continue
                best = float("inf")
                for source, cost in previous.items():
                    gap = abs(target - source)
                    distance = min(gap, n - gap)
                    best = min(best, cost + distance + 1)
                current[target] = best
            previous = current
        return min(previous.values())

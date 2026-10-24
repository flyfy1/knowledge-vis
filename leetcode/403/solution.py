class Solution:
    def canCross(self, stones: list[int]) -> bool:
        reachable = {x: set() for x in stones}
        reachable[0].add(0)
        for x in stones:
            for k in reachable[x]:
                for jump in (k - 1, k, k + 1):
                    target = x + jump
                    if jump > 0 and target in reachable:
                        reachable[target].add(jump)
        return bool(reachable[stones[-1]])

import random


class Solution:
    def __init__(self, n: int, blacklist: list[int]):
        self.m = n - len(blacklist)
        blocked = set(blacklist)
        self.remap = {}
        high = self.m
        for value in blacklist:
            if value < self.m:
                while high in blocked:
                    high += 1
                self.remap[value] = high
                high += 1

    def pick(self) -> int:
        k = random.randrange(self.m)
        return self.remap.get(k, k)

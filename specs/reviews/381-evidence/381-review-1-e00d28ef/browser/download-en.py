import random


class RandomizedCollection:
    def __init__(self):
        self.nums = []
        self.pos = {}

    def insert(self, val: int) -> bool:
        fresh = val not in self.pos
        if fresh:
            self.pos[val] = set()
        self.pos[val].add(len(self.nums))
        self.nums.append(val)
        return fresh

    def remove(self, val: int) -> bool:
        if val not in self.pos:
            return False
        i = self.pos[val].pop()
        j = len(self.nums) - 1
        last = self.nums[j]
        if i != j:
            self.nums[i] = last
            self.pos[last].remove(j)
            self.pos[last].add(i)
        self.nums.pop()
        if not self.pos[val]:
            del self.pos[val]
        return True

    def getRandom(self) -> int:
        return self.nums[random.randrange(len(self.nums))]

import heapq

class DinnerPlates:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.stacks = []
        self.free = []
        self.free_set = set()

    def _add_free(self, i: int) -> None:
        if i < len(self.stacks) and len(self.stacks[i]) < self.capacity and i not in self.free_set:
            heapq.heappush(self.free, i)
            self.free_set.add(i)

    def push(self, val: int) -> None:
        while self.free and (self.free[0] >= len(self.stacks) or len(self.stacks[self.free[0]]) >= self.capacity):
            self.free_set.discard(heapq.heappop(self.free))
        if not self.free:
            self.stacks.append([])
            i = len(self.stacks) - 1
        else:
            i = heapq.heappop(self.free)
            self.free_set.remove(i)
        self.stacks[i].append(val)
        self._add_free(i)

    def pop(self) -> int:
        while self.stacks and not self.stacks[-1]:
            self.stacks.pop()
        if not self.stacks:
            return -1
        i = len(self.stacks) - 1
        value = self.stacks[i].pop()
        self._add_free(i)
        return value

    def popAtStack(self, index: int) -> int:
        if index < 0 or index >= len(self.stacks) or not self.stacks[index]:
            return -1
        value = self.stacks[index].pop()
        self._add_free(index)
        return value

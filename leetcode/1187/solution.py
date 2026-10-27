from bisect import bisect_right
from typing import List

class Solution:
    def makeArrayIncreasing(self, arr1: List[int], arr2: List[int]) -> int:
        choices = sorted(set(arr2))
        states = {-1: 0}
        for value in arr1:
            next_states = {}
            for previous, operations in states.items():
                if value > previous:
                    next_states[value] = min(next_states.get(value, 10**9), operations)
                j = bisect_right(choices, previous)
                if j < len(choices):
                    replacement = choices[j]
                    next_states[replacement] = min(next_states.get(replacement, 10**9), operations + 1)
            states = next_states
            if not states:
                return -1
        return min(states.values(), default=-1)

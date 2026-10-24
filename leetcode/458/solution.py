class Solution:
    def poorPigs(self, buckets: int, minutesToDie: int, minutesToTest: int) -> int:
        rounds = minutesToTest // minutesToDie
        states = rounds + 1
        pigs = 0
        capacity = 1
        while capacity < buckets:
            capacity *= states
            pigs += 1
        return pigs

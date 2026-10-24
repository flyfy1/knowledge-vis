class Solution:
    def getMaxRepetitions(self, s1: str, n1: int, s2: str, n2: int) -> int:
        j = count = block = 0
        seen = {0: (0, 0)}
        jumped = False
        while block < n1:
            for ch in s1:
                if ch == s2[j]:
                    j += 1
                    if j == len(s2):
                        j = 0
                        count += 1
            block += 1
            if not jumped:
                if j in seen:
                    old_block, old_count = seen[j]
                    cycle_blocks = block - old_block
                    cycle_gain = count - old_count
                    repeats = (n1 - block) // cycle_blocks
                    block += repeats * cycle_blocks
                    count += repeats * cycle_gain
                    jumped = True
                else:
                    seen[j] = (block, count)
        return count // n2

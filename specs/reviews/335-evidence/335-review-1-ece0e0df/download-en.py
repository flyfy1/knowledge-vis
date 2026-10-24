class Solution:
    def isSelfCrossing(self, distance: list[int]) -> bool:
        x = distance
        for i in range(3, len(x)):
            # A: current segment meets the segment three moves back.
            if x[i] >= x[i - 2] and x[i - 1] <= x[i - 3]:
                return True
            # B: parallel sides touch or overlap, four moves apart.
            if i >= 4 and x[i - 1] == x[i - 3] and x[i] + x[i - 4] >= x[i - 2]:
                return True
            # C: the inward turn reaches the segment five moves back.
            if (i >= 5 and x[i - 2] >= x[i - 4]
                    and x[i] + x[i - 4] >= x[i - 2]
                    and x[i - 1] <= x[i - 3]
                    and x[i - 1] + x[i - 5] >= x[i - 3]):
                return True
        return False

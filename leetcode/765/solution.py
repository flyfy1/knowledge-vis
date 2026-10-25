class Solution:
    def minSwapsCouples(self, row: list[int]) -> int:
        pos = [0] * len(row)
        for seat, person in enumerate(row):
            pos[person] = seat

        swaps = 0
        for i in range(0, len(row), 2):
            partner = row[i] ^ 1
            if row[i + 1] == partner:
                continue
            j = pos[partner]
            displaced = row[i + 1]
            row[i + 1], row[j] = row[j], row[i + 1]
            pos[partner] = i + 1
            pos[displaced] = j
            swaps += 1
        return swaps

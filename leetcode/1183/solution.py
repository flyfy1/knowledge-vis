class Solution:
    def maximumNumberOfOnes(self, width: int, height: int, sideLength: int, maxOnes: int) -> int:
        s = sideLength
        sizes = []
        # Cell (r, c) belongs to class (r % s, c % s). Every s x s window holds
        # exactly one cell of each class, so we may fill maxOnes whole classes.
        for a in range(s):
            rows = (height - a + s - 1) // s   # rows r < height with r % s == a
            for b in range(s):
                cols = (width - b + s - 1) // s   # columns c < width with c % s == b
                sizes.append(rows * cols)
        sizes.sort(reverse=True)
        return sum(sizes[:maxOnes])

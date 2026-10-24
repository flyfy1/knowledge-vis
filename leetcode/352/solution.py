class SummaryRanges:
    def __init__(self):
        self.intervals = []

    def addNum(self, value: int) -> None:
        intervals = self.intervals
        lo, hi = 0, len(intervals)
        # Find the first interval whose start is at least value.
        while lo < hi:
            mid = (lo + hi) // 2
            if intervals[mid][0] < value:
                lo = mid + 1
            else:
                hi = mid
        p = lo
        if p > 0 and intervals[p - 1][1] >= value:
            return  # Already covered by the predecessor.

        start = end = value
        first = last = p
        if p > 0 and intervals[p - 1][1] + 1 == value:
            first = p - 1
            start = intervals[first][0]
        if p < len(intervals) and intervals[p][0] <= value + 1:
            end = intervals[p][1]
            last = p + 1
        # Replace zero, one, or two old intervals with one maximal interval.
        intervals[first:last] = [[start, end]]

    def getIntervals(self) -> list[list[int]]:
        return [interval[:] for interval in self.intervals]

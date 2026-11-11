import math


class Solution:
    def minmaxGasDist(self, stations: list[int], k: int) -> float:
        gaps = [right - left for left, right in zip(stations, stations[1:])]

        def needed(limit: float) -> int:
            # A gap of length g needs ceil(g / limit) - 1 new stations
            # before every piece inside it is at most limit long.
            return sum(math.ceil(gap / limit) - 1 for gap in gaps)

        lo, hi = 0.0, float(max(gaps))  # lo fails (or is 0); hi always works
        while hi - lo > 1e-6:
            mid = (lo + hi) / 2
            if needed(mid) <= k:
                hi = mid
            else:
                lo = mid
        return hi

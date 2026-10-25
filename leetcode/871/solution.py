from heapq import heappush, heappop


class Solution:
    def minRefuelStops(self, target: int, startFuel: int, stations: list[list[int]]) -> int:
        reach = startFuel
        stops = 0
        i = 0
        heap = []
        while reach < target:
            while i < len(stations) and stations[i][0] <= reach:
                heappush(heap, -stations[i][1])
                i += 1
            if not heap:
                return -1
            reach -= heappop(heap)
            stops += 1
        return stops

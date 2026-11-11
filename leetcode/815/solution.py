from collections import defaultdict, deque


class Solution:
    def numBusesToDestination(self, routes: list[list[int]], source: int, target: int) -> int:
        if source == target:
            return 0

        by_stop = defaultdict(list)
        for bus, stops in enumerate(routes):
            for stop in stops:
                by_stop[stop].append(bus)

        queue = deque([(source, 0)])
        seen_stops = {source}
        used_routes = set()
        while queue:
            stop, buses = queue.popleft()
            for bus in by_stop[stop]:
                if bus in used_routes:
                    continue
                used_routes.add(bus)
                for nxt in routes[bus]:
                    if nxt in seen_stops:
                        continue
                    if nxt == target:
                        return buses + 1
                    seen_stops.add(nxt)
                    queue.append((nxt, buses + 1))
        return -1

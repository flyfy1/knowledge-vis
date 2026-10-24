from typing import List


class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:
        graph = {}
        for origin, destination in tickets:
            graph.setdefault(origin, []).append(destination)
        for destinations in graph.values():
            destinations.sort(reverse=True)

        stack = ["JFK"]
        finished = []
        while stack:
            origin = stack[-1]
            if graph.get(origin):
                stack.append(graph[origin].pop())
            else:
                finished.append(stack.pop())
        return finished[::-1]

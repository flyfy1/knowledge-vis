from heapq import heappop, heappush


class Solution:
    def getSkyline(self, buildings: list[list[int]]) -> list[list[int]]:
        xs = sorted({x for left, right, _ in buildings for x in (left, right)})
        heap = []  # (-height, right); expired entries may remain below the root
        answer = []
        i = 0
        for x in xs:
            # Insert every building that has started, before reading this x.
            while i < len(buildings) and buildings[i][0] <= x:
                left, right, height = buildings[i]
                heappush(heap, (-height, right))
                i += 1
            # Only the root can determine the visible height.
            while heap and heap[0][1] <= x:
                heappop(heap)
            height = -heap[0][0] if heap else 0
            if not answer or answer[-1][1] != height:
                answer.append([x, height])
        return answer

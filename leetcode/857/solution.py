from typing import List
import heapq


class Solution:
    def mincostToHireWorkers(self, quality: List[int], wage: List[int], k: int) -> float:
        workers = sorted((w / q, q) for q, w in zip(quality, wage))
        heap = []
        quality_sum = 0
        best = float('inf')
        for rate, q in workers:
            heapq.heappush(heap, -q)
            quality_sum += q
            if len(heap) > k:
                quality_sum += heapq.heappop(heap)
            if len(heap) == k:
                best = min(best, rate * quality_sum)
        return best

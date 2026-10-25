from typing import List
import heapq


class Solution:
    def scheduleCourse(self, courses: List[List[int]]) -> int:
        longest = []
        total = 0
        for duration, deadline in sorted(courses, key=lambda course: course[1]):
            heapq.heappush(longest, -duration)
            total += duration
            if total > deadline:
                total += heapq.heappop(longest)
        return len(longest)

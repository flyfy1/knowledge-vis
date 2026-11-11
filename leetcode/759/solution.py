"""
# Interval is provided by LeetCode:
class Interval:
    def __init__(self, start: int = None, end: int = None):
        self.start = start
        self.end = end
"""


class Solution:
    def employeeFreeTime(self, schedule: "[[Interval]]") -> "[Interval]":
        # Who is busy does not matter: pool every busy interval, ordered by start.
        busy = sorted((iv.start, iv.end) for person in schedule for iv in person)
        free = []
        reach = busy[0][1]  # the furthest end seen so far
        for start, end in busy:
            if start > reach:  # nobody covers the open stretch (reach, start)
                free.append(Interval(reach, start))
            reach = max(reach, end)
        return free

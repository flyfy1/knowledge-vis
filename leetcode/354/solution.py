from bisect import bisect_left


class Solution:
    def maxEnvelopes(self, envelopes: list[list[int]]) -> int:
        ordered = sorted(envelopes, key=lambda e: (e[0], -e[1]))
        tails = []
        for _, height in ordered:
            pos = bisect_left(tails, height)
            if pos == len(tails):
                tails.append(height)
            else:
                tails[pos] = height
        return len(tails)

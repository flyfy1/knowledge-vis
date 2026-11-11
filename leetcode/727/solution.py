class Solution:
    def minWindow(self, s1: str, s2: str) -> str:
        m = len(s2)
        # latest[k]: the latest start such that s2[:k] fits, in order,
        # inside s1[start..j] for the current j; -1 means "no such start yet".
        latest = [-1] * (m + 1)
        best_start, best_len = -1, len(s1) + 1
        for j, ch in enumerate(s1):
            # Right to left, so this one letter is used for at most one slot.
            for k in range(m, 0, -1):
                if s2[k - 1] == ch:
                    latest[k] = j if k == 1 else latest[k - 1]
            start = latest[m]
            # Strictly shorter only: on a tie the earlier (leftmost) window stays.
            if start != -1 and j - start + 1 < best_len:
                best_start, best_len = start, j - start + 1
        if best_start == -1:
            return ""
        return s1[best_start:best_start + best_len]

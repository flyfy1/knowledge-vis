from collections import Counter


class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not s or not t:
            return ""
        need = Counter(t)
        have = {c: 0 for c in need}
        missing = len(t)
        left = 0
        best_start, best_len = 0, len(s) + 1

        for right, c in enumerate(s):
            if c in need:
                if have[c] < need[c]:
                    missing -= 1
                have[c] += 1

            while missing == 0:
                width = right - left + 1
                if width < best_len:
                    best_start, best_len = left, width
                c = s[left]
                if c in need:
                    have[c] -= 1
                    if have[c] < need[c]:
                        missing += 1
                left += 1

        if best_len > len(s):
            return ""
        return s[best_start:best_start + best_len]

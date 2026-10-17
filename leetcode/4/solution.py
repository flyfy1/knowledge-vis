from typing import List


class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        a, b = nums1, nums2
        if len(a) > len(b):
            a, b = b, a
        m, n = len(a), len(b)
        half = (m + n + 1) // 2
        lo, hi = 0, m
        while lo <= hi:
            i = (lo + hi) // 2
            j = half - i
            al = a[i - 1] if i else float("-inf")
            ar = a[i] if i < m else float("inf")
            bl = b[j - 1] if j else float("-inf")
            br = b[j] if j < n else float("inf")
            if al > br:
                hi = i - 1
            elif bl > ar:
                lo = i + 1
            elif (m + n) % 2:
                return float(max(al, bl))
            else:
                return (max(al, bl) + min(ar, br)) / 2

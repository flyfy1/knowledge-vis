class Solution:
    def minSwap(self, nums1: list[int], nums2: list[int]) -> int:
        keep, swap = 0, 1
        for i in range(1, len(nums1)):
            next_keep = next_swap = float('inf')
            if nums1[i - 1] < nums1[i] and nums2[i - 1] < nums2[i]:
                next_keep = min(next_keep, keep)
                next_swap = min(next_swap, swap + 1)
            if nums1[i - 1] < nums2[i] and nums2[i - 1] < nums1[i]:
                next_keep = min(next_keep, swap)
                next_swap = min(next_swap, keep + 1)
            keep, swap = next_keep, next_swap
        return min(keep, swap)

class Solution:
    def maxNumber(self, nums1: list[int], nums2: list[int], k: int) -> list[int]:
        def pick(nums: list[int], take: int) -> list[int]:
            drop = len(nums) - take
            stack = []
            for digit in nums:
                while drop and stack and stack[-1] < digit:
                    stack.pop()
                    drop -= 1
                stack.append(digit)
            return stack[:take]

        def merge(a: list[int], b: list[int]) -> list[int]:
            i = j = 0
            out = []
            while i < len(a) or j < len(b):
                # Compare whole remaining suffixes, not just their heads.
                if a[i:] > b[j:]:
                    out.append(a[i])
                    i += 1
                else:
                    out.append(b[j])
                    j += 1
            return out

        best = []
        for take in range(max(0, k - len(nums2)), min(k, len(nums1)) + 1):
            a = pick(nums1, take)
            b = pick(nums2, k - take)
            candidate = merge(a, b)
            if candidate > best:
                best = candidate
        return best

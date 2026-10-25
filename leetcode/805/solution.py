class Solution:
    def splitArraySameAverage(self, nums: list[int]) -> bool:
        n, total = len(nums), sum(nums)
        sizes = [k for k in range(1, n // 2 + 1)
                 if total * k % n == 0]
        if not sizes:
            return False

        def sums_by_count(values):
            groups = [{0}]
            for x in values:
                old = groups
                groups = [set(sums) for sums in old] + [set()]
                for count, sums in enumerate(old):
                    groups[count + 1].update(s + x for s in sums)
            return groups

        mid = n // 2
        left = sums_by_count(nums[:mid])
        right = sums_by_count(nums[mid:])
        for k in sizes:
            target = total * k // n
            for i in range(max(0, k - (n - mid)), min(k, mid) + 1):
                j = k - i
                for a in left[i]:
                    if target - a in right[j]:
                        return True
        return False

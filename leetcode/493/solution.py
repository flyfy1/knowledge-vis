class Solution:
    def reversePairs(self, nums: list[int]) -> int:
        a = nums.copy()
        temp = [0] * len(a)

        def sort_count(lo: int, hi: int) -> int:
            if hi - lo <= 1:
                return 0
            mid = (lo + hi) // 2
            total = sort_count(lo, mid) + sort_count(mid, hi)
            q = mid
            for i in range(lo, mid):
                while q < hi and a[i] > 2 * a[q]:
                    q += 1
                total += q - mid

            i, j, k = lo, mid, lo
            while i < mid and j < hi:
                if a[i] <= a[j]:
                    temp[k] = a[i]
                    i += 1
                else:
                    temp[k] = a[j]
                    j += 1
                k += 1
            while i < mid:
                temp[k] = a[i]
                i += 1
                k += 1
            while j < hi:
                temp[k] = a[j]
                j += 1
                k += 1
            a[lo:hi] = temp[lo:hi]
            return total

        return sort_count(0, len(a))

class Solution:
    def countRangeSum(self, nums: list[int], lower: int, upper: int) -> int:
        prefix = [0]
        for value in nums:
            prefix.append(prefix[-1] + value)
        scratch = [0] * len(prefix)

        def count(lo: int, hi: int) -> int:
            if hi - lo <= 1:
                return 0
            mid = (lo + hi) // 2
            total = count(lo, mid) + count(mid, hi)
            k = l = mid
            for i in range(lo, mid):
                while k < hi and prefix[k] - prefix[i] < lower:
                    k += 1
                while l < hi and prefix[l] - prefix[i] <= upper:
                    l += 1
                total += l - k

            a, b, out = lo, mid, lo
            while a < mid and b < hi:
                if prefix[a] <= prefix[b]:
                    scratch[out] = prefix[a]
                    a += 1
                else:
                    scratch[out] = prefix[b]
                    b += 1
                out += 1
            while a < mid:
                scratch[out] = prefix[a]
                a += 1
                out += 1
            while b < hi:
                scratch[out] = prefix[b]
                b += 1
                out += 1
            prefix[lo:hi] = scratch[lo:hi]
            return total

        return count(0, len(prefix))

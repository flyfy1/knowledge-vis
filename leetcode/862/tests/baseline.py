def baseline(nums, k):
    best = len(nums) + 1
    for i in range(len(nums)):
        total = 0
        for j in range(i, len(nums)):
            total += nums[j]
            if total >= k:
                best = min(best, j - i + 1)
    return best if best <= len(nums) else -1

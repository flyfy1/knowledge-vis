class Solution:
    def maxChunksToSorted(self, arr: list[int]) -> int:
        n = len(arr)
        suffix_min = [0] * n
        suffix_min[n - 1] = arr[n - 1]
        for i in range(n - 2, -1, -1):
            suffix_min[i] = min(arr[i], suffix_min[i + 1])

        chunks = 1
        left_max = arr[0]
        for i in range(n - 1):
            left_max = max(left_max, arr[i])
            if left_max <= suffix_min[i + 1]:
                chunks += 1
        return chunks

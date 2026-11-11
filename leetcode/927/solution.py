class Solution:
    def threeEqualParts(self, arr: list[int]) -> list[int]:
        n = len(arr)
        ones = sum(arr)
        if ones == 0:
            return [0, 2]
        if ones % 3:
            return [-1, -1]

        k = ones // 3
        seen = 0
        s1 = s2 = s3 = 0
        for index, bit in enumerate(arr):
            if bit == 1:
                seen += 1
                if seen == 1:
                    s1 = index
                elif seen == k + 1:
                    s2 = index
                elif seen == 2 * k + 1:
                    s3 = index

        length = n - s3
        if s1 + length > s2 or s2 + length > s3:
            return [-1, -1]
        for offset in range(length):
            if not (arr[s1 + offset] == arr[s2 + offset] == arr[s3 + offset]):
                return [-1, -1]
        return [s1 + length - 1, s2 + length]

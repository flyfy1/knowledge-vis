class Solution:
    def longestDecomposition(self, text: str) -> int:
        left, right = 0, len(text)
        chunks = 0
        while left < right:
            size = 1
            while 2 * size <= right - left:
                if text[left:left + size] == text[right - size:right]:
                    break
                size += 1
            if 2 * size > right - left:
                return chunks + 1
            chunks += 2
            left += size
            right -= size
        return chunks

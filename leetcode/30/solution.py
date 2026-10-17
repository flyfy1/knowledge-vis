from collections import Counter
from typing import List


class Solution:
    def findSubstring(self, s: str, words: List[str]) -> List[int]:
        width, count = len(words[0]), len(words)
        if width * count > len(s):
            return []
        need = Counter(words)
        answer = []
        for offset in range(width):
            left = offset
            have = Counter()
            used = 0
            for right in range(offset, len(s) - width + 1, width):
                word = s[right:right + width]
                if word not in need:
                    have.clear()
                    used = 0
                    left = right + width
                    continue
                have[word] += 1
                used += 1
                while have[word] > need[word]:
                    have[s[left:left + width]] -= 1
                    used -= 1
                    left += width
                if used == count:
                    answer.append(left)
                    have[s[left:left + width]] -= 1
                    used -= 1
                    left += width
        return answer

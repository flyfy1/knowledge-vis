from typing import List


class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> List[str]:
        words = set(wordDict)
        n = len(s)
        max_len = max(map(len, wordDict))
        sentences = [[] for _ in range(n + 1)]
        sentences[n] = [""]
        for i in range(n - 1, -1, -1):
            for j in range(i + 1, min(n, i + max_len) + 1):
                word = s[i:j]
                if word in words:
                    for tail in sentences[j]:
                        sentences[i].append(word + (" " + tail if tail else ""))
        return sentences[0]

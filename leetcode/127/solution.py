from collections import deque


class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int:
        remaining = set(wordList)
        if endWord not in remaining:
            return 0
        remaining.discard(beginWord)
        queue = deque([(beginWord, 1)])
        while queue:
            word, distance = queue.popleft()
            if word == endWord:
                return distance
            for i in range(len(word)):
                for letter in "abcdefghijklmnopqrstuvwxyz":
                    if letter == word[i]:
                        continue
                    candidate = word[:i] + letter + word[i + 1:]
                    if candidate in remaining:
                        remaining.remove(candidate)
                        queue.append((candidate, distance + 1))
        return 0

from collections import defaultdict, deque
from string import ascii_lowercase


class Solution:
    def findLadders(self, beginWord: str, endWord: str, wordList: list[str]) -> list[list[str]]:
        words = set(wordList)
        if endWord not in words:
            return []
        distance = {beginWord: 0}
        parents = defaultdict(list)
        queue = deque([beginWord])
        target_depth = None
        while queue:
            word = queue.popleft()
            depth = distance[word]
            if target_depth is not None and depth >= target_depth:
                break
            for i, old in enumerate(word):
                for letter in ascii_lowercase:
                    if letter == old:
                        continue
                    neighbor = word[:i] + letter + word[i + 1:]
                    if neighbor not in words:
                        continue
                    if neighbor not in distance:
                        distance[neighbor] = depth + 1
                        queue.append(neighbor)
                    if distance[neighbor] == depth + 1:
                        parents[neighbor].append(word)
                        if neighbor == endWord:
                            target_depth = depth + 1
        if endWord not in distance:
            return []
        answer = []
        path = [endWord]

        def build(word):
            if word == beginWord:
                answer.append(path[::-1])
                return
            for parent in parents[word]:
                path.append(parent)
                build(parent)
                path.pop()

        build(endWord)
        return answer

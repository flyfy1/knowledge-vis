from typing import List


class WordFilter:
    def __init__(self, words: List[str]):
        self.best = {}
        for index, word in enumerate(words):
            for p in range(1, len(word) + 1):
                for s in range(1, len(word) + 1):
                    self.best[(word[:p], word[-s:])] = index

    def f(self, pref: str, suff: str) -> int:
        return self.best.get((pref, suff), -1)

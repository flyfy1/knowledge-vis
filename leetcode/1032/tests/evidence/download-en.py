from collections import deque


class StreamChecker:
    def __init__(self, words: list[str]):
        self.root = {}
        self.limit = max(len(word) for word in words)
        self.buffer = deque(maxlen=self.limit)
        for word in words:
            node = self.root
            for ch in reversed(word):
                if ch not in node:
                    node[ch] = {}
                node = node[ch]
            node["#"] = True

    def query(self, letter: str) -> bool:
        self.buffer.append(letter)
        node = self.root
        for ch in reversed(self.buffer):
            node = node.get(ch)
            if node is None:
                return False
            if "#" in node:
                return True
        return False

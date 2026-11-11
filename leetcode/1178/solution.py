class Solution:
    def findNumOfValidWords(self, words: list[str], puzzles: list[str]) -> list[int]:
        freq = {}
        for word in words:
            mask = 0
            for ch in set(word):
                mask |= 1 << (ord(ch) - ord('a'))
            freq[mask] = freq.get(mask, 0) + 1
        answer = []
        for puzzle in puzzles:
            first = 1 << (ord(puzzle[0]) - ord('a'))
            rest = 0
            for ch in puzzle[1:]:
                rest |= 1 << (ord(ch) - ord('a'))
            total = 0
            sub = rest
            while True:
                total += freq.get(sub | first, 0)
                if sub == 0:
                    break
                sub = (sub - 1) & rest
            answer.append(total)
        return answer

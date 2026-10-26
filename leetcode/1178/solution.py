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
            mask = 0
            for ch in puzzle:
                mask |= 1 << (ord(ch) - ord('a'))
            first = 1 << (ord(puzzle[0]) - ord('a'))
            total = 0
            sub = mask
            while sub:
                if sub & first:
                    total += freq.get(sub, 0)
                sub = (sub - 1) & mask
            answer.append(total)
        return answer

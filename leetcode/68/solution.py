class Solution:
    def fullJustify(self, words: list[str], maxWidth: int) -> list[str]:
        result = []
        i = 0
        while i < len(words):
            j = i
            letters = 0
            while j < len(words) and letters + len(words[j]) + (j - i) <= maxWidth:
                letters += len(words[j])
                j += 1
            gaps = j - i - 1
            if j == len(words) or gaps == 0:
                line = ' '.join(words[i:j])
                result.append(line + ' ' * (maxWidth - len(line)))
            else:
                q, r = divmod(maxWidth - letters, gaps)
                pieces = []
                for k in range(i, j - 1):
                    pieces.append(words[k])
                    pieces.append(' ' * (q + (k - i < r)))
                pieces.append(words[j - 1])
                result.append(''.join(pieces))
            i = j
        return result

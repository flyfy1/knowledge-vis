from functools import cache


class Solution:
    def minStickers(self, stickers: list[str], target: str) -> int:
        letters = sorted(set(target))
        need = tuple(target.count(c) for c in letters)
        counts = [tuple(word.count(c) for c in letters) for word in stickers]
        infinity = len(target) + 1

        @cache
        def solve(remaining):
            if not any(remaining):
                return 0
            pivot = next(i for i, count in enumerate(remaining) if count)
            best = infinity
            for sticker in counts:
                if sticker[pivot] == 0:
                    continue
                child = tuple(max(0, r - s) for r, s in zip(remaining, sticker))
                best = min(best, 1 + solve(child))
            return best

        answer = solve(need)
        return -1 if answer >= infinity else answer

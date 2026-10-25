class Solution:
    def fallingSquares(self, positions: list[list[int]]) -> list[int]:
        landed = []
        answer = []
        highest = 0
        for left, side in positions:
            right = left + side
            base = 0
            for old_left, old_right, old_top in landed:
                if max(left, old_left) < min(right, old_right):
                    base = max(base, old_top)
            top = base + side
            landed.append((left, right, top))
            highest = max(highest, top)
            answer.append(highest)
        return answer

class Solution:
    def reachingPoints(self, sx: int, sy: int, tx: int, ty: int) -> bool:
        # Walk backward: a point (x, y) with positive values has at most one parent.
        while tx > sx and ty > sy:
            if tx > ty:
                tx %= ty  # fold every "x - y" step of this run at once
            else:
                ty %= tx  # fold every "y - x" step; tx == ty leaves 0 (no parent)
        # One coordinate already equals its source; only the other may still shrink.
        if tx == sx and ty >= sy:
            return (ty - sy) % sx == 0
        if ty == sy and tx >= sx:
            return (tx - sx) % sy == 0
        return False

from collections import deque


class Solution:
    def racecar(self, target: int) -> int:
        queue = deque([(0, 1, 0)])
        seen = {(0, 1)}
        while queue:
            position, speed, steps = queue.popleft()
            if position == target:
                return steps
            candidates = (
                (position + speed, speed * 2),
                (position, -1 if speed > 0 else 1),
            )
            for next_position, next_speed in candidates:
                state = (next_position, next_speed)
                if state not in seen:
                    seen.add(state)
                    queue.append((next_position, next_speed, steps + 1))

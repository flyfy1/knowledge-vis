from heapq import heappop, heappush


class Solution:
    def racecar(self, target: int) -> int:
        def lower_bound(position, speed):
            distance = abs(target - position)
            if distance == 0:
                return 0
            if (target - position) * speed > 0:
                magnitude = abs(speed)
                units = (distance + magnitude - 1) // magnitude
                return units.bit_length()
            return 1 + distance.bit_length()

        # Tuple order: (g + h, -g, position, speed).
        frontier = [(lower_bound(0, 1), 0, 0, 1)]
        best = {(0, 1): 0}
        while frontier:
            _, negative_g, position, speed = heappop(frontier)
            g = -negative_g
            if g != best[(position, speed)]:
                continue
            if position == target:
                return g
            candidates = (
                (position + speed, speed * 2),
                (position, -1 if speed > 0 else 1),
            )
            for next_position, next_speed in candidates:
                state = (next_position, next_speed)
                next_g = g + 1
                if next_g < best.get(state, float('inf')):
                    best[state] = next_g
                    h = lower_bound(next_position, next_speed)
                    heappush(frontier, (next_g + h, -next_g,
                                        next_position, next_speed))

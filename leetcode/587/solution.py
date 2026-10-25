class Solution:
    def outerTrees(self, trees: list[list[int]]) -> list[list[int]]:
        points = sorted(map(tuple, trees))

        def cross(a, b, c):
            return ((b[0] - a[0]) * (c[1] - a[1])
                    - (b[1] - a[1]) * (c[0] - a[0]))

        def build(sequence):
            chain = []
            for point in sequence:
                while len(chain) >= 2 and cross(chain[-2], chain[-1], point) < 0:
                    chain.pop()
                chain.append(point)
            return chain

        lower = build(points)
        upper = build(reversed(points))
        return [list(point) for point in sorted(set(lower + upper))]

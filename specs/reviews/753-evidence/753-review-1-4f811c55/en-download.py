class Solution:
    def crackSafe(self, n: int, k: int) -> str:
        vertices = k ** (n - 1)
        next_digit = [0] * vertices
        stack = [(0, None)]
        finished = []

        while stack:
            vertex, incoming = stack[-1]
            if next_digit[vertex] < k:
                digit = next_digit[vertex]
                next_digit[vertex] += 1
                target = (vertex * k + digit) % vertices
                stack.append((target, digit))
            else:
                stack.pop()
                if incoming is not None:
                    finished.append(str(incoming))

        return "0" * (n - 1) + "".join(reversed(finished))

class Solution:
    def oddEvenJumps(self, arr: list[int]) -> int:
        n = len(arr)

        def targets(order):
            nxt = [-1] * n
            stack = []
            for j in order:
                while stack and stack[-1] < j:
                    nxt[stack.pop()] = j
                stack.append(j)
            return nxt

        up = targets(sorted(range(n), key=lambda i: (arr[i], i)))
        down = targets(sorted(range(n), key=lambda i: (-arr[i], i)))
        odd = [False] * n
        even = [False] * n
        odd[-1] = even[-1] = True
        for i in range(n - 2, -1, -1):
            if up[i] != -1:
                odd[i] = even[up[i]]
            if down[i] != -1:
                even[i] = odd[down[i]]
        return sum(odd)

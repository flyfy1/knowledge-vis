from collections import deque


class Solution:
    def movesToStamp(self, stamp: str, target: str) -> list[int]:
        m, n = len(stamp), len(target)
        waiting = [[] for _ in range(n)]
        todo = [0] * (n - m + 1)
        ready = deque()

        for i in range(n - m + 1):
            for j in range(m):
                p = i + j
                if target[p] != stamp[j]:
                    todo[i] += 1
                    waiting[p].append(i)
            if todo[i] == 0:
                ready.append(i)

        done = [False] * n
        erased = 0
        answer = []
        while ready:
            i = ready.popleft()
            productive = False
            for p in range(i, i + m):
                if done[p]:
                    continue
                done[p] = True
                erased += 1
                productive = True
                for w in waiting[p]:
                    todo[w] -= 1
                    if todo[w] == 0:
                        ready.append(w)
            if productive:
                answer.append(i)

        if erased != n:
            return []
        return answer[::-1]

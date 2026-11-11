from collections import deque


def baseline(s1, s2):
    queue = deque([(s1, 0)])
    seen = {s1}
    while queue:
        state, depth = queue.popleft()
        if state == s2:
            return depth
        for i in range(len(state)):
            for j in range(i + 1, len(state)):
                chars = list(state)
                chars[i], chars[j] = chars[j], chars[i]
                nxt = ''.join(chars)
                if nxt not in seen:
                    seen.add(nxt)
                    queue.append((nxt, depth + 1))

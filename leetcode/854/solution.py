from collections import deque


class Solution:
    def kSimilarity(self, s1: str, s2: str) -> int:
        queue = deque([(s1, 0)])
        seen = {s1}
        while queue:
            state, depth = queue.popleft()
            if state == s2:
                return depth
            i = 0
            while state[i] == s2[i]:
                i += 1
            for j in range(i + 1, len(state)):
                if state[j] == s2[i] and state[j] != s2[j]:
                    chars = list(state)
                    chars[i], chars[j] = chars[j], chars[i]
                    nxt = ''.join(chars)
                    if nxt not in seen:
                        seen.add(nxt)
                        queue.append((nxt, depth + 1))
        return -1  # Unreachable for the promised anagram inputs.

from collections import deque

def baseline(s):
    start = '_' * len(s)
    queue, seen = deque([(start, 0)]), {start}
    while queue:
        board, turns = queue.popleft()
        if board == s:
            return turns
        for i in range(len(s)):
            for j in range(i, len(s)):
                for c in set(s):
                    nxt = board[:i] + c * (j-i+1) + board[j+1:]
                    if nxt not in seen:
                        seen.add(nxt)
                        queue.append((nxt, turns+1))

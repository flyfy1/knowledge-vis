from collections import deque


class Solution:
    def catMouseGame(self, graph: list[list[int]]) -> int:
        n = len(graph)
        # turn 1: mouse; turn 2: cat. 0 means not yet proved.
        winner = [[[0] * 3 for _ in range(n)] for _ in range(n)]
        remaining = [[[0] * 3 for _ in range(n)] for _ in range(n)]
        queue = deque()
        for m in range(n):
            for c in range(1, n):
                remaining[m][c][1] = len(graph[m])
                remaining[m][c][2] = sum(v != 0 for v in graph[c])
                for turn in (1, 2):
                    if m == 0 or m == c:
                        winner[m][c][turn] = 1 if m == 0 else 2
                        queue.append((m, c, turn))

        while queue:
            m, c, turn = queue.popleft()
            result = winner[m][c][turn]
            # Undo the player who moved last, using undirected edges.
            if turn == 2:
                parents = ((pm, c, 1) for pm in graph[m])
            else:
                parents = ((m, pc, 2) for pc in graph[c] if pc != 0)
            for pm, pc, player in parents:
                if winner[pm][pc][player] != 0:
                    continue
                if result == player:
                    # One move to this player's win is enough.
                    winner[pm][pc][player] = player
                    queue.append((pm, pc, player))
                else:
                    remaining[pm][pc][player] -= 1
                    if remaining[pm][pc][player] == 0:
                        # Every legal move has been proved to lose.
                        winner[pm][pc][player] = result
                        queue.append((pm, pc, player))

        # At queue exhaustion only, unresolved states are draws.
        return winner[1][2][1]

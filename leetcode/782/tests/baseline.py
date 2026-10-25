from itertools import permutations


def swap_cost(order):
    seen = set()
    cycles = 0
    for i in range(len(order)):
        if i not in seen:
            cycles += 1
            while i not in seen:
                seen.add(i)
                i = order[i]
    return len(order) - cycles


def baseline(board):
    n = len(board)
    best = None
    for rows in permutations(range(n)):
        for cols in permutations(range(n)):
            valid = True
            for i in range(n):
                for j in range(n):
                    bit = board[rows[i]][cols[j]]
                    if (i and bit == board[rows[i - 1]][cols[j]]) or (
                        j and bit == board[rows[i]][cols[j - 1]]
                    ):
                        valid = False
                        break
                if not valid:
                    break
            if valid:
                cost = swap_cost(rows) + swap_cost(cols)
                best = cost if best is None else min(best, cost)
    return -1 if best is None else best

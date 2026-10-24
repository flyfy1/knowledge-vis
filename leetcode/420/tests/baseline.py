"""Exact edit distance to the strong-password language, without the greedy rule."""
def baseline(password):
    alphabet = sorted(set(password + 'abAB01.!'))
    # Two representatives per class cover newly invented output characters.
    rows = [{} for _ in range(21)]
    rows[0][('', 0, 0)] = 0
    best = 999
    def relax(row, state, cost):
        row[state] = min(row.get(state, 999), cost)
    for i in range(len(password) + 1):
        following = [{} for _ in range(21)]
        for length in range(21):
            for (last, run, mask), cost in rows[length].items():
                if i == len(password) and length >= 6 and mask == 7:
                    best = min(best, cost)
                if i < len(password):
                    relax(following[length], (last, run, mask), cost + 1)
                if length == 20:
                    continue
                for c in alphabet:
                    count = run + 1 if c == last else 1
                    if count == 3:
                        continue
                    bit = 1 if 'a' <= c <= 'z' else 2 if 'A' <= c <= 'Z' else 4 if '0' <= c <= '9' else 0
                    state = (c, count, mask | bit)
                    relax(rows[length + 1], state, cost + 1)  # insert
                    if i < len(password):
                        relax(following[length + 1], state,
                              cost + (c != password[i]))  # keep / replace
        rows = following
    return best

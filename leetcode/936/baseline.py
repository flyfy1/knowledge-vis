# Simple reverse-scan baseline, not the canonical submission.
def baseline(stamp, target):
    board = list(target)
    m, n = len(stamp), len(target)
    answer = []
    erased = 0
    while erased < n:
        progress = False
        for i in range(n - m + 1):
            compatible = True
            fresh = 0
            for j in range(m):
                c = board[i + j]
                if c != '?' and c != stamp[j]:
                    compatible = False
                if c != '?':
                    fresh += 1
            if compatible and fresh > 0:
                for j in range(m):
                    board[i + j] = '?'
                erased += fresh
                answer.append(i)
                progress = True
        if not progress:
            return []
    return answer[::-1]

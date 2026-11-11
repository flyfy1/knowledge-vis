"""Independent oracle: enumerate every window by length, then by start, and test
subsequence membership with an iterator. Shares no code or idea with the DP."""


def is_subsequence(small, big):
    it = iter(big)
    return all(ch in it for ch in small)


def oracle(s1, s2):
    n = len(s1)
    for length in range(1, n + 1):          # shortest length first
        for start in range(0, n - length + 1):  # leftmost first
            if is_subsequence(s2, s1[start:start + length]):
                return s1[start:start + length]
    return ""


def latest_by_definition(s1, s2, j, k):
    """Largest start <= j such that s2[:k] is a subsequence of s1[start..j]; -1 if none."""
    for start in range(j, -1, -1):
        if is_subsequence(s2[:k], s1[start:j + 1]):
            return start
    return -1


def forward_backward(s1, s2):
    """Second, structurally different algorithm for large inputs: match s2 forward to an end,
    then backward to the latest start, record, and resume at start + 1."""
    n, m = len(s1), len(s2)
    best = None
    i = 0
    while i < n:
        k = 0
        while i < n:
            if s1[i] == s2[k]:
                k += 1
                if k == m:
                    break
            i += 1
        if i == n:
            break
        end = i
        k = m - 1
        while k >= 0:
            if s1[i] == s2[k]:
                k -= 1
            i -= 1
        start = i + 1
        if best is None or end - start + 1 < best[1] - best[0] + 1:
            best = (start, end)
        i = start + 1
    return '' if best is None else s1[best[0]:best[1] + 1]

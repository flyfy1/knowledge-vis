def palindrome_flags(s: str) -> tuple[list[bool], list[bool]]:
    """pre[k]: s[:k] is palindrome; suf[k]: s[k:] is palindrome."""
    n = len(s)
    pre, suf = [False] * (n + 1), [False] * (n + 1)
    pre[0] = suf[n] = True
    # odd radius counts the center; even radius counts pairs around a gap.
    for even in (False, True):
        radius = [0] * n
        left, right = 0, -1
        for i in range(n):
            if i > right:
                k = 0 if even else 1
            else:
                mirror = left + right - i + (1 if even else 0)
                k = min(radius[mirror], right - i + 1)
            while i + k < n and i - k - (1 if even else 0) >= 0:
                if s[i + k] != s[i - k - (1 if even else 0)]:
                    break
                k += 1
            radius[i] = k
            a, b = i - k + (0 if even else 1), i + k - 1
            if a == 0:
                pre[b + 1] = True
            if b == n - 1:
                suf[a] = True
            if b > right:
                left, right = a, b
    return pre, suf


class Node:
    def __init__(self):
        self.child = {}
        self.end = -1
        self.pal = []


class Solution:
    def palindromePairs(self, words: list[str]) -> list[list[int]]:
        flags = [palindrome_flags(w) for w in words]
        root = Node()
        # At depth d, consumed characters are reverse(w[len(w)-d:]).
        for j, w in enumerate(words):
            node = root
            pre, _ = flags[j]
            for k in range(len(w) - 1, -1, -1):
                if pre[k + 1]:
                    node.pal.append(j)
                c = w[k]
                if c not in node.child:
                    node.child[c] = Node()
                node = node.child[c]
            node.end = j
            node.pal.append(j)  # The remaining prefix is empty.

        answer = []
        for i, w in enumerate(words):
            node = root
            _, suf = flags[i]
            for k, c in enumerate(w):
                # A strictly shorter partner ended before this character.
                if node.end != -1 and node.end != i and suf[k]:
                    answer.append([i, node.end])
                if c not in node.child:
                    break
                node = node.child[c]
            else:
                # Equal/longer partners have a palindromic middle prefix.
                for j in node.pal:
                    if j != i:
                        answer.append([i, j])
        return answer

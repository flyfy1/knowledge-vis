from typing import List


class Solution:
    def findSecretWord(self, words: List[str], master: 'Master') -> None:
        n = len(words)
        matches = [[0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                matches[i][j] = sum(a == b for a, b in zip(words[i], words[j]))

        candidates = list(range(n))
        used = set()
        # The API supplies no budget. Continue until an actual successful call.
        # Failed minimax probes strictly shrink candidates: at most n calls.
        # This is not a universal guarantee for a case's 10–30 call budget.
        while candidates:
            best = None
            for probe in range(n):
                if probe in used:
                    continue
                buckets = [0] * 6
                for possible in candidates:
                    score = matches[probe][possible]
                    if score < 6:
                        buckets[score] += 1
                key = (max(buckets), probe not in candidates, probe)
                if best is None or key < best[0]:
                    best = (key, probe)
            probe = best[1]
            used.add(probe)
            reply = master.guess(words[probe])
            if reply == 6:
                return
            candidates = [i for i in candidates if matches[probe][i] == reply]

class Solution:
    def findAllConcatenatedWordsInADict(self, words: list[str]) -> list[str]:
        dictionary = set(words)
        answer = []
        for word in words:
            n = len(word)
            dp = [False] * (n + 1)
            dp[0] = True
            for i in range(1, n + 1):
                for j in range(i):
                    # Exclude the one-piece match of the whole target.
                    if j == 0 and i == n:
                        continue
                    if dp[j] and word[j:i] in dictionary:
                        dp[i] = True
                        break
            if dp[n]:
                answer.append(word)
        return answer

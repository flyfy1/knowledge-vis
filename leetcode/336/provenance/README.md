# Official interface observation

Accessed at 2026-10-24T18:24:32.873969+00:00
Official URL: https://leetcode.com/problems/palindrome-pairs/
Public endpoint: https://leetcode.com/graphql/; unauthenticated question query. HTTP 200. No credentials or paywall bypass.

Observed question 336: Palindrome Pairs; Hard; isPaidOnly=False.

The saved JSON contains the complete returned statement, all three examples, constraints and every observed codeSnippets selector entry.

Observed Python3 selector entry:
```python
class Solution:
    def palindromePairs(self, words: list[str]) -> list[list[int]]:
        
```

Faithful selected interface: class Solution, palindromePairs(self, words: list[str]) -> list[list[int]]. Prefer Python under the owner language rule. No non-Python language contract is needed.

Observed language selector labels: C++, Java, Python3, Python, JavaScript, TypeScript, C#, C, Go, Kotlin, Swift, Rust, Ruby, PHP, Dart, Scala, Elixir, Erlang, Racket

Contract notes: unique strings; zero-based distinct indices; ordered concatenation; all pairs; one or more words; empty word allowed; lowercase a-z; at most 5000 words of length 300; statement explicitly requires linear time in total word length. Submission does not mutate input. Pair order is normalized only in local tests.

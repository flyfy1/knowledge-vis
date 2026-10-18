# Official verification — 2026-10-18T12:40:53.868227+00:00
Source: https://leetcode.com/problems/max-points-on-a-line/
Public GET https://leetcode.com/graphql/ with query:
```graphql
query { question(titleSlug: "max-points-on-a-line") { questionId title content difficulty codeSnippets { lang langSlug code } } }
```
HTTP 200, full response retained in official-graphql.json. Direct Python HTTP page fetch returned 403; browser search access to the official page succeeded. No authentication or paywall bypass used.

Observed statement: maximum number of input points on one straight line.
Observed constraints: 1 <= n <= 300; two integer coordinates per point; coordinates in [-10000,10000]; all points unique. Empty inputs and duplicate coordinates are outside the contract. No input mutation required.
Examples: [[1,1],[2,2],[3,3]] -> 3; [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]] -> 4.
Observed official language selector entries: C++, Java, Python3, Python, JavaScript, TypeScript, C#, C, Go, Kotlin, Swift, Rust, Ruby, PHP, Dart, Scala, Elixir, Erlang, Racket.
Python3 selector/template (faithful original submission):
```python
class Solution:
    def maxPoints(self, points: list[list[int]]) -> int:
        
```
Chosen canonical language: Python. No non-Python exception is needed. Implemented source keeps the observed callable signature. No submission or LeetCode acceptance claimed.

# Official contract capture

Access: 2026-10-25 (Asia/Singapore; access session date).
Official catalog URL: https://leetcode.com/problems/max-sum-of-rectangle-no-larger-than-k/
Public endpoint: https://leetcode.com/graphql/ (HTTP 200).
Query: `query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId title content exampleTestcases codeSnippets { lang langSlug code } } }`
Variable titleSlug: `max-sum-of-rectangle-no-larger-than-k`.
Response preserved without modification in official-graphql.json.
The official webpage was also opened and its statement, examples and constraints
matched the public GraphQL result. No authentication or restricted access was used.

Observed Python3 selector (langSlug python3):
```
class Solution:
    def maxSumSubmatrix(self, matrix: list[list[int]], k: int) -> int:
```
Python, TypeScript and JavaScript interfaces were also returned; all observed
language snippets are retained in the raw capture. Python is the preferred faithful
submission interface, so no fallback language contract is necessary.
Translation in lesson-entry.json is authored Chinese copy, not a captured Chinese title.

# Official contract capture

Source: https://leetcode.com/problems/freedom-trail/
Access: 2026-10-25, public unauthenticated official GraphQL. The exact UTC
access timestamp is `accessedAt` in official.json. The official web description
was also opened through the web tool; no editorial or unofficial solution was
used to define the contract.

POST https://leetcode.com/graphql/ with variables
`{"titleSlug":"freedom-trail"}` and query:

```graphql
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId title titleSlug difficulty isPaidOnly content exampleTestcases
    codeSnippets { lang langSlug code }
  }
}
```

`official.json` saves the actual successful response, including the full observed
language-interface catalog. The Python3 entry (`langSlug: python3`) provides:

```python
class Solution:
    def findRotateSteps(self, ring: str, key: str) -> int:
```

This is an actual submission starter, rather than an inference from the category.
The Python preference applies without an exception. Canonical source is
solution.py; the browser does not execute it. The capture is review material and
is never loaded by the lesson runtime. No submission was made to LeetCode.

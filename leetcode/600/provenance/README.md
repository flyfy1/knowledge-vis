# Official contract evidence

Source: https://leetcode.com/problems/non-negative-integers-without-consecutive-ones/
Access date: 2026-10-25 (timezone-qualified timestamp in official.json).
The public problem page exposed the full statement, three examples and constraint.
The ordinary public https://leetcode.com/graphql/ endpoint returned HTTP 200.
No authentication, credentials, premium bypass, or submission was used.

Observed request query:

```graphql
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug difficulty isPaidOnly
    content exampleTestcases codeSnippets { lang langSlug code }
  }
}
```

Variable titleSlug was `non-negative-integers-without-consecutive-ones`.
`official.json` preserves the entire observed response, including all selector
snippets. Its Python3 / python3 snippet is:

```python
class Solution:
    def findIntegers(self, n: int) -> int:
```

Python is the preferred faithful submission interface and is used canonically.
A non-Python language exception contract is therefore unnecessary. Official
captures are review evidence and are never fetched as page runtime assets.

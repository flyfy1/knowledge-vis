# Official verification — 2026-10-18

Exact catalog URL: https://leetcode.com/problems/candy/

The official public problem page was read through the browser/web tool. Public
https://leetcode.com/graphql/ returned HTTP 200 for question(titleSlug:"candy")
with statement, examples, constraints, and the actual codeSnippets interface
selector data. No authentication or restricted-content access was used.

`official.json` preserves the query, timestamp with timezone, endpoint, exact
problem URL, full returned content and every observed language snippet. The
Python3 entry actually observed was:

```python
class Solution:
    def candy(self, ratings: list[int]) -> int:
        
```

This is a faithful supported Python submission, so no non-Python fallback or
language-contract exception is needed. The candidate uses the same class/method,
parameter and return annotations. The method returns an integer, not the diagram's
per-child allocation. The statement excludes empty input. Equality imposes no
strict candy comparison. No mutation, special runtime, or other exceptions were
observed. Content is public and the official difficulty is Hard, paidOnly false.

Raw official evidence is review material, never loaded by runtime lesson assets.

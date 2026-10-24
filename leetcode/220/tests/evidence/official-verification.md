# Official verification — 2026-10-18

Source https://leetcode.com/problems/contains-duplicate-iii/ (readable public page).
Public POST https://leetcode.com/graphql/ used this request (no credentials):

```graphql
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug difficulty isPaidOnly
    content exampleTestcases codeSnippets { lang langSlug code }
  }
}
```
Variables: {"titleSlug":"contains-duplicate-iii"}.
Raw response is official-graphql.json alongside this file. Observed Python3
selector entry, not inferred from category:

```python
class Solution:
    def containsNearbyAlmostDuplicate(self, nums: list[int], indexDiff: int, valueDiff: int) -> bool:
```

Also observed Python legacy, JavaScript and TypeScript plus native language stubs
in the raw response. Python3 faithfully implements the method so preference
selects Python. No special runtime contract, mutation or exceptions described.
Statement and constraints/examples are retained in raw content for reviewer use.

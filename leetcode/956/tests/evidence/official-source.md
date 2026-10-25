# Official source capture

Exact catalog URL: https://leetcode.com/problems/tallest-billboard/
Accessed: 2026-10-26T00:48:13.675926+08:00

Public statement was read through the official URL. `official.json` is the raw
public GraphQL response saved with curl (no cookies, credentials or restricted
access). Endpoint: https://leetcode.com/graphql/; operation:

```graphql
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId difficulty title titleSlug isPaidOnly content exampleTestcases
    codeSnippets { lang langSlug code }
  }
}
```

Variables: `{"titleSlug":"tallest-billboard"}`. `questionId=993` is internal;
frontend official ID is 956, captured as questionFrontendId and verified on the official page. Free Hard.
The capture includes the complete statement, three examples, constraints and
all 19 returned language interfaces. Python3 selector entry actually observed:

```python
class Solution:
    def tallestBillboard(self, rods: list[int]) -> int:
```

Python is the preferred faithful interface. No exception or non-Python contract
is needed. TypeScript and JavaScript also appear in the captured selector data.
No online submission was made. The canonical solution is tested locally.

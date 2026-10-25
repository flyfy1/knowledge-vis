# Official contract verification

Official URL: https://leetcode.com/problems/least-operators-to-express-number/
Access date: 2026-10-26 Asia/Singapore (UTC capture timestamp is retained in official.json).

The official page was opened with the web tool; the public GraphQL question response was saved verbatim within the response wrapper in official.json. No login, credentials or paywall bypass was used. The response identifies questionFrontendId 964, title/slug, Hard difficulty, isPaidOnly=false, full content, examples and codeSnippets.

Observed Python3 selector/interface excerpt:

```python
class Solution:
    def leastOpsExpressTarget(self, x: int, target: int) -> int:
```

Python is faithful and preferred; no fallback language contract is needed. The solution implements this exact callable. All observed language snippets remain in the capture, rather than filtering away alternatives. The Chinese title is an authored translation.

Verified rules: only repeated x joined by binary +,-,*,/; rational division; ordinary precedence; no parentheses; no unary negation. x in [2,100], target in [1,200000000]. Official examples: (3,19) ->5, (5,501)->8, (100,100000000)->3. Offline code execution does not establish an accepted LeetCode submission.

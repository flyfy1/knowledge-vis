# Official contract observation

Accessed 2026-10-18, Asia/Singapore (+08:00). Exact catalog URL:
https://leetcode.com/problems/text-justification/

The web reader successfully opened the official statement. A plain requests GET
returned HTTP 403 (saved as official-page.html); no challenge bypass was used.
A normal unauthenticated GET to the public GraphQL endpoint succeeded with 200:

https://leetcode.com/graphql/?query=query%20%7B%20question(titleSlug%3A%22text-justification%22)%20%7B%20questionId%20title%20content%20codeSnippets%20%7B%20lang%20langSlug%20code%20%7D%20%7D%20%7D

The complete observed response is official-graphql.json, including the full
statement, all three examples, constraints and every observed language snippet.
Python3 selector entry (langSlug python3):

```
class Solution:
    def fullJustify(self, words: list[str], maxWidth: int) -> list[str]:
```

Python is a faithful officially supported submission interface and the first
preferred language. The delivered canonical source uses this exact method and
built-in generic types. No non-Python exception or language-contract is needed.

Observed rules: maximal consecutive groups; exactly maxWidth characters per
line; spaces balanced across internal gaps with extras on the left; last line
single internal spaces and right padding; single-word lines right padding.
At least one word. No empty words, no word longer than maxWidth, no spaces inside
a word. 1–300 words, length 1–20, width 1–100, letters and symbols only.

No authenticated access, paywall bypass or LeetCode submission was performed.

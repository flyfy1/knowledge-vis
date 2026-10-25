# Official contract capture

Source: https://leetcode.com/problems/decode-ways-ii/

`official.json` is the observed public GraphQL response, saved with an ISO UTC retrieval timestamp on 2026-10-25. HTTP status was 200. The statement was also opened at the exact official URL. No credentials or restricted access were used.

Request: POST https://leetcode.com/graphql/ with variables `{"titleSlug":"decode-ways-ii"}` and this query:

```graphql
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId title titleSlug isPaidOnly content exampleTestcases
    codeSnippets { lang langSlug code }
  }
}
```

The observed `Python3` selector snippet is:

```python
class Solution:
    def numDecodings(self, s: str) -> int:
```

The response also retains the actual Python (legacy), JavaScript, TypeScript and all other observed snippets verbatim. Python3 provides a faithful interface and is the preferred canonical language; no non-Python exception is needed. The capture verifies the 1..100000 string-length bound, star values 1..9 (excluding zero), integer codes 1..26 with no leading zeros, modulo 1000000007, and official examples 9, 18, 15. Source capture is review material and is never loaded by the page.

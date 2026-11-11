# Official source verification

Official catalog URL: https://leetcode.com/problems/longest-chunked-palindrome-decomposition/

The public problem page was read through the web tool, then an unauthenticated public request to `https://leetcode.com/graphql/` returned HTTP 200. `official.json` preserves the actual response, exact official URL and timezone-qualified access time (2026-10-26 UTC / 2026-10-27 Asia/Singapore). No paywall or credential access was used. This is reference material, not a runtime asset.

Query:

```graphql
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title titleSlug isPaidOnly difficulty
    content exampleTestcases codeSnippets { lang langSlug code }
  }
}
```

Variables: `{"titleSlug":"longest-chunked-palindrome-decomposition"}`.

Observed Python3 selector (`langSlug: python3`) provides:

```python
class Solution:
    def longestDecomposition(self, text: str) -> int:
```

Other selectors are preserved in full in the JSON, including Python, TypeScript and JavaScript. Python3 faithfully submits the requested string-to-integer algorithm and takes the prescribed language preference. No non-Python exception or language-contract.json is needed. The statement, constraints and all examples are preserved in `content`. This evidence does not assert an online judge submission or acceptance.

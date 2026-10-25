# Official verification — author evidence

Accessed 2026-10-26. Exact catalog source: https://leetcode.com/problems/minimum-number-of-k-consecutive-bit-flips/

The web tool read the public page (Hard, definition, all three examples, n<=100000 and1<=k<=n). Direct urllib page and an initial GraphQL GET returned HTTP403. A normal unauthenticated public GET at `https://leetcode.com/graphql/` succeeded with URL-encoded query and variables, User-Agent Mozilla/5.0. No credentials, premium access or circumvention used.

Query:
```
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId title content codeSnippets { lang langSlug code }
  }
}
```
Variables: `{"titleSlug":"minimum-number-of-k-consecutive-bit-flips"}`.

Raw response is official.json. Observed actual submission selector/snippet:
- lang Python3; langSlug python3
- `class Solution:`
- `    def minKBitFlips(self, nums: list[int], k: int) -> int:`

Python is a faithful preferred official language; no fallback exception or language-contract.json is required. nums is described as a binary array (the rendered official constraint list contains only length and k, not an extra per-entry bullet). One operation flips both0→1 and1→0 in exactly k adjacent positions. Output is minimum count or−1, no modulus/ordering/mutation requirement. No empty input. Three exact examples are retained in raw content and executed by tests.

Local source includes its own implementation within that signature. No actual LeetCode submission or acceptance result is claimed.

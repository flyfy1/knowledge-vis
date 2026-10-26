# Official verification
Access date: 2026-10-26 (UTC). Exact official URL: https://leetcode.com/problems/find-in-mountain-array/ . Public HTML was read with the web tool; full public GraphQL response is official-graphql.json, queried at https://leetcode.com/graphql/ using titleSlug find-in-mountain-array and content/codeSnippets fields. No authentication or paywall bypass used.

Observed: frontend ID1095, Hard, isPaidOnly false. Strictly increasing to an interior peak, then strictly decreasing. Return minimum zero-based index equal to target or -1. Only get(k) and length() are permitted. More than100 get calls is Wrong Answer; circumvention disqualifies. n3..10000, target/values0..10^9. Examples: [1,2,3,4,5,3,1],3 →2; [0,1,2,4,2,1],3 →-1.

Python3 selector excerpt (exact full snippets in JSON):
```
class Solution:
    def findInMountainArray(self, target: int, mountainArr: 'MountainArray') -> int:
```
Provided interface excerpt: `get(self, index: int) -> int`, `length(self) -> int`. Python selected by preference because the official interactive interface is faithful; the submission must not implement/speculate about MountainArray internals. TypeScript also observed; no language fallback is needed. UI simulator reveals underlying values for instruction and does not execute Python or access a real judge.

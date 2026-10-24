# Official contract evidence

Source: https://leetcode.com/problems/data-stream-as-disjoint-intervals/
Public endpoint: https://leetcode.com/graphql/ (`question(titleSlug: ...)`).
Captured 2026-10-25 Asia/Singapore (2026-10-24T18:42:17.528648+00:00).
The access timestamp, HTTP 200 status, full public statement, official example,
and complete observed codeSnippets are preserved verbatim in official.json.
No authentication or paywall bypass was used. The normal official web page was
also read to confirm its statement, constraints and follow-up.

The observed Python3 selector entry provides precisely:

```python
class SummaryRanges:
    def __init__(self):
        ...
    def addNum(self, value: int) -> None:
        ...
    def getIntervals(self) -> list[list[int]]:
        ...
```

This is the preferred faithful interface, implemented in solution.py. The public
response also includes Python, JavaScript, TypeScript and other native languages;
none is needed as a fallback. Empty state is initialized by the constructor;
getIntervals returns ranges in ascending start order. Values are nonnegative
integers through 10000; there are at most 30000 calls total, at most 100 queries.
The official stream is 1,3,7,2,6, with successive summaries
[[1,1]], [[1,1],[3,3]], [[1,1],[3,3],[7,7]], [[1,3],[7,7]], [[1,3],[6,7]].
The follow-up asks about many merges and a small interval count. There are no
problem-specific modulus, object-identity or asynchronous exceptions.

These captures are review material and are not loaded by the lesson runtime.

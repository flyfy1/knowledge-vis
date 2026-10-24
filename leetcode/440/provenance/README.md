# Official contract observation

Access date: 2026-10-25 Asia/Singapore (timezone-qualified UTC request timestamp
in official-request.json). Official URL:
https://leetcode.com/problems/k-th-smallest-in-lexicographical-order/

The official page was readable. An anonymous public GraphQL question query also
returned HTTP 200, isPaidOnly=false, the complete statement, examples, constraints
and language-specific starter code. Raw response is official-response.json;
query/endpoint/status/time are in official-request.json. No authorization or
restricted content access was used.

Observed Python3 starter:

```python
class Solution:
    def findKthNumber(self, n: int, k: int) -> int:
```

The response additionally includes Python (legacy), TypeScript, JavaScript and
other native interfaces. Python3 is a faithful preferred submission interface;
no language fallback or conceptual adaptation is necessary. The complete observed
starter list is preserved in the raw response, not inferred from the category.

Contract: positive n and k, one-based rank in inclusive 1..n under decimal string
order, 1 <= k <= n <= 10^9; return an integer. Official fixtures are (13,2)->10
and (1,1)->1. No input mutation or other exception is required.

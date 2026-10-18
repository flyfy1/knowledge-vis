# Official contract capture

Source: https://leetcode.com/problems/distinct-subsequences/

Public source request and full unaltered question response (including every observed code selector): [official-graphql.json](official-graphql.json).
Accessed: 2026-10-18T11:08:49.301716+00:00. The GraphQL GET URL, query and variables are retained in that capture. It reports ID 115, Hard, isPaidOnly=false. Ordinary page HTTP via requests received 403 (metadata in official-access.json); the public GraphQL request succeeded without credentials or special access. The browser-reading tool also exposed the official statement.

Python3 selector excerpt:

```python
class Solution:
    def numDistinct(self, s: str, t: str) -> int:
```

The response also contains Python, JavaScript and TypeScript interfaces along with all other offered languages. Python3 is the preferred faithful submission interface; no language exception applies. The selected solution is solution.py. A non-Python language-contract.json is unnecessary.

Contract paraphrase: count order-preserving selections of source positions whose letters equal the target. Source and target lengths 1–1000, English letters; final result fits a signed 32-bit integer, no modulus. Examples rabbbit/rabbit=3, babgbag/bag=5. Empty strings in the tutorial are explicitly extra recurrence-boundary experiments, outside official input limits. No mutation, identity, asynchronous or external type requirements. No LeetCode submission was made.

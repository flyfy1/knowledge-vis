Official source: https://leetcode.com/problems/super-washing-machines/
Accessed: 2026-10-25T00:27:24.906855+00:00
Direct HTTP page returned 403 (capture retained); public GraphQL returned 200 with the full statement, constraints, examples and actual codeSnippets. No authenticated or paid access used.
Python3 observed interface:
```python
class Solution:
    def findMinMoves(self, machines: list[int]) -> int:
        
```
See official-graphql.json for the exact response and all observed interfaces. n=1..10^4; each count=0..10^5. Simultaneous sends: each chosen machine sends one dress to one neighbor; return minimum rounds or -1. Empty array is outside contract.

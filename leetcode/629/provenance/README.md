# Official contract capture

Access date: 2026-10-25 (UTC timestamp in official-graphql.json).
Exact official problem: https://leetcode.com/problems/k-inverse-pairs-array/

The public page was opened directly and its statement, examples, difficulty and bounds checked. The public GraphQL endpoint returned HTTP 200 without credentials or restricted access. The full query, variables, returned statement and all observed codeSnippets are preserved in official-graphql.json. This file is review evidence and is not loaded by the lesson.

Observed Python3 interface:

```python
class Solution:
    def kInversePairs(self, n: int, k: int) -> int:
```

The response also includes the older Python interface, plus TypeScript and JavaScript (and other languages; full unfiltered list retained in the JSON). Python3 is a faithful scalar-input/integer-output submission contract and has the highest language preference. No non-Python language decision or conceptual comparison is needed. The authored source uses this exact class and method signature. Local tests execute it directly; no LeetCode submission or acceptance is claimed.

The official n range is 1…1000; the empty construction used to seed DP is not an added official input. k is 0…1000, and may exceed the maximum feasible inversions for a small n. Arrays use every value 1…n exactly once. Pair positions are 0-based, ordered a<b; comparison is strict. Answers are counts modulo 1,000,000,007. Official examples (3,0)→1 and (3,1)→2 and both constraints are in the retained content. There are no problem-specific language exceptions.

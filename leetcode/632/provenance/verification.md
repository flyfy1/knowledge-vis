# Official source verification — 2026-10-25

Official page: https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/
Web browsing returned the public statement including both examples and constraints.
A direct requests HTML GET returned HTTP 403; no attempt was made to bypass it.
Public GraphQL GET https://leetcode.com/graphql/ with query below returned HTTP 200.
The full response is official-graphql.json, preserved as review evidence only.

```
{ question(titleSlug:"smallest-range-covering-elements-from-k-lists") {
  questionId title content isPaidOnly codeSnippets { lang langSlug code } metaData
} }
```

Observed isPaidOnly: false. Observed Python3 selector entry, langSlug python3:
```
class Solution:
    def smallestRange(self, nums: list[list[int]]) -> list[int]:
```
Observed metadata: smallestRange; nums list<list<integer>>; return integer[].
Full selector entries (including other languages) remain in the raw response.
Contract: non-decreasing nonempty integer lists, at least one per list in the
inclusive returned range; minimize b-a then a. k up to 3500; row length up to 50;
values -100000..100000. Both official examples retained in the raw response and
covered by tests. Python is the preferred faithful interface; no language
exception/contract fallback is needed. No actual LeetCode submission was made.

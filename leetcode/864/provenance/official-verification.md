# Official source verification

Accessed 2026-10-25T22:36:35.752075+00:00

Catalog URL: https://leetcode.com/problems/shortest-path-to-get-all-keys/

Public GET https://leetcode.com/graphql/ using question(titleSlug: "shortest-path-to-get-all-keys") with content, exampleTestcases, codeSnippets { lang langSlug code }. Raw response: official-graphql.json. Direct HTML request returned HTTP 403; the public GraphQL returned HTTP 200. Web tool also read the official description. No private access used.

Python3 selector and exact stub:
```python
class Solution:
    def shortestPathAllKeys(self, grid: list[str]) -> int:
        
```

Python3 is supported and preferred. The internal questionId is 895; frontend/catalog ID is 864. Official examples are 8, 6, -1. Grid dimensions 1..30; 1..6 unique keys from the first k letters, each with its matching lock, exactly one start. Goal: collect all keys, no obligation to traverse all locks. No zero-key input in the official domain.

# Official contract evidence

Access date: 2026-10-18. Exact catalog URL:
https://leetcode.com/problems/word-ladder-ii/

The page was read publicly and its public GraphQL response was saved as
`official.json`. The response includes the complete statement, both examples,
constraints, paid flag (false), and all observed `codeSnippets` language selectors.
No authentication or premium access was used.

Selected interface from the actual `Python3` / `python3` snippet:

```python
class Solution:
    def findLadders(self, beginWord: str, endWord: str, wordList: list[str]) -> list[list[str]]:
```

Python is officially supported and follows the requested preference. There is no
non-Python exception and no conceptual substitute. The complete observed snippets
also include TypeScript and JavaScript, but neither takes priority over Python.
The source in `solution.py` implements this exact callable contract. Its displayed,
copied and downloaded bytes are checked separately from the browser simulation.

Notable contract details: the start need not occur in the dictionary; every later
word must occur, including the end. Endpoints are distinct. There is no empty
word/list input in the stated constraints. All shortest sequences are requested,
not just one route or a distance. The official output-bound wording is retained
without pretending it makes output enumeration constant time. No return ordering
is specified; tests normalize outer order while checking every word of each path.

# Official verification — 2026-10-25 UTC
Public official page and public GraphQL returned the full free statement and language catalog.
Raw dated response: [official.json](official.json). Frontend ID 803 (internal ID 821).
Observed selector labels include Python3, Python, TypeScript and JavaScript; full catalog retained.
Python3 template: `class Solution: def hitBricks(self, grid: list[list[int]], hits: list[list[int]]) -> list[int]`.
No premium access used. Python is the preferred faithful submission interface.
Statement: top row or four-neighbor path to top is stable; direct erasure excluded,
empty erasure drops nothing. Fallen bricks disappear rather than landing.
Examples: [[1,0,0,0],[1,1,1,0]], [[1,0]] → [2];
[[1,0,0,0],[1,1,0,0]], [[1,1],[1,0]] → [0,0].
Constraints: dimensions 1..200; binary entries; hits 1..40000, in-bounds unique pairs.
There is no initial-stability guarantee in the observed statement.

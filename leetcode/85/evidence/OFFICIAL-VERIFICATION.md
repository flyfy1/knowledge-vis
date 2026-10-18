# Official contract verification — author evidence

Accessed 2026-10-18T10:45:34.123939+00:00.
Official catalog URL: https://leetcode.com/problems/maximal-rectangle/
The public page was opened, and the public `https://leetcode.com/graphql/` query
`question(titleSlug: "maximal-rectangle")` returned HTTP 200 without authentication.
Raw response and access timestamp are in `official.json`. No access bypass.

Observed: questionId 85, title Maximal Rectangle, isPaidOnly false. The statement
requests integer area of an axis-aligned all-one rectangle in a binary character
matrix. Rows/columns 1..200, equal-length rows, characters '0'/'1'. Official
examples yield 6, 0, 1. No mutation, returned coordinates, modulus, or additional
exception rules are requested. Empty input is outside constraints.

The response's actual `codeSnippets` selector includes Python3 with this template:

```python
class Solution:
    def maximalRectangle(self, matrix: list[list[str]]) -> int:
```

Observed metadata: name maximalRectangle, param matrix type character[][],
return integer. Python therefore faithfully supports the original submission;
the general Python preference applies. No non-Python fallback contract needed.
The raw selector also contains C++, Java, Python, JavaScript, TypeScript, C#, C,
Go, Kotlin, Swift, Rust, Ruby, PHP, Dart, Scala, Elixir, Erlang and Racket.

Canonical local implementation is solution.py. No submission was made; local
execution and browser simulations do not establish LeetCode acceptance.

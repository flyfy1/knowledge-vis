# Official contract capture

Accessed 2026-10-26. Exact catalog URL: https://leetcode.com/problems/super-palindromes/

The public official page returned frontend ID906, Hard, the positive-integer definition, inclusive [left,right], examples [4,1000]→4 and [1,2]→1, exception676 because its root26 is not a palindrome, and all five constraints. The public GraphQL capture in official.json contains the full response, status200 and timezone-qualified access time.

Request endpoint: https://leetcode.com/graphql/

```graphql
query {
  question(titleSlug: "super-palindromes") {
    questionId title titleSlug isPaidOnly content exampleTestcases
    codeSnippets { lang langSlug code }
  }
}
```

Observed Python3 / python3 snippet:

```python
class Solution:
    def superpalindromesInRange(self, left: str, right: str) -> int:
```

Python is supported and is the preferred canonical submission language. JavaScript and TypeScript snippets are also present; their availability does not displace Python. Complete language snippet evidence, including other official native interfaces, is retained in official.json. No premium access or paywall bypass was used; isPaidOnly=false. Internal questionId942 is not the frontend problem ID. The two inputs are immutable strings and the result is an integer count. No special mutation, ordering, async, schema or modulo semantics are specified.

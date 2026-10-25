# Official verification

Accessed 2026-10-25T08:01:41.886621+00:00.
Catalog source: https://leetcode.com/problems/prefix-and-suffix-search/

`official.json` is the unmodified response object from the public LeetCode GraphQL GET endpoint, wrapped with the access timestamp and exact request URL. Query fields are questionFrontendId, title, content and all codeSnippets (lang/langSlug/code). The capture identifies question 745 and includes its full public statement, sole official example, bounds, and actual Python3, TypeScript and JavaScript starter interfaces, among other languages.

Observed Python3 interface:

```python
class WordFilter:
    def __init__(self, words: list[str]):
        ...
    def f(self, pref: str, suff: str) -> int:
        ...
# obj = WordFilter(words)
# param_1 = obj.f(pref,suff)
```

Python is the first preferred faithful interface and is selected. The implementation uses typing.List[str], equivalent to the observed list[str] annotation, with the same constructor and method signatures. A non-Python language-contract exception is unnecessary.

Direct HTTP page fetch and POST GraphQL returned 403; ordinary headless navigation showed a security-verification page. No challenge was bypassed or credentials used. Public GET GraphQL succeeded. The official page was also read through the web tool and agreed with the saved GraphQL content. This capture is review evidence only and is never loaded by the lesson.

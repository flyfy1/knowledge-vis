# Official observation — author evidence

Access date: 2026-10-18 (+08:00). Exact source: https://leetcode.com/problems/word-break-ii/
The web reader opened the public description successfully. An ordinary Python urllib GET of that page returned HTTP 403. The public GraphQL endpoint https://leetcode.com/graphql/ returned HTTP 200 for both GET and POST without credentials. The captured response is official-graphql.json, not a runtime asset.

Query:
```graphql
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId title content exampleTestcases metaData
    codeSnippets { lang langSlug code }
  }
}
```
Variables: `{"titleSlug":"word-break-ii"}`.

Observed selector entry: `lang="Python3", langSlug="python3"`.
Observed interface excerpt:
```python
class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> list[str]:
```
The response also contains Python, JavaScript and TypeScript entries, among other languages. Python is selected by the prescribed preference, so no non-Python exception contract is necessary. `typing.List[str]` in the candidate is the equivalent annotation to official `list[str]`. The actual callable and return semantics are retained.

Observed metadata: wordBreak(string s, list<string> wordDict) returns list<string>. The statement requests all sentences, allows any order and word reuse. Complete official examples, constraints and source wording are retained in the response for review. No submission/acceptance result was obtained.

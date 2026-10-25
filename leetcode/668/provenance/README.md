# Official evidence
Observed 2026-10-25 (UTC; precise capture time below). No credentials or restricted access used.

Source: https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/
Public endpoint: https://leetcode.com/graphql/
Query: `query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionFrontendId title titleSlug isPaidOnly difficulty content exampleTestcases codeSnippets { lang langSlug code } metaData } }`
Variables: `{"titleSlug":"kth-smallest-number-in-multiplication-table"}`.
GET and POST both returned HTTP 200; saved POST JSON is official-graphql.json. Direct requests GET of problem HTML returned 403; web tool could read official description. No attempts to bypass restrictions.

Capture contains complete observed language snippets, statement, examples, bounds and metadata. Python3 snippet: `class Solution:` then `def findKthNumber(self, m: int, n: int, k: int) -> int:`. Python is faithful and preferred; TypeScript and JavaScript are also observed. Full other languages retained verbatim in capture. No non-Python fallback selected.

Evidence saved at 2026-10-25T03:03:25.724407+00:00

The Chinese title and lesson text are authored translations. This capture verifies the official English statement and interfaces; no official Chinese title was fetched.

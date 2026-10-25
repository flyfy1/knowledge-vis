# Official source verification

Accessed 2026-10-26 (Asia/Singapore, UTC+08:00), author run.
Catalog URL: https://leetcode.com/problems/delete-columns-to-make-sorted-iii/
Public statement independently opened at this URL. Capture `official.json` is the
unaltered response from a public GET (HTTP 200), without login or paid access:

`https://leetcode.com/graphql?query=query%20%7B%20question(titleSlug%3A%22delete-columns-to-make-sorted-iii%22)%20%7B%20questionId%20title%20difficulty%20isPaidOnly%20content%20exampleTestcases%20codeSnippets%20%7B%20lang%20langSlug%20code%20%7D%20metaData%20%7D%20%7D`

Observed Hard, isPaidOnly false. The codeSnippets selector returns Python3:
`class Solution: def minDeletionSize(self, strs: list[str]) -> int:` (with actual
newline/indentation in the JSON), legacy Python, JavaScript, TypeScript and native
languages. The complete selector response is retained, not a selected subset.
metaData names minDeletionSize, string[] parameter strs, integer return.
Chosen canonical Python3 faithfully implements that exact interface. No language
exception. Constraints and all three official examples are in the same capture.
One urllib GET attempt with a different query shape returned 403; the normal
public curl GET above succeeded. No authorization, paywall workaround or submission.

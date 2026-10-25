# Official access evidence

Access date: 2026-10-25 (UTC; precise HTTP capture timestamp in
`../tests/evidence/access-report.json`).

Source: https://leetcode.com/problems/split-array-with-equal-sum/

The author used the web reader on this exact official URL. It returned a
35-line description shell, a Log in button, and:

> Subscribe to unlock.

> Thanks for using LeetCode! To view this question you must subscribe to premium.

The reader reported a cached crawl from two days earlier. A separate current
unauthenticated HTTP request returned 403; its body is `../tests/evidence/page.html`.
These are distinct access observations, not a successful statement capture.

Public https://leetcode.com/graphql/ returned HTTP 200 for `questionData` with
`titleSlug: "split-array-with-equal-sum"`. The full request and timestamp are
recorded in `../tests/evidence/access-report.json`; the response body is
`../tests/evidence/graphql.json`. It identifies #548 as paid and returns null
for both `content` and `codeSnippets`. No official language selector/template,
constraints, or complete examples were accessible.

Next needed input: a normally authorized official capture covering the complete
statement and original submission interfaces, or an authorized environment
where those can be inspected. Do not provide credentials in lesson files.

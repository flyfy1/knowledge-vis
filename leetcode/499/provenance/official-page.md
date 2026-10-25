# Official page access observation

Access date: 2026-10-25 (UTC).
URL: https://leetcode.com/problems/the-maze-iii/
Method: normal web open, unauthenticated; no credentials or access workaround.

The rendered official page presented login and subscription controls. Its description
area displayed the following access message:

> Subscribe to unlock.
>
> Thanks for using LeetCode! To view this question you must subscribe to premium.

No statement, constraints, example explanations/outputs, or submission interface
were visible in the returned page. The separate public GraphQL capture is retained
in `official-access.json`; it confirms the identity and paid status, but returns
`content: null` and `codeSnippets: null`. Exposed sample inputs do not establish
the missing rules or expected outputs. This is an access blocker, not evidence
that Python or TypeScript is unsupported.

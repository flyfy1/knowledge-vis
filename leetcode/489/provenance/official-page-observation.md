# Official page access observation

Access date: 2026-10-25 (UTC).
Source: https://leetcode.com/problems/robot-room-cleaner/
Method: web tool `open` of the exact official URL, unauthenticated.

The rendered text contained the following access notice:

> Subscribe to unlock.

> Thanks for using LeetCode! To view this question you must subscribe to premium.

No statement, constraints, explained examples, or language selector/interface
was exposed in that view. This is a transcription of the web tool's extracted
page text, not a screenshot or a complete HTML capture.

The separate public GraphQL request returned HTTP 200, identified frontend
problem 489, and returned `isPaidOnly: true`, `content: null`, and
`codeSnippets: null`. See the unmodified response and request summary alongside
this file. Public metadata does expose sample inputs, a language list (including
python/python3 and typescript), and a TypeScript custom Robot type. Those partial
fields do not establish the missing official statement, constraints, exceptions,
or a verified Python submission signature. No language was selected.

An initial standard-library urllib request received HTTP 403; the ordinary
requests-library POST succeeded with HTTP 200. The saved successful request uses
no authentication, custom authorization headers, or protected alternate endpoint.

Recheck (requires Python requests and network access):

```sh
OUTPUT_DIR=/tmp/leetcode-489-access python3 -B leetcode/489/tests/check_official_access.py
```

This checks access, not algorithm correctness. Future authorized access may
produce a different result; preserve this dated capture.

# Official page observation

Accessed at 2026-10-25T05:27:42.659345+00:00 using the web tool, opening exactly:
https://leetcode.com/problems/max-stack/

The rendered text returned a login button, the Description/Editorial/Solutions/
Submissions/Code tabs, and the following access notice:

> Subscribe to unlock.

> Thanks for using LeetCode! To view this question you must subscribe to premium.

No official statement, constraints, example output, language selector, or code
interface was exposed in that observation. This is a textual web-tool observation,
not a browser screenshot or an authenticated subscriber capture.

The separate reproducible public HTTP capture is in `../tests/evidence/`.
Its page request received HTTP 403; its GraphQL request received HTTP 200 but
returned `content: null` and `codeSnippets: null`. These distinct observations
must not be conflated into a successful statement fetch.

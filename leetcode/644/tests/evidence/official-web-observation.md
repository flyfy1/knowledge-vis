# Official page observation — author access check

Access date: 2026-10-25 (UTC).
Source: https://leetcode.com/problems/maximum-average-subarray-ii/
Method: web tool open of the official URL, unauthenticated; text extraction.

The official page displayed a Log in button, Description / Editorial / Solutions /
Submissions / Code / Testcase / Test Result tabs, and this restriction:

> Subscribe to unlock.

No statement, constraints, expected example results, or actual language selector
was present in the extracted page. The page explained that viewing the question
requires premium. This is an author observation, not independent review.

The separate direct HTTPS request returned HTTP 403; see official-page.html.
The public GraphQL response returned HTTP 200 with null content,
translatedContent and codeSnippets; see graphql.json and access-result.json.
A returned generic metaData schema is not evidence of an available Python or
TypeScript submission interface. Test inputs alone do not establish the problem
contract or expected results.

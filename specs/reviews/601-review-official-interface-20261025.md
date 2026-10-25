# Dispatcher official-interface evidence — #601

Date: 2026-10-25. Candidate under independent review:
19aa80163e63c52809206f13fd78dd38ffb806ba. The reviewer reported that its environment
could read the official statement but not directly inspect the editor/language
selector. This document provides newly observed source evidence; it does not
rewrite that review, change the candidate, or record acceptance.

The dispatcher normally opened the public official page in the in-app browser,
without login, CAPTCHA solving or a browser-warning bypass. The visible language
menu listed MySQL, MS SQL Server, PostgreSQL, Oracle and Pandas. Selecting Pandas
showed `import pandas as pd` followed by the official
`human_traffic(stadium: pd.DataFrame) -> pd.DataFrame` callable. The screenshot
shows the #601 title, Pandas selection and starter together. No solution was typed,
run or submitted. The candidate uses the same named argument and return contract.

Separately, a normal unauthenticated POST to the official public GraphQL endpoint
returned HTTP 200 at 2026-10-25T02:52:53.532247+00:00, questionId 601, isPaidOnly
false, and the same codeSnippets entry. Its actual language slug is `pythondata`,
with displayed language `Pandas`. The initial local assertion incorrectly expected
slug `pandas`; the raw successful response was retained and the reproducer now
checks the observed label and correct slug. This was an assertion assumption,
not a failed official request or a changed lesson interface.

Evidence: [official-interface-dispatcher-20261025](601-evidence/official-interface-dispatcher-20261025/).
The response retains the exact request/query and timestamp; the UI observation
retains the visible language list, relevant accessibility excerpt and screenshot.
A fresh independent reviewer should assess these alongside the original official
provenance and canonical source. Its own normal recheck may use the documented
public endpoint or browser. Do not bypass access restrictions or infer a LeetCode
judge result from the interface evidence. Independent acceptance remains separate.

# Independent official-interface verification — #601

Date: 2026-10-25. Reviewer: separate `official_601_interface_review` agent.
Candidate: `19aa80163e63c52809206f13fd78dd38ffb806ba`.
Scope: required source-access finding `601-R1-ACCESS-01` only. This is not a full
lesson review or an acceptance decision.

**Result: the access finding now has sufficient independent evidence to close.**
I independently requested the official public GraphQL endpoint and opened the
[official problem page](https://leetcode.com/problems/human-traffic-of-stadium/)
through normal browser navigation. Neither observation depended on interpreting
the dispatcher's saved response as my own fresh access.

The new unauthenticated GraphQL request returned HTTP 200, question and frontend
IDs `601`, title `Human Traffic of Stadium`, difficulty `Hard`, and
`isPaidOnly: false`. Its `codeSnippets` list explicitly includes displayed language
`Pandas`, slug `pythondata`, with this starter:

```python
import pandas as pd

def human_traffic(stadium: pd.DataFrame) -> pd.DataFrame:
```

I also independently observed the public logged-out editor showing Pandas and
that same starter. Expanding its language selector showed MySQL, MS SQL Server,
PostgreSQL, Oracle, and Pandas. The saved screenshots and accessibility captures
record these direct observations. No solution was entered, run, or submitted;
no login, CAPTCHA action, or security-warning bypass was used. The first shell
attempt encountered sandbox DNS restrictions; the normal public request succeeded
after host network permission was granted, with no change to website access rules.

I extracted `leetcode/601/solution.py` directly from the exact candidate using
`git show`. Its import is `import pandas as pd`, and its callable name, positional
argument name and annotation, absence of defaults or extra arguments, and return
annotation match the official starter. The AST signature comparison passed.
Therefore Python with Pandas is an officially supported interface for this
problem; it is not merely a conceptual translation of a SQL-only interface.

Evidence is in
[`601-evidence/independent-interface-20261025/`](601-evidence/independent-interface-20261025/):
`verify.py` reproduces the public request and exact-candidate AST comparison;
`official-response.json` preserves request, timestamp, HTTP status, and response;
`comparison.json` and `candidate-solution.py` preserve the comparison inputs and
result; `ui-observation.json`, the two UI text captures, and their screenshots
preserve the separate browser observation.

Limits: I did not repeat the full algorithm, pedagogy, localization, accessibility,
or visualization review, and did not obtain an online judge result. This narrow
report does not replace the prior review or erase its access failure. A fresh
full reviewer should evaluate this added evidence and retain responsibility for
the final lesson verdict. No remaining source-interface uncertainty was found
within this scope at the recorded access time.

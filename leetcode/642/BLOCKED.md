# Official-source access blocker — #642

Author-run outcome: **blocked**, 2026-10-25. No independent acceptance claimed.
The problem remains in scope; shared registry/campaign/review records are untouched.

Official source: https://leetcode.com/problems/design-search-autocomplete-system/

Observed public access:

- Official page via web reader: Premium subscription notice; no problem contract.
- Raw official-page request: HTTP 403, saved in tests/evidence/official-page.txt.
- Public official GraphQL: HTTP 200, ID 642, Hard, isPaidOnly=true;
  content=null and codeSnippets=null. Sample inputs exist, but cannot verify
  expected outputs, constraints, exceptions or supported language interfaces.

Evidence and exact timestamp: [official-access.json](tests/evidence/official-access.json).
Raw response: [official-graphql.txt](tests/evidence/official-graphql.txt).
Page observation: [official-web-observation.md](tests/evidence/official-web-observation.md).

Reproduce from repository root (Python requests required):

```sh
OUTPUT_DIR=/tmp/leetcode-642-access python3 -B leetcode/642/tests/verify_official_access.py
```

This writes all captures to OUTPUT_DIR, leaving the frozen evidence untouched.
No credentials, authenticated browser profiles or paywall workarounds were used.

Required safe non-mutating preflight was run from the repository root:

```sh
python3 -B scripts/register_leetcode_lesson.py 642 --validate-only
```

Result: exit 2, missing leetcode/642/lesson-entry.json; exact output in
[preflight.txt](tests/evidence/preflight.txt). Metadata cannot honestly select a
verified canonical language until official interface evidence is available.
There is no complete candidate and no passing readiness claim. No registration
or shared-file repair was attempted.

Next needed input: authorized official statement capture including complete
examples/outputs, constraints and exceptions, and language selector/submission
interface captures with URL and access date. Verify offered Python and TypeScript
before selecting a fallback. An authorized normal access path is also sufficient;
do not send credentials in chat.

Algorithm/oracle execution, lesson browser/device/locale testing, screenshots,
source parity, contrast, independent review, submission acceptance and deployment
have not been performed. They remain required after source access is resolved.

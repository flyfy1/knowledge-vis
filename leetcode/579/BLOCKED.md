# Access blocker: #579

The official statement and supported submission interface could not be verified
through normally available unauthenticated official access on 2026-10-25.

- Official page web reader: premium subscription gate (see `provenance/web-reader-observation.md`).
- Direct official page GET: HTTP 403 (raw response retained).
- Public official GraphQL POST: HTTP 200; `isPaidOnly: true`, `content: null`,
  `translatedContent: null`, `codeSnippets: null` (raw request/response retained).
- Partial schema/sample data is insufficient to derive the required result or
  select a faithful official interface. Pandas metadata is present and must be
  investigated when authorized interface evidence is available; Python support
  has not been ruled out.

Next needed input: authorized official statement, constraints, examples and
exceptions, together with the full language selector and submission interface
captures. Do not supply account credentials. Keep #579 in scope.

## Checks actually run

From the repository root:

`OUTPUT_DIR=leetcode/579/tests/evidence python3 -B leetcode/579/tests/check_access_evidence.py`

Exit 0: confirms the saved official response has the access-blocking fields.
This is an offline evidence consistency check, not solution verification.
A reviewer can set OUTPUT_DIR to another directory without altering these files.

`python3 -B scripts/register_leetcode_lesson.py 579 --validate-only`

Exit 2: metadata validation failed because `leetcode/579/lesson-entry.json` does
not exist. Exact output is retained in `tests/evidence/preflight.txt`. Metadata
was deliberately not fabricated while language and problem semantics remain
unverified. Registration was not run.

No canonical solution or runtime lesson exists, so canonical execution, oracle,
browser, source-parity, contrast and zoom checks remain unperformed. No independent
lesson review, acceptance, registration, commit, push or deployment is claimed.

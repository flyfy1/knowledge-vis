# #158 — Author brief: blocked before implementation

Official title: Read N Characters Given read4 II - Call Multiple Times.
Official source: https://leetcode.com/problems/read-n-characters-given-read4-ii-call-multiple-times/
Category: computing / algorithms (collection: LeetCode). Stage: university.
Target reader: a bilingual Chinese/English reader learning to reconstruct and
implement the verified official problem contract.

## Product decision and inherited contract

Reuse the existing lesson pattern, shared tokens, locale and controls under
`specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher adjudication.
The website-design skill was read. No new layout or design review is claimed.
The smallest useful outcome is a complete causal lesson with an executable
canonical submission and reproducible author checks, followed by a separate
review run. That outcome cannot be authored from the currently visible official
information. #158 remains in scope.

## Verification blocker

On 2026-10-18 the exact official page displayed the premium subscription gate.
The normal public GraphQL request returned HTTP 200, confirmed identity and
`isPaidOnly: true`, but returned null for both content and codeSnippets.
See `tests/evidence/official-page-access.md`, `official-access.json`, and
`official-graphql-response.json`. The saved request can be reproduced using:

```
OUTPUT_DIR=/tmp/158-access python3 -B leetcode/158/tests/check_official_access.py
```

Unverified: full statement, constraints, examples and expected outputs, exceptions,
complete supported language selector, callable signature, and runtime semantics.
No canonical language is selected; a missing interface is not evidence that
Python or TypeScript is unsupported. No language contract or solution is invented.

Next required input: an authorized official capture of the full statement,
constraints, examples, exceptions, and language selector with submission stubs
(prefer Python, then TypeScript, then required native). A user-provided export
from their normally authorized session is sufficient; do not send credentials.

## Planning boundary

P0: resolve official access, then write the problem-specific five-field steps,
concept dependency/first-use table, tiny hand example, independent baseline,
causal invariant, reversible experiment, fresh prediction, and code mapping.
P1: reproducible oracle, boundary, bilingual browser and accessibility checks.
P2: no decoration planned. Highest-return slice: verify the contract first.
Deferred: all implementation until the official contract is available. Exact
shared token assignments and per-step terms depend on that implementation brief.
This document is an access-blocked brief, not a complete teaching design.

No runtime page, placeholder route, source, or registration metadata was created.
No algorithm, browser, contrast, source-parity or learner checks are claimed.
Independent acceptance and public delivery are not performed.

## Metadata preflight

Command from repository root:
`python3 -B scripts/register_leetcode_lesson.py 158 --validate-only`

Result: exit 2, missing `leetcode/158/lesson-entry.json`; see
`tests/evidence/metadata-preflight.txt`. This expected failure confirms that no
complete candidate exists. Readiness is blocked, not waived by the access issue.

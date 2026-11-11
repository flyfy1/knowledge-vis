# #759 · Employee Free Time — blocked author brief

Status: official-source verification blocked; no lesson candidate implemented.
Category: leetcode / algorithms. Stage: university.
Official URL: https://leetcode.com/problems/employee-free-time/
Target reader: a bilingual reader who knows basic programming and wants to
reconstruct the verified problem's algorithm and transfer it to executable code.

## Product and design boundary

Reuse the existing collection lesson pattern under the adopted contract in
`specs/reviews/leetcode-all-hard-design-review.md`, its dispatcher adjudication,
WORKFLOW, UI-I18N-SPEC, explainer, Hard trace, review gate, and rendered-state
specifications. The website-design skill was read. No new layout, shared asset,
registration or product decision is proposed. Implementation remains local to
`leetcode/759/`. The highest-return next step is a verified official contract.

## Source gate and observed evidence

On 2026-10-25 the official page exposed a premium subscription notice.
An ordinary HTTP GET returned 403. Public GraphQL returned HTTP 200 and verified
frontend ID 759 (internal question ID 761), the title and slug, `isPaidOnly: true`,
and sample input strings. However, `content` and `codeSnippets` are null.
The metadata lists python/python3 and typescript among other languages, but its
manual integer parameter/return placeholders do not verify a complete submission
interface. No canonical language has been selected. Missing Python support is
not the blocker.

Evidence: `tests/evidence/access-result.json`, `graphql-request.json`,
`graphql.json`, `official-page.html`, and `official-web-observation.md`.
Reproduce the unauthenticated access check with:

```sh
OUTPUT_DIR=/tmp/759-official-access python3 -B leetcode/759/tests/check_official_access.py
```

## Required input to resume

Provide a normally authorized official capture of the complete statement,
constraints, examples with outputs and explanations, exceptions, and actual
language selector plus starter interface (including supplied types). A capture
from an authorized Premium session can satisfy this gate; do not share credentials.
Sample inputs and a presumed title are insufficient to establish the contract.

After verification, write the full five-field outline for each necessary section
and the local term dependency table before implementation. Then derive the
baseline, invariant, hand trace, counterexample and fresh prediction exercise from
that contract. Their details are deliberately not inferred from the title.

## Scope and remaining work

P0: source/interface verification, full implementation brief, bilingual causal
lesson, canonical source and exact mirror, independent oracle, browser and
accessibility self-checks, metadata preflight, then separate reviewer run.
P1/P2: no refinements or decoration planned before P0.
Deferred: implementation and all solution/browser tests until source verification;
reason: rules and interface remain inaccessible. No placeholder page or metadata
is shipped, and #759 remains in scope. Shared palette and controls will be reused
exactly when implementation is possible.

There is no completed visual simulation, executable solution, self-checked lesson,
independent acceptance, actual learner result, submission acceptance or deployment.

## Metadata preflight

Executed from repository root on 2026-10-25:
`python3 -B scripts/register_leetcode_lesson.py 759 --validate-only`

Exit 2: `Metadata validation failed: [Errno 2] No such file or directory:
'/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/759/lesson-entry.json'`.

This is expected for an access-blocked record without a fabricated candidate.
The failure prevents readiness. No registration or campaign/review state changed.

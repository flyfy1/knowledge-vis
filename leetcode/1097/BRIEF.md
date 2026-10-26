# #1097 · Game Play Analysis V — author access blocker

- Scope: retain #1097 in the requested all-Hard campaign; no lesson implementation candidate exists yet.
- Author status: blocked on official statement and original submission-interface verification, 2026-10-27 Asia/Singapore (capture timestamps are UTC on 2026-10-26).
- Independent review: not performed; no independent acceptance claimed. This run is author-only.
- Official source: https://leetcode.com/problems/game-play-analysis-v/
- Verified metadata: official public GraphQL reports frontend ID 1097, title Game Play Analysis V, difficulty Hard, `isPaidOnly: true`.
- Category/stage: computing / university; catalog topics database and pandas. Canonical language remains unverified.

## Product/design boundary

Reuse the lesson pattern already approved and adjudicated in
`specs/reviews/leetcode-all-hard-design-review.md`; follow WORKFLOW, UI-I18N-SPEC,
the explainer, trace, review-gate and rendered-state contracts, and the website-design skill.
No new layout or shared framework is proposed. Only this problem directory is owned.
The highest-return prerequisite is the exact authorized official contract.

P0: obtain the statement, examples with expected outputs, constraints/exceptions,
and actual language selector plus starter interface before choosing a language or
writing a solution. Then write the full causal per-step BRIEF with all five fields,
term dependency table, exact inherited token contract, and test plan before implementation.
P1: bilingual reversible experiments, a fresh prediction, source mapping and reproducible checks after P0.
P2: no optional decoration planned.
Deferred: all runtime implementation and metadata until the problem contract is verified;
publication and independent acceptance belong to separately authorized runs.

## Observed access and limits

The official page through the web reader displays “Subscribe to unlock.” and
“To view this question you must subscribe to premium.” Direct unauthenticated HTTP
GET returns 403 with a Cloudflare challenge; no challenge bypass was attempted.
The normal public GraphQL POST returns HTTP 200, `content: null` and
`codeSnippets: null`. The response includes an Activity table sample and schema
metadata, including a `pythondata` hint. That hint is not a verified Python callable
interface or a complete language selector. Do not infer SQL-only support, omit
possible Python support, invent expected outputs, or derive the contract from the title.

Evidence: `tests/evidence/official-access.json`, `official-page.response`,
`official-graphql.response`, `graphql-request.json`, and `web-reader-access.md`.
The reproducible public-only capture is `python3 -B leetcode/1097/tests/check_official_access.py`;
set OUTPUT_DIR to a reviewer-owned directory to preserve frozen evidence. Cookie/auth
response headers are excluded. No account credentials are read or used.

## Next needed input

Provide the official statement (schema, keys, null/duplicate and ordering rules,
required outputs, precision rules, constraints, examples and explanations) and
complete language-selector/starter-code evidence obtained through normally
authorized LeetCode Premium access, with source and capture date. Alternatively,
make that official content available through an authorized connected session.
Do not share credentials. The author can then select Python > TypeScript > required
native based on the actual interfaces and implement the lesson.

## Validation boundary

Only official access checks have run. No executable solution, browser lesson,
source parity, numerical oracle, learner trial or independent review exists.
No placeholder page, invented language-contract.json, or lesson-entry.json is supplied.
The required non-mutating metadata preflight is recorded in
`tests/evidence/metadata-preflight.txt`; its expected failure reflects the missing
candidate and prevents readiness. This blocker remains in scope.

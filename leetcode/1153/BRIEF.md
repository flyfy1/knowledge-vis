# #1153 · String Transforms Into Another String

## Status and ownership

Author run: blocked at official-contract verification. Independent lesson review:
not performed; no independent acceptance, learner results, LeetCode submission,
or publication is claimed. Problem #1153 remains in scope.
Only `leetcode/1153/` is owned by this run.

Official source: https://leetcode.com/problems/string-transforms-into-another-string/
Official GraphQL confirms frontend ID 1153, Hard, paid-only. Owner category:
algorithms. Collection category: leetcode; stage: university.
Target reader: a programmer who knows basic Python and wants to reconstruct an
algorithm, predict its behavior, and transfer its invariant to executable code.

Product-fit verdict: reuse the approved existing bilingual lesson pattern and
exact shared tokens, `leetcode/common.js`, `leetcode/style.css`, and controls.
Design authority: `specs/reviews/leetcode-all-hard-design-review.md` and dispatcher
adjudication. Those approvals concern the reused pattern, not this lesson's
acceptance. The website-design skill and all owner-listed workflow/specification
files were read. No new layout or independent review was commissioned.

## Official access evidence

Capture timestamp: see `tests/evidence/access-summary.json` (timezone-qualified UTC;
2026-10-27 in Asia/Singapore).

- Official URL opened with the web tool displays “Subscribe to unlock.” and
  “To view this question you must subscribe to premium.” The text observation is
  preserved in `tests/evidence/official-web-observation.md`.
- Ordinary direct HTTPS GET returned HTTP 403; raw response is
  `tests/evidence/official-page.html`.
- Ordinary public GraphQL returned HTTP 200 with `content: null` and
  `codeSnippets: null`; exact request and response are retained in
  `tests/evidence/graphql-request.json` and `official-graphql.json`.
- GraphQL exposes callable metadata `canConvert(str1: string, str2: string)`
  returning boolean, plus example input strings. It does not provide example
  outputs, constraints, exceptions, full semantics, language selector, or actual
  language-specific submission templates. Metadata alone does not verify Python
  or any other supported submission language.

No credentials were accessed, authenticated session was inspected, paywall was
bypassed, third-party statement was substituted, or title-based contract inferred.
No language-contract.json was fabricated and no canonical language is selected.

## Next required input

Normally authorized access to the complete official premium statement, or an
owner-supplied authorized capture including constraints, examples with outputs,
exceptions, the actual language selector and relevant submission templates.
Verify those before selecting Python > TypeScript > required native language.
Any non-Python selection must have the requested complete language-contract.json
and faithful selector/interface evidence.

## Teaching brief pending verified contract

The intended learning loop is concrete hand calculation → causal derivation →
reversible experiment → fresh prediction → canonical-code mapping. Its actual
examples, baseline, invariant, proof, boundaries, cost, terminology dependency
map, and per-section five fields cannot be honestly specified yet. Complete
those fields from the verified statement before any lesson implementation.
Five sections remain a default, not an imposed optimization narrative.

P0 / highest-return slice: obtain the official contract and supported interfaces;
then write the complete teaching brief and implement the existing bilingual flow.
P1: independent oracle, intermediate invariants, canonical execution, exact source
parity, real-browser controls/locales, responsive/zoom, keyboard and contrast checks.
P2: optional decoration only after required checks pass.
Deferred: lesson code, metadata, and all runtime checks until the contract is
verified; independent teaching review until a complete frozen candidate exists.
The access blocker does not reopen approved product/design decisions.

Workflow status stays in this BRIEF and evidence records. Future learner UI
should explain stable simulation/language limits, without author/review badges.
No placeholder route, invented solution, or fake-completion metadata was created.

## Author checks and limits

Executed ordinary access probe:
`python3 -B leetcode/1153/tests/check_official_access.py`.
It captured GET 403 and GraphQL 200 with null statement/templates. To rerun without
changing frozen evidence, set `OUTPUT_DIR=/tmp/1153-access`.

Executed safe non-mutating metadata gate from repository root:
`python3 -B scripts/register_leetcode_lesson.py 1153 --validate-only`.
Exit 2: `Metadata validation failed: [Errno 2] No such file or directory:
'/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/1153/lesson-entry.json'`.
This is an incomplete-candidate failure, not readiness. See `tests/evidence/preflight.json`.
No registration, campaign status, prior review, or shared asset was changed.

Canonical execution, oracle/exhaustive tests, browser interaction, screenshots,
contrast, localization and source/download parity: not run because no verified
lesson candidate exists. This run supplies access evidence, not a completed
lesson or an independent review.

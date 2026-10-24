# #425 · Word Squares — blocked author brief

Status: blocked before implementation; retained in scope. This is an author
access check, not a lesson candidate or independent acceptance.

Category: computing / LeetCode algorithms. Stage: university.
Reader: a programmer seeking a bilingual interactive explanation and executable
official submission. The intended outcome remains one complete lesson.

## Approved product boundary

Reuse `/leetcode/425/`, shared `../common.js`, `../style.css`, exact shared tokens,
locale behavior, and the existing lesson controls. The design review and dispatcher
adjudication are in `../../specs/reviews/leetcode-all-hard-design-review.md`.
The website-design skill was read at
`/home/songyy/Documents/agent-skills/website-design/SKILL.md`.
No new layout, framework, shared file, or registry change is proposed.

## P0: verify the official contract

Official source: https://leetcode.com/problems/word-squares/

Access date: 2026-10-25 Asia/Singapore (2026-10-24 UTC).
The official page exposed the premium subscription gate rather than a statement.
The ordinary unauthenticated public GraphQL request returned HTTP 200 with
`isPaidOnly: true`, `content: null`, and `codeSnippets: null`.
It exposed sample inputs and method metadata but no statement, constraints,
example outputs, exceptions, or actual language selector/submission snippets.
Method metadata alone does not verify Python support or its callable interface.

Evidence: `tests/evidence/official-page-access.md`, `graphql-request.json`,
`graphql-response.txt`, and `graphql-access.json` in the same evidence directory.
The latter three are raw request/response evidence, not runtime assets.

## Blocked teaching design

The highest-return next step is authorized source verification. No concrete
example, baseline, invariant, costs, concept dependency table, or per-step
five-field teaching plan is asserted before the underlying rules are verified.
The title and sample inputs are insufficient to derive that contract.
P1 (bilingual lesson and canonical solution) and P2 (optional polish) are deferred
until that evidence exists. No placeholder page or guessed metadata is shipped.

Next needed input: an authorized official statement capture containing all
constraints, examples and exceptions, together with the actual language
selector and submission starter interface, or normally available authorized
access to those materials. Do not supply credentials in this repository.
After verification, complete this brief before implementation, select Python
when its official interface is supported, and perform all requested computational,
browser, source-parity and metadata checks. A separate review remains required.

## Verification boundary

Only source access and the non-mutating preflight have been checked. No solution,
browser lesson, oracle, contrast audit, or learner result exists in this attempt.
See `tests/evidence/preflight.txt` for the expected incomplete-candidate failure.

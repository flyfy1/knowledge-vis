# #644 · Maximum Average Subarray II — blocked author brief

Status: blocked before implementation; problem remains in scope. No complete
candidate, lesson acceptance, independent review, or LeetCode submission is claimed.

## Product and design contract

Reuse the existing LeetCode lesson surface, shared controls, locale and exact
shared tokens under specs/reviews/leetcode-all-hard-design-review.md and its
dispatcher adjudication. Category: computing / LeetCode algorithms; stage:
university. Target reader: a programmer seeking a hand-calculable explanation,
a reversible experiment and transfer to the verified canonical submission.
Product-fit verdict: reuse, once the official contract is accessible.
The existing pattern's design approval does not verify this problem's statement.

## Official-source gate

Official URL: https://leetcode.com/problems/maximum-average-subarray-ii/
Access checked: 2026-10-25; exact UTC timestamp in tests/evidence/access-result.json.
The official web extraction displays the premium restriction. Public GraphQL
confirms frontend ID 644, title and isPaidOnly=true, but returns content=null,
translatedContent=null and codeSnippets=null. Direct page HTTPS returns 403.

The response exposes sample input strings and generic findMaxAverage metadata
(nums: integer[], k: integer; return: double). Those fields do not establish the
statement, constraints, tolerance/exceptions, expected example results, or the
actual supported-language selector. No language is selected from this evidence.
No non-Python language-contract.json is fabricated.

Evidence: tests/evidence/official-web-observation.md, graphql-request.json,
graphql.json, official-page.html, and access-result.json.
Reproduce from repository root:

    OUTPUT_DIR=/tmp/leetcode-644-access python3 -B leetcode/644/tests/check_official_access.py

This reads only ordinary public endpoints and emits into OUTPUT_DIR. It uses no
credentials or cookies. Endpoint responses may change; retained evidence captures
the access result at the stated timestamp.

## Scope and next input

P0 / highest-return work: establish the official statement and actual language
interface before choosing an algorithm or writing teaching copy. Needed input:
an authorized official capture containing the full statement, constraints,
examples with expected outputs, error tolerance or exceptions, and the actual
language selector plus Python starter interface (or full observed alternatives).
Do not send credentials. An authorized premium-session capture can unblock this
without granting the author access to any account.

P1: after verification, derive a baseline and invariant, then write the complete
step plan (known facts; single question; input and requested quantity; control
and observation; applicable conditions) and local first-use terminology table.
These remain pending because deriving them from the presumed title would violate
the task's source contract.
P2: optional presentation refinement after causal and bilingual checks pass.
Deferred: implementation, concept dependencies, examples, numerical oracle,
canonical source/mirror, metadata, browser lesson checks and independent review.
The reason is missing official contract evidence, not a reduction in scope.

## Verification boundary

Only official-access checks have run. There is no lesson UI or canonical source
to exercise, no browser/algorithm pass, no measured learner result and no separate
review. Non-mutating metadata preflight is recorded in
 tests/evidence/preflight.txt; absent candidate metadata must prevent readiness.
No registry, shared assets, campaign state, or acceptance records were changed.

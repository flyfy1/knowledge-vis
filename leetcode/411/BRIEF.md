# #411 · Minimum Unique Word Abbreviation — blocked author brief

Status: **Blocked before implementation**. This problem remains in scope.
Official URL: https://leetcode.com/problems/minimum-unique-word-abbreviation/
Access date: 2026-10-25 Asia/Singapore (UTC timestamp in evidence).

## Product contract

Reuse the existing bilingual LeetCode lesson pattern, as approved in
`specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher adjudication.
Apply `WORKFLOW.md`, `UI-I18N-SPEC.md`, both explainer/trace specifications,
`specs/leetcode-review-gates.md`, and the website-design skill read at
`/home/songyy/Documents/agent-skills/website-design/SKILL.md`.
Category: leetcode (computing learning content); stage: university.
Target reader: a reader with basic programming knowledge seeking to reconstruct
and implement this problem's verified algorithm.
Product-fit verdict: reuse the existing lesson route; no new product or framework.

## Source verification gate

The normal official page displays “Subscribe to unlock” and says a Premium
subscription is needed to view this question. Normal anonymous public GraphQL
returns HTTP 200 with questionId `411`, the matching title and slug,
`isPaidOnly: true`, **`content: null` and `codeSnippets: null`**.
`exampleTestcases` contains sample inputs only; no expected outputs or explanatory
contract was supplied. These inputs cannot establish the statement or exceptions.

Evidence: `tests/evidence/official-page-observation.md`,
`tests/evidence/official-graphql-request.json`,
`tests/evidence/official-graphql-response.json`, and
`tests/evidence/access-result.json`.

Consequently the definition, abbreviation length metric, constraints, examples'
expected outputs, exceptional cases, and supported callable interfaces remain
unverified. No canonical language is selected. No language-contract.json or
lesson-entry.json is fabricated. Python preference alone is not proof of support.
No lesson page, submission, mathematical narrative, or runtime mirror is produced
from the presumed title or third-party reconstructions.

## Scope and priorities

P0 / highest-return slice: obtain the complete official statement, constraints,
examples and language selector/starter interface through normally authorized
access. Then write the complete problem-specific learning loop, step fields and
term dependency table **before** implementation.
P1: implement the approved pattern with exact shared tokens and bilingual state
preservation; validate original-language solution and independent oracle.
P2: optional refinements only after core interaction and accessibility evidence.
Deferred: all teaching steps, token-role inventory, concept dependencies, causal
proof, counterexample, hand example, prediction exercise, renderer and browser
matrix. Their correct content depends on the unavailable contract. No simulated
trace or source code has been claimed as execution evidence.

## Resume input and validation

Needed input: an authorized official capture of the full statement (including
examples, constraints and exceptions) and official selector/starter code showing
supported submission languages and callable signature, or normally available
authorized access to those materials. Do not send plaintext credentials.

Recheck without mutating this frozen evidence:

```sh
OUTPUT_DIR=/tmp/leetcode-411-access-recheck python3 -B leetcode/411/tests/check_official_access.py
```

The script records observed availability; exit 0 only means the access probe ran,
not that a lesson passed. No algorithm/browser/self-check or independent review
has occurred. No acceptance, registration, deployment or learner outcome claimed.

Metadata preflight executed from the repository root:
`python3 -B scripts/register_leetcode_lesson.py 411 --validate-only`.
Result: exit 2, missing `leetcode/411/lesson-entry.json`; output saved in
`tests/evidence/metadata-preflight.txt`. This is expected for a source-blocked
problem with no fabricated lesson candidate and prevents a readiness claim.

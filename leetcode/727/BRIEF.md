# #727 · Minimum Window Subsequence — blocked author brief

Status: blocked at official-contract verification; no lesson candidate authored.
This is an author access report, not independent acceptance or a completed lesson.

## Product boundary and approved design

Reuse the existing LeetCode lesson route and shared tokens/controls under
`specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher adjudication.
Category: algorithms (collection category leetcode); stage: university.
Target reader: a learner with basic programming knowledge seeking to reconstruct
and implement this problem's actual official algorithmic contract.
Smallest useful outcome: a bilingual causal lesson with a reversible experiment,
fresh prediction, canonical source, and reproducible correctness/browser checks.
The useful delivery remains in scope; official access blocks its specification.

The website-design skill at
`/home/songyy/Documents/agent-skills/website-design/SKILL.md` and all seven requested
repository policy/design documents were read. Existing approval covers reuse;
no new design review or independent lesson acceptance is claimed.

## Verified facts and missing contract

Official URL: https://leetcode.com/problems/minimum-window-subsequence/

See `tests/evidence/access-summary.json` for the timezone-qualified capture time,
`graphql-request.json` and `graphql-response.json` for the actual official query
and response, and `official-page-observation.md` for the rendered page observation.
The ordinary public GraphQL endpoint returned HTTP 200, frontend ID 727, the
requested title/slug, isPaidOnly=true, content=null, and codeSnippets=null.
The official page said “Subscribe to unlock.”

Public exampleTestcases supplies inputs only. It does not establish example
outputs, tie-breaking, constraints, exceptional cases, supported languages or the
callable signature. None of these missing details is inferred from the title,
prior familiarity, or third-party mirrors. No canonical language is selected.

## Next required input

Provide normally authorized access to the official statement and actual language
selector/starter interface, or an authorized official capture containing the full
statement, constraints, examples with outputs, exceptions/tie rules, and supported
submission interfaces. Do not send credentials. Once available, verify Python >
TypeScript > required native, complete the problem-specific five-field step plan
and local terminology table, then implement under the approved shared design.

## Priorities and deferred work

Highest-return slice / P0: verify the contract before generating instructional
content; then implement and validate the full bilingual learning loop.
P1: refinements supported by the verified problem and interaction evidence.
P2: optional decoration only after P0 checks pass.
Deferred: step sequence, numerical core, source, metadata, UI, numerical/oracle
checks, browser checks, and contrast measurements, because their correctness
cannot be assessed against an inaccessible official contract. No fake route or
placeholder lesson was created. No runtime assets or language contract are claimed.

## Author checks actually run

- `python3 -B leetcode/727/tests/check_official_access.py`: succeeded as an access
  capture; result **blocked**, not a solution test pass. Supports `OUTPUT_DIR` for
  reviewer reruns without modifying this evidence.
- From repository root,
  `python3 -B scripts/register_leetcode_lesson.py 727 --validate-only`: exit 2,
  missing `leetcode/727/lesson-entry.json`. Expected for this blocked, unbuilt
  lesson; readiness gate did not pass. No registration was run.

No solution, browser interaction, learner outcome, deployment, or independent
review has been tested or claimed. Changes are confined to `leetcode/727/`.

# #568 · Maximum Vacation Days — authoring blocked

Status: blocked at official-contract verification; no lesson candidate or independent acceptance.

## Scope and approved design

- Official source: https://leetcode.com/problems/maximum-vacation-days/
- Requested category: algorithms; collection category: leetcode; stage: university.
- Intended reader: a programmer seeking a bilingual, interactive explanation and a faithful official submission.
- Reuse verdict: reuse the existing lesson shell, common controls and exact shared tokens, under `specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher adjudication. No new layout or platform is proposed.
- Read the requested workflow, UI, explainer, trace, review, rendered-state and design-review specifications, plus `/home/songyy/Documents/agent-skills/website-design/SKILL.md`. The website-design process applies to resumed implementation; its previously approved reuse contract remains in force.
- Ownership: only this lesson directory. No registry, shared asset, campaign record, credential, service or other lesson changes.

## Source verification — 2026-10-25

The normal official page exposes a subscription notice instead of the statement.
An unauthenticated request to the ordinary public GraphQL endpoint returned HTTP 200:
`questionFrontendId = "568"`, `isPaidOnly = true`, `content = null`, and `codeSnippets = null`.

The response includes input-only sample strings and generic metadata naming
`maxVacationDays(flights: integer[][], days: integer[][]) -> integer`.
This is not evidence of a Python/TypeScript/native selector or its exact submission
wrapper. No supported language is selected. No language contract is fabricated.
The formal statement, constraints, exceptions, sample explanations and expected
outputs remain unverified. Input samples alone cannot establish the problem rules.

Evidence: [official page observation](provenance/official-page-observation.md),
[request](provenance/graphql-request.json),
[access receipt](provenance/graphql-access.json), and
[raw response](provenance/graphql-response.txt).

## Implementation brief boundary

The learning loop, hand calculation, baseline, invariant, counterexample,
transfer exercise, canonical source, complexity, concept dependencies and per-step
five-field plan depend on the missing official contract. They are deliberately
not invented from the title or a remembered version of the problem.

On resumption, write each step's known information, single question, inputs and
desired quantity, control/expected observation, and applicability conditions;
define each new term locally. Preserve state on locale changes and distinguish
the visual simulation from actual solution execution.

## Priorities and next input

- P0 / highest-return prerequisite: obtain a normally authorized official capture
  of the complete statement, examples with expected outputs, constraints and
  exceptions, together with the language selector and exact Python starter code
  if offered (otherwise the supported interfaces). Include the official URL and
  access timestamp. An owner-provided authorized export is sufficient input for
  renewed verification; no credentials should be sent.
- P1: after verification, complete the problem-specific bilingual learning loop,
  source mirrors and independent numerical/browser self-checks, then freeze a
  candidate for the separate reviewer.
- P2: no optional decoration planned.
- Deferred: implementation, metadata, numerical oracle, browser interactions and
  source-parity checks until the source contract is verified. Their absence is
  a blocker, not a passing self-check. Independent review and publication are
  outside this author run.

## Reproduction and readiness

`python3 -B leetcode/568/tests/check_official_access.py` repeats only the normal
unauthenticated public request. Set `OUTPUT_DIR` to preserve frozen evidence.
No cookies, credential stores or alternate paid-content sources are used.

The metadata preflight command and result are recorded separately in
`provenance/metadata-preflight.txt`. No registration is performed.

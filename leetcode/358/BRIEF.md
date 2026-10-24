# #358 · Rearrange String k Distance Apart — blocked author brief

Status: official-contract access blocked; no lesson candidate implemented.
Category: computing (collection: LeetCode); stage: university.
Target reader: a bilingual reader with basic programming knowledge who wants to
reconstruct the verified algorithm and transfer it to the official interface.

## Approved product/design contract

Reuse the existing collection and problem-local lesson pattern, as approved in
../../specs/reviews/leetcode-all-hard-design-review.md and its dispatcher
adjudication. Follow ../../WORKFLOW.md, ../../UI-I18N-SPEC.md,
../../specs/leetcode-explainers.md, ../../specs/leetcode-hard-traces.md,
../../specs/leetcode-review-gates.md and the website-design skill at
/home/songyy/Documents/agent-skills/website-design/SKILL.md.
No new layout or shared framework is proposed. Future implementation will reuse
the exact shared style tokens and common locale controls. No CSS or runtime UI
has been authored while the official contract is inaccessible.

## Verified source and blocking evidence

Official URL: https://leetcode.com/problems/rearrange-string-k-distance-apart/

On 2026-10-25 the public official page required Premium access. The public
GraphQL response identified frontend ID 358, matching title and slug, and
isPaidOnly=true, but content=null and codeSnippets=null. It exposed example input
strings and generic metadata naming rearrangeString with s:string, k:integer and
a string return. Those fields do not establish the statement, example outputs,
constraints, exceptions, supported languages or actual language-specific starter
interface. Python support has therefore not been verified or rejected.

Evidence: provenance/official-page-observation.md and tests/evidence/.
No credentials were read, no authentication was attempted, and no paywall bypass
was used. The problem remains in scope.

## Planned learning loop and priority

Highest-return slice / P0: obtain the authorized official contract; then derive
one tiny hand calculation, a correct independent baseline, maintained-state
invariant and proof, reversible experiment, fresh prediction, and executable
canonical source with bilingual explanations and reproducible verification.
Done means the complete candidate passes author checks and metadata preflight;
separate independent review remains required afterward.

P1: only refinements supported by the verified lesson behavior and review.
P2: optional decoration, deferred until a demonstrated learning need exists.
Deferred: problem-specific step count, terminology dependencies, per-step five
fields (known information, single question, input/output, action/observation,
validity conditions), concrete presets, boundaries, costs, and language choice.
Reason: filling them now would infer the hidden contract from its title.
The unlock condition is verified official content and submission interface.

## Next required input and verification boundary

Provide a normally authorized official capture/export of the full statement,
constraints, examples with outputs, exceptions, and actual language selector and
starter interface (including supported Python/TypeScript options). Include the
official URL and capture date. Do not send credentials. An authorized official
source made accessible to this run also resolves the blocker.

After access is resolved, write the full problem-local teaching brief before
implementation; select Python > TypeScript > required native from evidence.
No solution, browser trace, lesson metadata, independent acceptance or LeetCode
submission result is claimed. Author checks are limited to the access capture
and recorded non-mutating preflight; computational/UI checks cannot run before
an implementation exists.

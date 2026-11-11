# #1063 · Number of Valid Subarrays — author access blocker

## Status and scope

- Author run: Codex, 2026-10-26; exact model identifier unavailable.
- Author outcome: blocked before implementation; no complete lesson candidate.
- Independent problem review: not performed; no independent acceptance claimed.
- Problem remains in scope. No registry, campaign state, shared assets, or release records changed.
- Category: computing (catalog categories: algorithms); stage: university.
- Intended reader: basic Python loops, arrays, and indexing; wants to reconstruct a faithful official solution.
- Official URL: https://leetcode.com/problems/number-of-valid-subarrays/

## Approved design boundary

Reuse the existing bilingual lesson pattern and exact shared tokens, under
`specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher adjudication.
No new product/design review is claimed. Read WORKFLOW.md, UI-I18N-SPEC.md,
all requested explainer/trace/review/rendered-state specifications, the archived
design review, and `/home/songyy/Documents/agent-skills/website-design/SKILL.md`.
The problem-specific teaching sequence and token inventory cannot be finalized
before the official problem contract is known. No implementation began.

## Source verification and blocker

Anonymous official access checked on 2026-10-26; see
`tests/evidence/access-result.json`, `graphql-request.json`, `graphql.json`, and
`official-page.html`. The direct page capture returned HTTP 403. The web reader
independently displayed the Premium subscription gate; its extracted text is
recorded in `tests/evidence/official-web-reader.txt`.

The normal public GraphQL request returned HTTP 200 and verified frontend ID
1063 (internal questionId 1061), title, slug, Hard difficulty, and isPaidOnly=true.
It returned content=null and codeSnippets=null. It exposed three example inputs
and language-neutral metadata: validSubarrays(nums: integer[]) -> integer.
Those fields do not establish the statement, constraints, example outputs,
exceptions, or available Python/TypeScript/native language submission interfaces.
No language choice, solution, examples, invariant, or complexity is inferred.
No cookies, credentials, paywall bypass, or third-party reconstruction were used.

Next needed input: an authorized capture of the full official statement,
constraints, all examples with outputs/explanations, and actual language selector
plus submission starter/interface excerpts (with source URL and capture date).
Do not send credentials. Resume the normal authoring loop after that evidence
can be verified.

## Planned learning loop and priorities (pending source access)

Highest-return slice / P0: verify the contract, then concrete hand calculation →
causal derivation → reversible local simulation → fresh prediction/reveal →
canonical source mapping, with bilingual state and numerical/browser checks.
P1: useful boundary presets after the actual boundaries are verified.
P2: no decoration is required by this lesson.
Deferred: all runtime implementation and problem-specific terms, per-step five
fields, independent baseline, invariant/proof, costs and metadata until source
access is resolved. Their engineering dependency is the official contract;
filling them from the title would invent the problem.

Expected eventual outputs: index.html, app.js, copy.js, canonical source and exact
mirror, lesson-entry.json, numerical core if needed, and reproducible tests.
A non-Python choice additionally needs a verified language-contract.json.
Transient author/review status belongs here and in evidence, never lesson UI.
The eventual simulation must explicitly distinguish itself from executing the
canonical submission and disclose teaching snapshot costs.

## Checks and limits

Access probe is reproducible:
`OUTPUT_DIR=/tmp/1063-access python3 -B leetcode/1063/tests/check_official_access.py`.
OUTPUT_DIR redirects all emitted captures for reviewer reruns.

Required non-mutating metadata preflight was run from repository root:
`python3 -B scripts/register_leetcode_lesson.py 1063 --validate-only`.
Exit code 2: `Metadata validation failed: [Errno 2] No such file or directory:
'/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/1063/lesson-entry.json'`.
This is an incomplete blocked attempt, not a metadata pass or review candidate.
No fabricated metadata was created to clear the gate.

Algorithm/oracle, browser, bilingual layout, contrast, source transfer, and
submission checks are not performed because no verified implementation exists.
No actual learner outcomes, LeetCode acceptance, deployment, or independent
review are asserted.

# #1127 · User Purchase Platform — author access blocker

## Status and scope

- Author status: blocked before lesson implementation; the official statement and submission interface are inaccessible in the available public access context.
- Independent lesson review: not performed; no acceptance claimed. This is an author run only.
- Product/design contract: reuse the existing lesson pattern approved in `../../specs/reviews/leetcode-all-hard-design-review.md` and its dispatcher adjudication. No new layout or shared framework is proposed.
- Category: computing (LeetCode collection); stage: university. Supplied problem categories: database, pandas.
- Official source: https://leetcode.com/problems/user-purchase-platform/
- Problem remains in scope. No registry, campaign, release, or historical review record is modified.

## Verified access boundary

On 2026-10-27, the official page exposed a subscription gate. The ordinary public GraphQL request returned `isPaidOnly: true`, `content: null`, `translatedContent: null`, and `codeSnippets: null`. A sample input and SQL setup were visible, but those do not establish the requested output, constraints, exceptions, or full language selector. See `tests/evidence/official-access.md` and the raw response beside it.

Do not infer the task from the title or the visible input. In particular, Python/Pandas support, callable signature, SQL dialect choices, uniqueness, nullability, duplicates, ties, and output ordering have not been verified. No canonical language or language-contract.json is fabricated.

Next needed input: an authorized official statement capture including examples, constraints, exceptions, and the complete language selector with starter interfaces (including Pandas/Python if available), or normally available authorized access supplied through the approved environment. Do not send credentials. An independently checkable authorized capture is sufficient to resume contract verification.

## Intended learning loop, pending contract verification

Target reader: a learner familiar with basic tables and Python who needs to reconstruct a faithful official solution. Smallest useful outcome: calculate a tiny official-contract-compatible example, explain the maintained grouping/accounting rule, predict a fresh case, and map it to executable canonical code. The actual sequence and number of sections cannot be fixed until the requested quantity is known.

Each eventual section must record all five fields: prior knowledge; one concrete question; available input and desired output; reversible control and expected visible observation; applicability conditions. The problem-specific values of these fields are deferred because inventing them would invent the hidden statement.

Concept dependency table: unresolved. Column names in a public sample are observations, not enough evidence to define the required aggregation or invariant. First-use terms and bilingual definitions will be derived from the verified contract before implementation.

Simulation and execution: any eventual browser trace will be labeled as a teaching simulation, separate from canonical submission execution. No simulation or solution exists in this blocked record.

## Priorities and retained design boundary

- Highest-return slice / P0: verify the complete official contract; then write the problem-specific causal brief and deliver the bilingual lesson with exact shared tokens and reproducible canonical-runtime/browser checks.
- P1: useful local explanatory refinements after the complete learning loop works.
- P2: optional decoration only if it helps understanding and fits the existing contract.
- Deferred: all lesson implementation and metadata until source verification; platform abstractions, external assets, and automatic animation have no demonstrated need here.

No shipped CSS or runtime UI is added. Workflow status lives only in this BRIEF and evidence. Browser lesson testing, numerical oracles, source parity, and learner outcomes are unverified because no honest executable candidate can be authored yet. The access probe is a self-check, not an independent review.

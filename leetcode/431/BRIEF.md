# #431 · Encode N-ary Tree to Binary Tree — blocked author brief

Status: official-contract access blocked; no implementation candidate or independent acceptance.

## Product scope and approved design

Reuse the existing bilingual LeetCode lesson pattern under `/leetcode/431/`.
Category: leetcode; stage: university. Audience: readers with basic programming
knowledge seeking to reconstruct the verified algorithm and transfer it to the
official callable interface. The smallest useful outcome is one complete,
self-checked lesson ready for a separate cold review.

The approved contract is `specs/reviews/leetcode-all-hard-design-review.md`
(D2, D3, D5, D6, D8 and dispatcher adjudication), with WORKFLOW.md,
UI-I18N-SPEC.md, specs/leetcode-explainers.md, specs/leetcode-hard-traces.md,
specs/leetcode-review-gates.md and the requested website-design skill read.
No new product/layout approval is being claimed. No shared files are owned here.

## Contract verification before implementation

Official source: https://leetcode.com/problems/encode-n-ary-tree-to-binary-tree/

Observed 2026-10-25 Asia/Singapore: the official page requires a Premium
subscription. Anonymous public GraphQL returned HTTP 200, frontend ID 431,
isPaidOnly true, content null and codeSnippets null. Full evidence is in
`provenance/`. The raw metadata includes language identifiers (including python3
and typescript), but no verified full callable stubs. Python remains the first
preference; no canonical language has been selected and no non-Python exception
is justified. Visible sample input strings alone cannot establish expected
outputs, constraints, ordering semantics, node types, round-trip requirements,
or other exceptions. Those details remain unknown rather than inferred.

## Priority and next input

P0 / highest-return slice: obtain an authorized official statement including
constraints, examples and notes, plus actual supported language interfaces and
node/Codec definitions (prefer Python). An owner-provided authorized official
capture/export is sufficient to resume verification; do not send credentials.

P1: after verification, complete the problem-specific causal teaching sequence,
each step's five fields (prior knowledge, single question, inputs/output,
operation/visible observation, validity conditions), and first-use terminology
table before implementing the interaction.

P2: optional visual refinements after core teaching, bilingual state and checks.

Deferred: executable solution, baseline/oracle, proof, trace presets, transfer
exercise, token implementation and runtime/browser verification. Their content
depends on the unavailable official contract. No generic lesson or fabricated
statement is substituted. Reuse exact shared tokens once implementation resumes.

## Author check boundary

The reproducible anonymous access probe is `tests/check_official_access.py`;
it accepts OUTPUT_DIR to preserve this capture during reviewer reruns.
No algorithm, browser or learner checks have occurred because there is no
verified implementation. Self-checking access is not an independent review.

Non-mutating preflight from repository root:
`python3 -B scripts/register_leetcode_lesson.py 431 --validate-only`

Observed exit 2: `Metadata validation failed: [Errno 2] No such file or directory:
'/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/431/lesson-entry.json'`.
No lesson metadata was invented to clear the gate. No registration, campaign
state update, commit, publication or independent acceptance was performed.

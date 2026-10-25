# Overlapping-state clarification: local patch preparation

Status: **prepared, not applied; independent final patch review still required**.
The root accepted the wording in the [proposal](../../proposals/leetcode-overlapping-state-markers-20261026.md), but has not authorized shared-policy adoption during Stage A. This directory is the reviewable artifact, not an active contract update. No Pi access or changes were needed for this preparation.

## Exact scope

[rendered-state-contract.patch](rendered-state-contract.patch) inserts only the two root-approved proposal paragraphs, rewrapped to 78 columns, at the end of section 2 of `specs/leetcode-rendered-state-contract.md`. The existing candidate/value example, section numbering, evidence rules and adoption language remain intact. No author/reviewer prompts, rubric, lesson runtime, test implementation, registry, queue or release state change.

[manifest.json](manifest.json) pins the single allowed target and exact bytes:

- Local base revision: `556280c2d98d89ae786ec3e0bd407a65f39424ff`.
- Base file SHA-256: `d861a659f42607defb40f46505b02d0283be48a533127b40efa8c6bf543c4faa`.
- Proposed file SHA-256: `816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c`.
- Patch SHA-256: `3133b56b6d7e0cd60ad5d3af13a26d3c264831ea428491fff3f4325c433f1605`.

The learner must be able to distinguish semantic algorithm state, current operation, inspected item and keyboard focus when these coexist. Text/shape or other suitable treatment is allowed. The clarification does not prescribe orange outlines, multiple rings, a shared marker framework, new widgets or exhaustive combinations. Existing rules already enforced the original #968 contradiction; no score or acceptance threshold changes.

## Evidence and review impact

The proposal preserves the original #968 finding and images. The subsequently archived [fresh review](../parallel-968972-evidence-20261026/968-review-2-9fca39e7.md) closes **968-R1** on candidate `611b194292b72d89d4e64b984256efce09f5ab4e` under the existing frozen rules. This patch neither performs that closure nor changes its criteria. The original proposal's historical “current fix” wording describes its earlier assessment, not the present closure status.

Prospective checks remain narrowly tied to a lesson's applicable overlap: compare actual rendered current/noncurrent items sharing semantic state where available; inspect both locales, rewind/replay and applicable focus overlap. A class or `data-current` assertion alone does not prove visibility after CSS. Existing visible marker text/shape and relevant rendered-style assertions can supply targeted regressions; no common test library or mandatory widget is introduced. Algorithm tests need no change solely because this prose is adopted. Historical lessons are not automatically reopened.

Preparation checks completed: exact base hash; two proposal paragraphs matched before line wrapping; unified diff contains one target; `git apply --check` passed against the unchanged local base. The active target was not written. These are patch consistency checks, not independent final approval, browser verification, or central adoption. No executable lesson suites were rerun for prose.

## Adoption timing and review duties

P0/highest-return work is this two-paragraph patch plus separate final wording/scope review. P1 is explicit operational adoption **after Stage B**, once the dispatcher verifies no active author/fix/review lanes would cross a shared-policy boundary. Stage names alone are not evidence that the boundary is safe. Keep Stage A and currently source-bound lanes on their frozen policy.

At that boundary, verify the active target still has the pinned base hash, preserve the exact path allowlist, record the adopting source revision and before/after hashes, and retain existing candidate policy identities, reviews, queue/history and release receipts. If the base has changed, reconcile the narrow diff and obtain review of the new patch rather than forcing this one onto a different contract. Start subsequent work only with the explicitly adopted policy identity. This artifact supplies no operator, launch command, implicit resume or authorization to change Pi state.

P2/deferred: generalized marker infrastructure, exhaustive UI-state tooling, new badges/controls and retrospective audits. Reconsider them only if a concrete future lesson demonstrates a need. Parent dispatch should archive the independent review and adoption decision separately; this preparation must not be reported as active adoption.

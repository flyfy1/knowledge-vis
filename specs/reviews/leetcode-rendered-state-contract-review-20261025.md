# Documentation review: rendered-state supplement and prompt wiring

Date: 2026-10-25. Reviewer: this fresh independent review run, not the author. Requested configuration: `gpt-6.1-sol`, medium reasoning. Exact actual model identity: unavailable; the requested configuration is not an independently verified runtime identity.

**Outcome: accepted for documentation scope. Required open findings: none.** This review does not accept or reaccept any lesson.

## Scope and method

Read the complete rendered-state contract, explainer, Hard trace specification, review gates, WORKFLOW, all three campaign prompts, both supplied #312 reports, and all three supplied #315 reports. Reviewed the prompts as documents, without executing their instructions. Also inspected the supplied #312 core and #315 Python source as supporting context; neither supplies the independent expected values below.

Checked consistency, defect coverage, ordering, source-transfer guidance, and local links. Independently computed the numerical examples using direct arithmetic, exhaustive burst-order simulation, strict suffix comparisons, and sums over Fenwick cell ranges in an inline Python process with bytecode disabled. No lesson browser walkthrough or lesson test suite was run. Only this report was written.

The reviewed supplement SHA-256 is `c411afb3529e759c8c34e9f605c9669d4bf7958d26fda96a80d6757b53f505f2`.

## Required findings

None. No mathematical error in the supplement's examples, missing wiring, or conflict requiring revision was found.

## Coverage and independent checks

| Observed defect / evidence | Supplement coverage | Review result |
| --- | --- | --- |
| `OPEN-312-FORMULA`: bare localized string rendered as one character | Section 1 checks the actual consumer's representation and rendered formula meaning in both locales | Covers the failure without forcing all localization implementations to use pairs. Retains duplicate-key detection as a separate check. |
| `OPEN-312-TRACE-LABEL`: final enumerated candidate paired with another candidate's maximum | Section 2 requires identity/value consistency at a defined frame instant, including ties and replay | Correct adversarial example: for padded `[1,3,1,5,8,1]`, interval `(0,3)`, choosing `k=1` last gives `3×1×5 + 1×3×5 = 30`; choosing `k=2` last gives `1×3×1 + 1×1×5 = 8`. The optimum is not the last enumerated candidate. |
| `OPEN-312-QUIZ-PREDICTION`: confusing prediction choices and boundary interpretation | Sections 1 and 3 require hand-checked boundary meaning and agreement among prompt, options and feedback; existing explainer/trace requirements still govern distractors and transfer | Adequate combined coverage. An explicit indexed quiz example would improve repeatability; see DOC-OPT-01. |
| `R315-1`: per-position question graded against the total of all counts | Section 3 requires the same input and quantity, and checks input change after answering | Correctly excludes grading a position against a different aggregate; locale switching must preserve meaning. |
| `R315-2`: completed-position count labeled as cumulative comparisons | Section 3 separates units, scopes, current work and cumulative work | Independently obtained output `[2,1,1,0]`, comparison increments `[3,2,1,0]`, and cumulative totals `[3,5,6,6]` for `[5,2,6,1]`. Initial, middle, endpoint and replay checks address the observed contradiction. |
| `R315-3`: missing canonical final newline | Section 4 compares canonical, decoded mirror, DOM text, copy and download without trimming | Addresses the exact one-byte defect. Successful copy and usable manual fallback are both required; clipboard platform conversion must be disclosed rather than hidden. |
| `R315-4` and `R315-5`: missing Fenwick derivation and optimization-transfer exercise | Existing explainer's gradual derivation/interaction contract and review prompt's teaching-depth requirements remain active | The supplement is not a complete teaching checklist and does not claim to replace one. Passing its state/source checks cannot close these teaching findings by itself. |

Additional independent calculations confirmed burst maxima `[2,1,2] → 10`, `[3,1,5] → 35`, `[3,1,5,8] → 167`, and five 100s → `3010100`, using enumeration of actual burst orders rather than the supplied interval recurrence. Direct suffix counting gives `[3,1,2,1] → [3,0,1,0]`, agreeing with the later #315 correction rather than the first report's cold prose.

For the #315 closure's fixed frequencies `[1,2,1,0,1]`, independently summing cell ranges gives tree `[1,3,1,4,1]`; inserting rank 2 gives `[1,4,1,5,1]`. For transfer input `[9,-4,2,6,2]` at position 2, ranks are `-4→1, 2→2, 6→3, 9→4`; the right suffix gives tree `[0,1,1,2]`, the strict-smaller query is 0, and insertion gives `[0,2,1,3]`. These checks corroborate the reported mathematical mechanisms, not their browser implementation or historical closure decisions.

## Prompt wiring, ordering and proportionality

- `scripts/campaign-prompts/author.md:8–14` explicitly includes the supplement in required reading while preserving the approved lesson pattern and author-only status.
- `scripts/campaign-prompts/fix.md:7–16` names the applicable regressions and retains lesson-local ownership, stable finding mapping and independent re-review. It does not authorize editing reports or the rubric.
- `scripts/campaign-prompts/review.md:10–22` requires saving the source-blind cold walkthrough before applying the supplement. Prior reports remain deferred until after that walk at lines 66–69. The supplement's own adoption/evidence section agrees. Its links to historical reports are therefore not instructions to expose them before the cold walk.
- `specs/leetcode-explainers.md:150–153` links the supplement and identifies it as clarification. All six links in the supplement resolve locally; the explainer backlink and each prompt's single explicit supplement reference also resolve.

The frozen weights remain `15,20,20,20,15,10`, with acceptance still requiring at least 85/100, every dimension at least 3, and no required open finding. The supplement adds no score, substitute gate, retroactive approval, publication step, UI/layout, shared renderer or runtime dependency. Prospective adoption applies to new candidates, including future revisions; it does not reopen historical reports merely through adoption.

Verification guidance is practical: small adversarial cases, explicit expected/observed values, applicable interaction paths, replay, locale changes, and exact transfer checks. It permits alternative localization representations, deriving identity/value from a snapshot, and explicitly labeled post-operation initial states. No mandated framework, universal abstraction, exhaustive interaction product or extra visual design is introduced. Existing broader browser and teaching checks remain mandatory where applicable; the short high-return list is not a replacement for them. Exact newline preservation is an existing source gate, so its specificity is justified by the observed defect.

## Optional finding

### DOC-OPT-01 — Make the prediction boundary example explicitly indexed

**Optional / low / open.** Location: `specs/leetcode-rendered-state-contract.md:68–72`; context: the cited #312 reports' transfer exercise.

The historical prose alternates between product values 4 and 2 and uses “index 2” without consistently separating original balloon indices from padded DP indices. Independently, padding `[2,1,2]` gives `[1,2,1,2,1]`: for open interval `(0,4)`, **padded `k=2`** yields `1×1×1=1`; **original zero-based index 2**, which is padded `k=3`, yields `1×2×1=2`. Thus a historical “source-backed” answer should not become an oracle without establishing the index convention.

Suggested action for the documentation owner: optionally add one fully indexed prediction example, naming the padded values, open boundaries, candidate index convention, product and expected feedback. Check every option independently under that convention, with a uniquely identifiable intended answer. Preserve the historical reports. This is not required because the supplement already requires hand-checked indices/boundaries and semantic agreement, and does not reproduce the ambiguous quiz calculation.

## Limitations and conclusion

This isolated directory contains selected documents and two supporting algorithm files, not the full campaign checkout. No base diff or adoption revision was supplied. Prompt-template references were checked statically; dispatcher loading and live campaign behavior were not tested. Older links to omitted policy, design, rubric and screenshot artifacts cannot be verified here; all links introduced by the supplement and its explainer backlink were verified. Historical screenshots and claimed executions were not reproduced, and historical review scores or acceptance decisions were not re-adjudicated.

No lesson cold walkthrough, metadata preflight, browser source/copy/download audit, official-site verification, deployment or learner study was performed. No input files were edited, and no agents were spawned. This documentation review establishes consistency and actionable verification guidance only; it establishes no real learner comprehension, lesson acceptance, successful submission or public delivery.

The documentation supplement and supplied prompt wiring are **accepted**, with **zero required open findings** and optional DOC-OPT-01 left for documentation refinement.

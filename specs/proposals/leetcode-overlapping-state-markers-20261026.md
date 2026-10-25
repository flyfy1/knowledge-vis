# Proposal: preserve meanings when state markers overlap

Date: 2026-10-26. Status: **proposal only; pending dispatcher adjudication and explicit adoption**. No active specification, prompt, lesson, queue, or review result is changed. This independent assessment is based on the completed original #968 review, not the currently moving fix.

## Evidence and scope

Frozen candidate: `fe87684237ab7c00f0b6c08692b9187691be8d3c`. The completed [#968 review, finding 968-R1](https://github.com/flyfy1/knowledge-vis/blob/679fd3c6183879e62f719374325c46bae8da59e4/specs/reviews/968-review-1-1fe9cf12.md#968-r1--current-node-highlight-disappears-on-camera-decisions) records **changes_required**, 95/100, with 968-R1 open. Report SHA-256: `7d46c76e05ee379076bf1a84dea619a5fac6e817d4339ac73a32545500e86cbe`.

These Git links identify immutable lane objects retained on Pi. Their public
availability is pending guarded import/push; inspection here used the preserved
local objects and images, not an assertion that those links are already served.

Reproduction: Full tree preset, six Next decisions, progress 6/7. B already has a camera; C is the just-processed camera node. Both have identical cyan 3px outlines despite the bilingual legend promising a thick orange outline for the node just processed. The reviewer measured both as `rgb(110,231,255)` / `3px`, versus the ordinary current leaf's orange `rgb(255,180,84)` / `4px`.

I independently inspected the retained [English image](https://github.com/flyfy1/knowledge-vis/blob/679fd3c6183879e62f719374325c46bae8da59e4/specs/reviews/968-evidence/968-review-1-1fe9cf12/en-two-cameras-current.png) and [Chinese image](https://github.com/flyfy1/knowledge-vis/blob/679fd3c6183879e62f719374325c46bae8da59e4/specs/reviews/968-evidence/968-review-1-1fe9cf12/zh-two-cameras-current.png): the legend, progress and indistinguishable B/C outlines are visible. This is inspection of existing frozen evidence, not a fresh browser reproduction or fix closure.

Frozen source corroborates the report: [app.js:11](https://github.com/flyfy1/knowledge-vis/blob/fe87684237ab7c00f0b6c08692b9187691be8d3c/leetcode/968/app.js#L11) applies both `current` and `camera`; [style.css:7](https://github.com/flyfy1/knowledge-vis/blob/fe87684237ab7c00f0b6c08692b9187691be8d3c/leetcode/968/style.css#L7) lets the later camera selector replace the same stroke/width properties; [copy.js:175–176](https://github.com/flyfy1/knowledge-vis/blob/fe87684237ab7c00f0b6c08692b9187691be8d3c/leetcode/968/copy.js#L175) promises the orange marker. Correct camera counts and ledger entries do not make that diagram promise true. The original report says the supplied browser suite passed while missing this overlap; no suites were rerun for this proposal.

## Independent assessment

**Reuse and clarify.** The learner's immediate task is to identify what just changed while retaining each node's algorithmic meaning. Rendered-state section 2 already requires consistent frame identity, and sections 1/3 require inspecting actual output and simultaneous readouts. The website-design skill explicitly preserves overlapping selection/correctness, separates focus roles, and verifies rendered branches. The underlying obligation is covered; #968-R1 needs no new rule to be valid.

What is less concrete is the failure mode where two true state classes compete for one CSS property. Add a small overlap paragraph and a targeted check to existing section 2. Do not add an accessibility platform, renderer abstraction or new scoring dimension.

## Suggested wording

> Keep algorithmic state distinct from the current operation, inspected item, and keyboard focus. When applicable meanings overlap on one item, preserve a visible way to identify each; one state style must not erase another meaning promised by the legend or explanation. Use an appropriate text label, shape, or other distinguishable treatment consistent with existing accessibility rules. No particular color, ring, layered-outline technique, or new widget is required. Keyboard focus identifies the control receiving input; it must not silently redefine the algorithm's current item.
>
> Check an actual overlapping frame, comparing the current item with another item in the same algorithmic state when such a comparison exists. Inspect the rendered markers and their meaning after CSS and rendering, in both locales and through rewind/replay; check focus overlap only where applicable. The presence of a class or `data-current` attribute alone cannot prove that its marker remains visible. Use a targeted assertion for the rendered representation plus visual inspection, and retain the state/actions, expected distinction and observed result. Scope this to applicable overlaps; an exhaustive state matrix or new test framework is not required.

For #968's repair, the existing finding specifically calls for older B/current C together, root repair, both locales and rewind/replay. A regression should fail on the frozen contradictory rendering and pass on the repaired representation. It must not merely assert both classes exist, nor prescribe the old orange-stroke implementation if a truthful alternative replaces it and updates the legend. A semantic text marker is acceptable when actually visible and associated with the correct node.

## Adjudication and adoption boundary

P0/highest-return scope: the short clarification and one representative overlap check when applicable. P1: review final wording, then record authorized adoption at a stopped boundary for subsequent candidates. P2/deferred: a shared ring/marker framework, exhaustive combinations, mandatory new controls, and a retrospective lesson audit; the single concrete failure does not justify those costs.

The dispatcher should record adopted/overridden recommendations and exact adoption revision before changing active policy. Existing frozen lanes retain their recorded policy identity. Historical scores and acceptances remain unchanged. #968's current fix and fresh independent review must close 968-R1 against their own exact candidate; this proposal neither repairs it nor declares closure. No new acceptance gate, automatic rescoring, or retroactive failure follows from adoption.

Root accepts the narrow wording and targeted rendered check for later explicit
policy adoption. Active lanes keep their frozen policy. Do not combine this
shared-file change implicitly with the separately scoped #818 measurement
handoff; adopt it at a reviewed shared-policy boundary after current lane imports.
Existing gates already require968-R1's repair, so this deferral does not waive the
current defect or require another automatic review of historical lessons.

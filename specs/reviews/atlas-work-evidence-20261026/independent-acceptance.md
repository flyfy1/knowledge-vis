# Round7 independent science and teaching acceptance

**Verdict: PASS. Zero remaining must-fix findings in the independently checked scope.** The reviewer did not edit repository files. This is local implementation acceptance, not evidence of learning gains or whole-site certification.

## Learner walkthrough

The task connects three observations in the same motion:

1. Time endpoints a and b select states, while work integrates displacement x. The primary F–x graph labels metres and newtons. The second graph plots work already calculated from that spatial integral; its caption explicitly distinguishes it from a force–time area.
2. Release → equilibrium gives positive work despite negative force: both force and displacement point left. For defaults, the arrow and cyan triangle agree with +0.72 J, increasing K and decreasing U. The following quarter-cycle has leftward displacement but rightward force and −0.72 J.
3. A full return has zero net work but positive and negative contributions of +1.44 J and −1.44 J. The work curve shows intermediate peaks before returning to zero. The F–x plot explicitly highlights only the last leg; its caption and numerical leg description explain why it is not the whole interval's net area.

Visually inspected the saved positive, negative, reversed and full-return F–x plots, full-return work curve and mobile entry. Force/work axes and parameter-dependent scales are labelled. The task uses force–displacement reasoning rather than decorative energy bars. Scope distinguishes net work on the block from elastic energy within the block-plus-spring system.

## Independent numerical checks

`precision_check.py` and `precision-report.json` cover 534 cases across three UI parameter groups: random bounds, quarter/half/full returns, reversed/equal bounds and adjacent representable floats around turning points and equilibrium crossings. The reference uses 110-digit Decimal cosine, endpoint elastic-energy differences and independently partitioned chronological energy variation.

All checks pass. Maximum absolute error is 8.90e−16 J; maximum relative error on adjacent/tiny time spans is 8.56e−17. The report also records 12 near-symmetric long-span results rounded to zero in JavaScript, with absolute effects around 1e−16 J. These are below-roundoff effects, not a guarantee of relative precision for every near-zero quantity.

Because model deltaK is assigned from work, that assignment is not independent proof. The separate high-precision reference supplies the check. Source inspection confirms quarter-cycle cuts at Fv zeros, chronological positive/negative totals, separate oriented legs, reversed signs and zero changes for equal bounds.

The extracted shared cosine helper also passed the previous independent 456-case travel reference, rerun under `travel-regression/`. Maximum absolute error is 7.43e−16 m; tiny-span relative error is 2.82e−16. Old evidence was not overwritten.

## Actual Chrome and state checks

`walkthrough.cjs` / `walkthrough.json` contain 20 groups of independent checks, run on one page serially:

- Route entry reveals and focuses work; all four presets agree with expected work, energy differences and contribution totals in both languages.
- Arbitrary bounds .135→1.865 and equal bounds .375→.375 work. The equal case retains K=0.36 J and U=0.36 J while changes remain zero.
- At fixed cycle bounds, changing mass preserves work, while stiffness and amplitude scale it as expected. Copy identifies parameter edits as hypothetical comparisons.
- Exactly one start-bound input exists. Both bounds survive four shared views, source-document Back and the existing pure return action. Help toggles preserve paused model state, URL and history. Shared view transitions preserve playback; leaving for response pauses it, and Back restores paused work. Repeated reset restores defaults, both bounds and stopped playback.
- English and Chinese at 320 px with 32 px root font (200% text size) have page width 320 px and visible keyboard preset focus. Help focus and forced-colors interaction were checked. No page errors occurred. This is not a physical-phone or browser pinch-zoom test.

The implementation retains one MotionModel/MotionBridge, phase, a/b, parameter group, RAF and session key. App remains route/node/locale/view owner. One work–energy concept, two relations and one route produce 35 concepts, 45 relations and eight routes. Response retains its separate model and explicit scope.

## Findings repaired and independently rechecked

1. Work initially inherited travel's “时间积分限” wording. Final work labels say state endpoints, and its bounds text maps their times to x(a)/x(b), explicitly stating that work integrates x. Travel retains its original time-integral copy and the same shared control.
2. The zero-interval ledger initially claimed intermediate exchanges still existed. Its final wording neutrally lists positive/negative contributions and their sum, so it no longer contradicts the no-path/no-change case.
3. The same narrow copy repair now explicitly preserves the general net-work theorem when all forces are included. Additional driving or damping affects the special spring-work-alone and conserved K+U statements, rather than invalidating the theorem.

`copy-recheck.cjs` / `copy-recheck.json` passed seven final checks: bilingual equal/positive cases, preserved travel copy, one start-bound control, keyboard adjustment and 320 px/32 px-root layout. No page errors. Chrome is closed; no required repair remains.

## Evidence boundaries

The first walkthrough attempt used nonexistent `data-motion-text=workIntro` instead of the dynamic `intro` element. Its timeout is preserved in `walkthrough-fixture-failure.json`; correcting the reviewer locator made the script pass. This was not an application failure.

Owner core/browser and cumulative regressions are separate evidence and were not counted as independently rerun here. Broader legacy courses, physical devices, screen-reader speech, production delivery/load, hardware measurements and learning gains remain unverified. No concurrent browser pressure, process inspection, push or deployment was performed.

Optional P2: actual learners could determine whether the prediction needs an additional answer reveal or more examples. Neither is a correctness blocker. No grading, mastery inference or additional controller is justified by this review alone.

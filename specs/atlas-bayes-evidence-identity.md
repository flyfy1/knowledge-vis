# Bayes S3: a new measurement versus a duplicate record

Read [WORKFLOW](../WORKFLOW.md), [Bayes BRIEF](../bayes/BRIEF.md), [measurement direction](atlas-bayes-measurement.md) and the provenance policy before changing this slice.

## Reproduced gap and acceptance

S3 already warned about conditional independence. Its claim that an independent product is a general upper bound was false. The old ledger had no observation identity and counted every click as new evidence. Correct that claim before adding breadth. Reuse the original ledger, curve, odds/probability functions and fixed1% prior; no graph growth, tracking, alternate probability engine or new route.

Known: H=starred card, E=lit reader lamp. Unique question: is a copied reading a new observation? Inputs: original fixed prior .01, P(E|H)=.90, P(E|¬H)=.09. Operations: new lit/unlit reading explicitly selects conditional independence under BOTH H and ¬H; copy last means the exact same known reading. Expected observation: R1 lit→9.1743%; copyR1→same probability/flat segment/effectiveLR1; undo then newR2 lit→50.2513%. Conclusion: repeated NEW measurements can add information, including dependent ones; their conditional/joint probabilities must be known. A record ID alone cannot establish independence. Marginal independence is not the required assumption.

## Source → claim → experiment

[ProbabilityCourse §1.4.4](https://www.probabilitycourse.com/chapter1/1_4_4_conditional_independence.php) defines conditional independence and distinguishes it from marginal independence. It supports factorization under each conditioning hypothesis. Our constructed reader numbers are hypothetical, not source observations or hardware calibration.

General second factor: P(E2|E1,H)/P(E2|E1,¬H). Copying an already known E1 makes both probabilities1, so LR1. Independence instead permits marginal LR10. With dependence the fixed LR cannot generally be used; neither upper nor lower bound follows.

Optional exact counterexample: joint(++,+−,−+,−−) given H=(.89,.01,.01,.09), given ¬H=(.0082,.0818,.0818,.8282). Each sums1 and both readings have marginals .9/.09; conditional covariances .08/.0001 are positive. With prior .01, posterior after ++ is .52297567, above independent joint .81/.0081 giving .50251256. The counterexample is not a general rule for correlation. No correlation parameter or fabricated experiment is introduced.

## Single-state interaction and recurrence contract

S3 retains original string `lrs` array and adds parallel `recordIds` within the same state. A canonical validated helper yields effective likelihood ratios, shared by curve, formula, chips and diagnostic export. Matching lengths/known kind/positive integer ID required; contradictory result for same ID throws. New ID=max existing+1; copy repeats ID and result. Undo/Clear synchronize both arrays.14cap counts display entries including copies, not independent evidence. Empty/capped copy disabled; distinguish entry count and distinct record count, dashed copy border plus text. Do not claim numbering proves independence.

S1 continuation link navigates only; it must neither transfer prior nor clear S3. S3 explicitly fixes1% and uses the same neutral example. Proof disclosure stable across locale/resize. Bilingual controls48px, visible3px focus, 320/390/200% text, forcedcolors and reducedmotion; no autoplay or user profile. At320px with doubled text, the optional numeric table stays inside a named focusable horizontal-scroll region; never widen the whole page or split decimal values to fake fit. Reload retains legacy fresh ledger default, not a new persistence promise. Back to Atlas preserves existing route context.

Preserve original probability/frequency/Beta/PRNG core, S2 and S4–S6 code. The preceding S1-only preservation guard is narrowed only around this authorized S3 addition; historical S1 acceptance remains evidence for its historical revision, not a claim S3 is forever frozen. Canonical graph stays38nodes/50edges/14trails, Bayes introduction#step1.

Before delivery: core exact duplicates/negative/copy/undo/cap, valid dependent counterexample, conditional versus marginal independence, preserved regions; actual bilingual mobile keyboard/zoom/reset/back trial and independent science/learner reviews. Specs must be updated on future fixes. Visible Codex revised-edition source plus retained original contributions, source/main and scoped backup/origin verification. Public access403 is a separate unverified boundary; no repeat/bypass or security changes. Physical phone/Safari/human learning effect unverified.

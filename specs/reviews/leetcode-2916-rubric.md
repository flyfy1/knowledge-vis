# Novice lesson evaluation rubric

Established before reading the lesson implementation or BRIEF (2026-10-17). Target learner: basic Python lists/sets and elementary algebra; no optimization, segment-tree, or lazy-propagation experience. Reusable for other algorithm lessons by substituting the target invariant and example.

## Evidence and scoring

Score each outcome from 0 (absent/incorrect) to 4 (independently reconstructable), multiplied by its weight / 4. A reviewer must first operate the public lesson without reading its source, paraphrase each step, then audit mathematics and code. Report screenshots/control states and counterexamples. Reviewer predictions of novice understanding are hypotheses, not human learning results. Automated tests establish behavior/correctness, not comprehension.

| Outcome | Weight | Observable acceptance evidence |
|---|---:|---|
| Problem and concrete baseline | 10 | Learner enumerates a small input, distinguishes subarray from set and count from square, and explains what the answer sums. |
| Causal discovery of optimization | 20 | Learner explains the duplicated work in the baseline, derives which starts change after an append, and explains both sides of the previous-occurrence boundary using an unseen example. |
| Algebra and maintained invariant | 15 | Learner reconstructs the square increment from elementary algebra, identifies old versus new values, and distinguishes per-ending contribution from total answer. |
| Data structure and lazy mechanism | 20 | Learner explains interval summaries, complete versus partial overlap, why deferred work is valid, when it must be propagated, and why one increment on a block changes its summary by length. |
| Interaction and cognitive load | 15 | Each action has a clear prediction task, visible before/after evidence and useful interpretation; retained history exposes accumulation; each step answers one question with locally defined symbols. |
| Visual-to-Python transfer and correctness | 15 | Learner maps visible quantities to variables and traces a short call/update through correct executable Python; boundary cases, modulo, time and space claims are justified. |
| Bilingual and device access | 5 | Chinese and English teach equivalent claims; desktop/mobile controls and critical visuals remain usable, language changes immediately, errors do not block learning. |

## Blocking defects

Any mathematical/code error affecting the claimed solution; a missing causal bridge essential to reconstructing the optimization; a visualization contradicting the invariant or hiding the mechanism it claims to teach; an interaction/state failure that prevents a core experiment; inaccessible critical content on supported mobile width; materially different Chinese/English explanations. An unexplained essential term or impossible per-step paraphrase is a required fix, not optional polish.

## Acceptance

At least 85/100, no blocking defects, and every outcome at least 3/4. A reviewer must demonstrate all of: (1) manually compute a fresh short example; (2) predict the exact changed interval before reveal; (3) explain the recurrence from old counts; (4) trace full-cover then partial-cover lazy operations; (5) locate each operation in Python; (6) repeat core controls in both languages and at 390px. Two improvement rounds must record what changed and which original blockers were reproduced or resolved. Reviewer acceptance remains provisional until actual novice teach-back evidence exists.

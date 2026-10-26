# Standing-wave S1: compare spatial phase using the existing solution

Read WORKFLOW, standing-wave/BRIEF.md, standing-boundary.md and visual-page-provenance.md before edits. [Independent gate](reviews/standing-phase-20261026/design-review.md).

## Reproduced gap / bounded acceptance

Base73c0 bilingual hint simultaneously says all non-node points are in phase and crossing a node reverses phase. There is only one probe. Old setP rounds λ2.1 node .525 to .55; old history rebuild uses negative times even at t>0. The existing analytic two-wave model and two canvases suffice.

P0: one signed spatial result C=2Acos(kx), |C| amplitude, classification and phase relative fixed Q0. Same adjacent-node interval→0, across one node→π, across two→0; node amplitude0/phase undefined. Snap only at floating-point precision, never call a small nonzero amplitude a node. Original yRight/yLeft/ySumRope/yAnalytic preserved; original S2 mode/boundary/response preserved. Q dashed/open, P solid/filled share time and ±2A vertical scale. No new model, canvas, clock or graph relation. P coordinate remains fixed during play; exact preset/native values not quantized to .05. Reset paused.

P1: scoped bilingual controls, 48px targets, 3px focus, 320px/200% DOMtext, source/model limits and passive paused Back/reload. P2:none. Deferred: audio, real string transient/energy solver, broad resonance rewrite, new nodes/routes.

Known: basic sine motion from S0. Unique question: how can the same time factor produce opposite motion? Inputs: existing λ1.2..3, P−4..4, shared t; Q0 constant. Operation: same interval λ/8, across one node λ/2, node λ/4; play and compare. Quantity: signed C, nonnegative amplitude, phase and current yP/yQ. Prediction: both zero at t0 does not imply same phase; node remains still. Limits: ideal equal-frequency/amplitude counterpropagating waves; T4s is demonstration time, wavelength change is not fixed-wave-speed frequency sweep. Units x/λ same length; y and C in A units. Analytic two-cycle curves are current-parameter predictions, not measured history.

## Lifecycle / prevention

Native P stepany with explicit arrows±.05/Page±.5/HomeEnd. Exactλ/4 survives preset and history/native serialization to numerical precision. Editing pauses/holds t, recomputes last2T including currentt. S1 history standingPhase stores only validated lam/px/env/t, merges other fields, commits on change/preset/play/pointerend/pagehide, never perinput/frame. Restorepaused; deniedhistory remains usable. No quizzes/profile tracking. S2 standingBoundary remains intact. Canvas alternatives/readouts expose comparison without color alone; do not place output inside implicit input label. Avoid live-region animation spam.

## Source→claim→concept

[OpenStax University Physics1§16.6](https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance), checked2026-10-26, derives standing wave as spatial factor×time factor and stationary nodes. Textbook uses sin(kx)cos(ωt); this page's original shifted origins give cos(kx)sin(ωt). The relative-phase rule follows by sign of C: negative Csinωt=|C|sin(ωt+π). At C0 phase cannot be recovered from y identically0. This algebraic inference is explicit, not a claim of real measured phase. Existing concept map95/96 and graph39/51/14 unchanged.

## Required regression

Independent oracle original ySum over times/λ/positive and negative x; signed phase0/π/node; two-node crossing; zero-instant ambiguity; λ2.1 exact.525/.2625; tiny nonzero near-node; invalidinputs. Preserve S2/response bytes and run existing boundarycore/browser. Real UI preset/edit/play/pause/holdtime/fixedpositions, currentt prediction endpoint, exact coordinate/native precision, keyboard bounds, locale, repeatreset, committedhistory/back/reload/deniedhistory; ENZH390/320doubledDOMtext/forcedcolors/reducedmotion and actual screenshots. Independent science/code and UI-first cold review mustfix0. Physical phone/Safari/OSzoom and learning effects remain unknown; public access separate from origin install. Do not call numerical checks a visual/user-study pass.

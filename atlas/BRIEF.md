<!-- Historical Round4 interval seam: see README and specs/reviews/atlas-travel-design-20261025.md.
Projection/rates/travel shared one MotionModel/Bridge/phase/session at that milestone.
Round7 adds work to that same host; see current contracts below. Bounds a/b are interval limits,
not two clocks; reversed integrals differ from chronological physical displacement. -->
# Mathematics & Physics Atlas

Current contracts: [work–energy round7](../specs/reviews/atlas-work-design-20261026.md), [starting ideas round6](../specs/reviews/atlas-foundations-design-20261026.md), [continuity round5](../specs/reviews/atlas-continuity-design-20261026.md), [development index](README.md), [motion](../specs/reviews/atlas-motion-design-20261025.md), [response](../specs/reviews/atlas-response-design-20261025.md), [rates/net force](../specs/reviews/atlas-rates-design-20261025.md), [signed travel](../specs/reviews/atlas-travel-design-20261025.md). The original navigation-only brief below is historical; counts/no-animation scope describe its first release, not the current implementation. User-started teaching motion is explicitly governed by the newer contracts.

## Original navigation-only slice (historical)

Design contract: ../specs/reviews/math-physics-atlas-design-review.md.
Category: math. Stage: university (collection audience, not a per-node prerequisite).

## MVP card

Target user: a learner exploring the existing interactive mathematics/physics pages.
Job: understand how two concepts connect and reach the supporting explanation.
Riskiest assumption: explicit local relations help navigation more than category cards.
Loop: search Fourier -> select convolution relation -> read its conditions -> open
the convolution theorem lesson section -> return to the same atlas state.
Input: 24 editorial concepts in foundations, waves, systems, and measurement.
Output: concise bilingual definitions, directed relation statements, and source links.
Proof: browser exercises that loop and verifies the destination section, history,
language, mobile list, graph, filters, and no-result recovery. User learning needs
subsequent task-based comparison; browser success does not establish learning gains.
No-gos: changes to existing lesson logic, user data uploads, AI-generated relations,
new services, new runtime libraries, unrelated pythagoras work.
Appetite: one static navigation slice.

## Scope

P0 (the highest-return slice): all functionality in the loop, accessible list and
stable graph, three editorial routes using the same concepts, homepage entry,
English/Chinese parity, evidence and public delivery.
P1: more physics topics after observing use. P2: optional visual refinement.
Deferred: 3D/force simulation (no task benefit), semantic zoom (small graph), automatic
extraction (quality unproved), progress tracking (no learning signal), large-scale
optimization (no measured bottleneck).

## Content and relation contract

Every node has a stable ID, region, bilingual title/definition, optional formula,
and a source URL. Internal sources are labelled interactive lessons; external
textbook sources are labelled reading. Region position is editorial, not similarity.
All edges are directed statements with one of four types: foundation (helps explain),
representation (expresses another view), application (used in), connection (a stated
mathematical connection with conditions). Each has a bilingual reason and source.
Arrows encode the statement direction, never a universal learning order or causation.
Fourier/convolution statements name transform existence; frequency response names LTI;
Laplace restriction names the region of convergence; CLT names iid finite variance;
Gaussian/Kalman optimality names linear Gaussian assumptions. No physical experiment
is being claimed. Source content is editorial evidence, not an automatic proof.

## UI contract

Dark site palette; no gradients, images, remote fonts or animation. Root 16px;
system font stack; body 1rem/1.65, metadata .875rem/1.5, title clamp(2rem,4vw,3.5rem).
Colors: canvas #0a0e14, surface #111826, secondary #0d1420, border #596d85,
ink #e6edf6, muted #b1c0d2, cyan #67d7f9, amber #f5b04c, green #7ee2a8,
violet #d6baff, on-accent #08131a. Selection uses text and a border as well as color.
Focus: 3px cyan with 3px offset. Controls minimum 48px. Spacing: 4/8/12/16/24/32/48px.
Radii: 8/12/24px. No shadows; motion duration 0. Width cap 1600px, gutters 24px
(16px narrow). Map internal width 864px; vertical positions stay stable across
selection. Text wraps and nodes grow for long titles. Map scroll is contained.
At <=1000px detail stacks; <=700px defaults to a fully functional list.

Search is bilingual across titles/definitions. Search/group filters switch to List and constrain results,
not the selected detail. A manual return to Map keeps context with explicit nonmatch labels. Excluded selection receives a visible reset notice. Selecting
a relation or route clears discovery filters. Language never clears selection/query.
URL parameters preserve selection/query/group/trail/view; popstate restores all.
Node buttons are stable DOM; detail heading receives focus only when navigating from
buttons replaced in the detail/route panels. Graph/list switches retain selection. On stacked layouts, selection focuses and scrolls to the explanation. Native relation disclosures preserve expanded state across language changes.

## State coverage

Both locales: initial Fourier selection; each node/relation; matching search; no
matches/reset; group filtering; selected outside results; active suggested route;
invalid URL recovery; no JS; blocked localStorage (memory fallback). Data/network
loading/reconnect/expiry are inapplicable: data is bundled synchronously. External
source availability is separate from the self-contained atlas. No disabled controls.

## 2026-10-25 milestone: verify a math–physics connection

Iteration contract: `../specs/reviews/atlas-motion-design-20261025.md`; handoff: `README.md`. Add one `motion` trail over existing `unit-circle → sine → oscillation` edges; stable in-map lab after route selector, existing state/locale/tokens. No root registry, CONCEPT-MAP or LeetCode changes. Read newest working tree and check hashes before mutation.

Step contract (known / question / input-output / action-observation / conditions):
1. Known: coordinates define sine/cosine. Question: which coordinate matches horizontal displacement? Input θ, output q=cosθ and x=Aq. Seek quarter/half turn: q and displacement become0/-A. Unit-circle radius1 is dimensionless; A scales metres.
2. Known: x repeats. Question: why this physical frequency? Input m,k, output ω=√(k/m), T=2π√(m/k); m x''=-kx gives x''=-ω²x. Double mass: period grows√2. Ideal horizontal Hookean spring, no damping/driving; initial x=A,v=0. Circle is representation, not actual block path.
3. Known: phase aligns views. Question: what changes with A? A changes displacement and energy½kA², not period in this ideal model. Inspect full prediction vs elapsed curve. Parameter edits pause, keep phase and recompute time/whole trajectory as a hypothetical comparison, not a physical time-varying process.

First-use terms: θ=ωt angular progress in radians (one cycle2π); T seconds per oscillation; ω radians/second; m kilograms; k stiffness N/m; A max displacement metres; q unit-circle coordinate. Explain next to controls/formulas. No measurements, damping, driving, finite spring mass or 3D solver.

Scope amendment to original no-animation policy: allow only user-started essential teaching motion, stable DOM and one authoritative clock. Continue prohibiting decorative animation. Independent reviewer approved this specific extension.

## Round2,2026-10-25: displacement response vs poles

Contract: `../specs/reviews/atlas-response-design-20261025.md`. Reuse existing response trail/four nodes; stable separate response-lab. No new nodes/routes and no extension of the undamped motion model.

Known / question / input-output / observation / conditions:
- Known: free motion's frequency comes from m/k. Question: does driving choose that frequency? Input driveΩ via r, output steady gain/phase. Move r whileζ fixed: probe changes, poles do not. Only fixed-parameter causalζ>0 steady forcing after transients decay.
- Known: damping changes response. Question: do complex poles guarantee a displacement peak? Inputζ.2→.8, output gain curve/poles/analytic peak. At.8 poles remain complex but no nonzero-frequency displacement peak. Normalize by static compliance; do not generalize to bandpass/velocity/power outputs.
- Known: poles describe homogeneous exponential modes. Question: which frequency is which? Read fixednaturalω0, freedampedωd, driveΩ and peakΩ_peak separately. ζ1 is a repeated real pole; above1 two negative real poles. No actual transient is drawn or numerically solved.

First-use definitions: complex X̂ records amplitude/phase; M=|kX̂/F0| is dimensionless; φ negative for displacement lag under eⁱΩᵗ; Ω userdrive vsω0 natural; ωd pole imaginary magnitude when underdamped; Ω_peak only for this displacement amplitude. All diagrams/readouts use oneζ/r and consistent units. Plot includesstaticr0 even when slider starts.05; use analytic peak, not visible maximum. Reset returns.2/1; locale/navigation preserves state; independent per-tab recovery with denial fallback.


## Round3: rates and net force

One job: connect graphical slope to signed velocity, acceleration and net force within the existing oscillator model. Same state; no third simulation. User loop: choose the rates trail → inspect x/v tangent slopes → compare left/speeding vs right/slowing → inspect turn vs crossing → return to derivative or Newton explanation with state retained.

Known/question/input-output/observation/conditions: position changes; what does its slope mean? Shared phase selects x/v/a; x–t tangent isv andv–t tangent isa. Compare presets.125 and.875 with negativea but differentv signs; then.5(v0,nonzeroa) and.25(nonzerov,a0). Only one-dimensional differentiable inertial-frame motion at fixed mass. Speed=|v|,va rule onlyv≠0. In this horizontal spring model Fnet=-kx=ma; other force systems need their full external-force sum.

First-use terms: signed velocityv=dx/dt(m/s); speed|v|; accelerationa=dv/dt(m/s²); net force is sum of external forces,N=kg·m/s². Axis scaling affects screen angle; tangents use seconds/physical units. Velocity scale may change with parameter group, never with phase; ticks/scale note are explicit. Use the existing two-period clock, parameter comparison rules, reset and paused navigation recovery. No measured-force inference or secant-limit duplication.

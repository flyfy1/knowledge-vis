# Round4 design: signed accumulation and a return trip (2026-10-25)

## Audit and priorities

1. Repair a scientific overgeneralization first: integral/i18n Step2 conclusion and Chinese Q3 equate signed velocity accumulation with distance. Existing v=t example is nonnegative; retain its computation, narrow its conclusion. Red proof: legacy-red.log.
2. Complete one task in existing atlas: return to the initial position, compare zero signed displacement with positive path length, alter either bound. No standalone lesson/controller.
3. Cumulatively verify earlier motion, rates, response and handoff contracts. Browser acceptance is not evidence of learner understanding.

Metadata/README/previous records confirm knowledge-vis. HEAD fdfb7a50 includes concurrent LeetCode work; excluded-file hashes captured. Existing one analytic free-motion model, one clock/session and two views are sufficient; static ResponseBridge stays separate. Integral lesson only slices nonnegative x² and v=t, so signed return travel is a real gap. Root index/registry/config and LeetCode excluded. Existing website-design and MVP-first policies apply; no new target AGENTS/skills found.

## Selected loop and mathematical contract

One integral node, one sourced integral→oscillation relation, one travel route. Existing MotionBridge gets a third view selected by atlas's URL-owned enum. Phase remains endpoint b; startCycles is the sole added field in the existing session key (old snapshots default0). Both0..2 periods, actual seconds printed. Bound/parameter/preset edits pause; views and locale retain phase/playback. Leaving all motion routes pauses. Reset restores startCycles0. Opening travel NEVER seeks silently; labelled preset establishes return0→1. Existing controls/clock remain.

x(a),x(b), orientedI=x(b)−x(a), chronological displacement and physical distance are distinct. P≥0,N≤0 are chronological positive/negative contributions. Chronological displacement=P+N; D=P−N. For a>b, I=−(P+N); ∫aᵇ|v|dt=−D while physical path over[min,max] stays nonnegative. No reverse-time story. Equal bounds give zero accumulation, even with nonzero position. Return starts/ends+A, not coordinate origin.

v–t chart shades selected chronological interval, outside dashed prediction; labelled a/b and signs supplement color. Full numeric equivalent. Units(m/s)·s=m. m/k change seconds and velocity together at fixed phase bounds, preserving geometric path; comparison is hypothetical. Play explicitly advances b with a fixed. D may shrink while b<a because selected chronological interval shrinks: it is not a counter of playback distance.

## Exact solution, evidence and boundary

v=−Aωsin(ωt), x=Acos(ωt), ω=√(k/m). Split at half-cycle velocity zeros; each exact contribution is endpoint position difference. Sum positive/negative contributions, using stable cosine-difference identity instead of subtracting large path totals. No numerical quadrature drives readouts; canvas polygons only illustrate. Tests: symmetry/antisymmetry/additivity, parameter scaling, return/equal/reversed/tiny bounds, independent trapezoid convergence/error.

Sources: [Calculus5.2](https://openstax.org/books/calculus-volume-1/pages/5-2-the-definite-integral), [Physics3.2](https://openstax.org/books/university-physics-volume-1/pages/3-2-instantaneous-velocity-and-speed), [Physics3.6](https://openstax.org/books/university-physics-volume-1/pages/3-6-finding-velocity-and-displacement-from-acceleration). Original oscillator references remain. Exact ideal solution, not measurements/general solver.

## Independent design adjudication (before runtime edits)

Review by design_review accepted splitting/stable identity and unified state. All conditions adopted: reverse labels distinguish orientedI from chronological displacement; no initial auto-seek; explicit forward-b/fixed-a playback with interval-recomputation note; bilingual legacy correction. Full reviewer report will be archived. Use existing exact tokens/system fonts/scoped CSS; three view buttons, one new native bound slider, four presets, original controls.48px targets, keyboard/320px/200% text/forced-colors/reduced-motion; no remote assets/hover-only behavior.

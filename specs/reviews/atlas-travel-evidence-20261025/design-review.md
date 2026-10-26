# Round4 independent design/science review — signed travel interval

Verdict: proceed to BRIEF with the constraints below. This is a useful gap in the existing product and fits the shared oscillator. No repository edits or implementation runs were performed for this review.

## Read-only starting-point audit

Inspected actual `integral/i18n.js`, `integral/BRIEF.md`, atlas README/current-vs-historical BRIEF, and MotionModel/MotionBridge state, clock, reset and recovery seams. The integral lesson currently uses only nonnegative `v=t` examples, but `s2conc` and quiz-3 feedback generalize velocity integrals to distance; the latter even mentions negative signed contributions while still calling the result distance. Those bilingual explanations need narrow repair alongside this feature. Do not change the correct lesson computations or build another Riemann-sum demo.

Current shared motion state is phase/cycles, m/k/A and one playback clock, with app-owned URL views and one tab-session key. Adding one start-bound value is sufficient. No additional simulation, controller, clock, account state or generic integration framework is warranted.

## Mathematical contract (P nonnegative, N nonpositive)

Use a,b for integration endpoints in cycles and physical seconds ta=a*T, tb=b*T. Let lo=min(a,b), hi=max(a,b), s=sign(b-a).

- Oriented integral I(a,b)=integral from ta to tb of v(t)dt = x(tb)-x(ta).
- Chronological signed displacement C=x(hi*T)-x(lo*T).
- P=integral over [lo*T,hi*T] of max(v,0)dt >=0.
- N=integral over [lo*T,hi*T] of min(v,0)dt <=0.
- C=P+N; physical chronological distance D=P-N >=0; I=s*C (and all contributions are zero for a=b).
- Units are (m/s)*s=m. Neither endpoint position alone is an accumulated displacement.

For reversed bounds, I is the oriented endpoint difference, not displacement experienced while time physically runs backward. Show chronological displacement C separately or explicitly annotate I's changed meaning; do not label reversed I alone as the chronological physical displacement. Shade the chronological interval with the same P/N signs when endpoints are swapped, and explain the orientation multiplier.

Preferred exact implementation: split [lo,hi] at internal half-cycle turning points; compute each position change using the stable cosine-difference identity `-2*A*sin(pi*(u+v))*sin(pi*(v-u))`; sum positive changes into P and negative changes into N. This is bounded work over at most four half cycles. It is preferable to subtracting two large cumulative-distance totals. Preserve genuine tiny intervals; do not blanket-clamp small path lengths. Document/align cardinal-zero handling with the existing model and distinguish numeric tolerances from exact identities. Validate finite endpoints in [0,2] and the existing physical parameters.

Expected fixtures at A=.6m:

| a -> b | x(a),x(b) | I (m) | C (m) | P (m) | N (m) | D (m) |
|---|---|---:|---:|---:|---:|---:|
| 0 -> .5 | .6,-.6 | -1.2 | -1.2 | 0 | -1.2 | 1.2 |
| 0 -> 1 | .6,.6 | 0 | 0 | 1.2 | -1.2 | 2.4 |
| .5 -> 1 | -.6,.6 | 1.2 | 1.2 | 1.2 | 0 | 1.2 |
| .5 -> .5 | -.6,-.6 | 0 | 0 | 0 | 0 | 0 |
| .5 -> 0 | -.6,.6 | 1.2 | -1.2 | 0 | -1.2 | 1.2 |

Two complete cycles have D=8A, while I=0. At fixed a/b and A, changing m/k changes seconds and velocity scale but not I/P/N/D. Scaling A scales all these lengths. Include arbitrary non-cardinal and tiny intervals, not only the fixtures.

## Must-resolve interaction/state conditions

1. Entering travel must preserve the existing shared b/cycles. Do not silently jump a running or paused prior view to b=1. Default new a to0; make the 0->1 return-trip example an explicit, primary preset that sets both bounds and pauses.
2. Existing Play advances b forward, with a fixed. When b<a, the selected chronological interval shrinks and D can decrease: this is recalculating a selected interval, not decreasing the distance a physical object already travelled. State this beside the controls. Do not call D an ever-growing elapsed-distance counter or call swapped bounds reverse playback.
3. Label a/b as integral limits or selected endpoints, not necessarily earlier start/later finish. Show their cycle values and physical seconds. The amber b cursor can coexist with shading later than b in reversed-bound mode only if shading is explicitly selected analytic prediction, not elapsed history.
4. Bound edits and presets pause; parameter edits retain a/b and preserve the existing hypothetical-comparison explanation. View/locale/node changes retain the one shared state; leaving all shared motion views pauses. App URL state owns the view. Prefer one projection/rates/travel view enum over independent booleans that can activate two views.
5. Reset all restores m/k/A, a=0, b=0 and paused state. Ending/replaying the common b clock must not covertly rewrite a. Add optional startCycles to the existing session schema with a finite-range check and missing-field fallback0; keep old saved sessions valid.
6. Full-trip endpoints must remain visibly +A,+A while displacement reads0 and distance4A. The zero-interval preset similarly has zero change/distance without claiming the position is0.
7. One v-t chart is enough. Label positive and negative shaded contributions with signs and text as well as color; provide numeric P,N,I,C,D equivalents. Use real seconds and parameter-labelled velocity ticks. Geometry is illustrative; readouts use exact analytic integration, not pixel/sample area.

## Product placement and scope

Reuse MotionModel.interval and MotionBridge's stable host, controls and session key. Add one integral concept and the one sourced integral->oscillation relation needed for a two-stop editorial route; do not import more calculus nodes. This implies current counts34/43/7 if no other graph changes occur. Keep derivative/rates/projection/response source links and prior behavior.

Narrowly repair the integral lesson's bilingual v>=0 restrictions and general signed-integral/distance distinction in first-use explanation, summary and quiz feedback, with a link to this return-trip view. A prefatory disclaimer does not cure a later unconditional 'velocity integral gives distance' sentence. Leave correct numerical and quiz-state logic intact.

The highest-value slice is the explicit return-trip preset plus outbound/return/zero/swapped-bound comparisons, honest endpoint/orientation labels and preserved navigation. Defer arbitrary user-entered functions, Riemann convergence controls, backward physical playback, friction/forcing, more plots and a new state framework.

## Validation boundary

Before delivery, independently verify the five fixtures, arbitrary/tiny intervals near turns, two-cycle boundaries, interval additivity, swap identities, P/N signs and D>=abs(C). Use independent quadrature or a separately derived reference as well as exact identities. Check m/k invariance at fixed phase bounds, amplitude scaling, zero amplitude, invalid inputs and cardinal zeros.

UI proof: both languages; first entry without resetting another view; explicit preset pause; b crossing a during playback; reset/replay; repeated view/locale changes while running; Back/original lesson/session restore; old saved session with no startCycles; rejected storage; 320px and200% text; keyboard, accessible names and visible signed contributions. Prior motion/rates/response and atlas/home checks remain separate regression evidence. Do not claim physical-device, hardware or learner-retention validation from local browser checks.

## Source basis

- OpenStax University Physics1 §3.6: velocity is the time derivative of position, and integration recovers position with an initial condition: https://openstax.org/books/university-physics-volume-1/pages/3-6-finding-velocity-and-displacement-from-acceleration
- OpenStax Calculus1 §5.2: definite integrals generalize nonnegative geometric area to signed/net accumulation and obey reversal of limits: https://openstax.org/books/calculus-volume-1/pages/5-2-the-definite-integral
- Existing integral lesson remains the source for its own positive-function slicing and antiderivative demonstrations; it currently does not demonstrate a signed return trip.

# Round4 verification / handoff — signed return travel

## Scope and outcome

Implemented locally in the confirmed `/Users/songyy/Documents/knowledge-vis` repository. One existing MotionModel/Bridge now supports projection, rates and signed-accumulation views with one phase, controller and session key. Atlas now has34 concepts,43 sourced relations,7 editorial routes. One added integral node/edge/trail provides entry; integral's existing nonnegative slicing course links back. No root routing/config changes, no LeetCode answer edits, commits, push or deployment.

The task is a complete return: x(a)=x(b)=+0.6m, signed integral/displacement0m, distance2.4m. Outward, equal-limit and reversed-limit presets contrast it. All signed contributions, endpoints, chronological displacement and oriented speed integral are numeric equivalents of the chart. Bounds remain0..2periods. Playback advances original b with a fixed; a shrinking selection is not a cumulative physical-distance counter. Parameters retain phase bounds and recompute the hypothetical curve.

## Actual changes

- `atlas/motion-model.js`: analytic interval API, half-cycle splitting, stable cosine difference with half-turn midpoint reduction; positive/negative contributions, chronological path and oriented integrals.
- `atlas/motion-bridge.js`, `atlas/index.html`, `atlas/motion-bridge.css`: third view in the same host; one startCycles state field, old-session fallback, same play/reset controls, bilingual explanations/readouts, selected signed v–t chart. Existing modes and source links retained.
- `atlas/app.js`, `atlas/data.js`: URL-owned three-view enum, one integral node/edge/trail and contextual entry. `atlas/tests/browser.cjs`: expected34/43 counts only.
- `integral/i18n.js`: narrow first-use, conclusion and quiz-feedback corrections: velocity integral is displacement, speed integral is distance over chronological bounds; old v=t computation remains. Corrected sampled height vs exact average claim. Links to same atlas state.
- New `atlas/tests/travel-core.cjs`, `travel-browser.cjs`, `legacy-signed-area.cjs`; index/brief plus this design/verification/evidence under existing specs system.

## Red → green and independent numerical check

1. Existing integral course failed `legacy-signed-area.cjs` before edits: no explicit ∫v/∫|v| distinction; Chinese Q3 and both summaries generalized distance. `legacy-red.log` records the failure. Both languages now pass; computation/controller/answers unchanged.
2. Own model audit found adjacent representable times at a half-cycle could lose a real~1.46e-31m path when u+v rounded to an integer. Replaced midpoint addition with reduction around the nearest half-turn before adding the width. Adjacent representable fixtures and larger tiny intervals retain nonzero values. This precision issue was introduced during this round's implementation and fixed before acceptance.
3. New interval suite6107 counted checks checks arbitrary/equal/reversed/tiny/cardinal bounds; signs; distance≥|displacement|; swap symmetry/antisymmetry; additivity; m/k invariance at fixed cycle bounds; A scaling/zero; invalid inputs. Independent composite trapezoids integrate velocity/speed over physical seconds, not the helper. At16000intervals, maximum tested error6.560856036230689e-8m, below2e-7m acceptance; error decreased from800intervals. Browser readouts are analytic; quadrature only cross-checks.
4. First travel UI test used1.999 on a .005-step slider, which quantized to2 and correctly triggered replay. Fixed test fixture to actual1.995; no runtime workaround.

## Reproducible cumulative validation

Run in repo; existing Chrome/Playwright from the installed integ-games node_modules used, no dependency install. All commands below passed. No npm build/lint/TypeScript setup exists in this static zero-dependency project; syntax checks are the applicable static checks.

```sh
node --check atlas/app.js
node --check atlas/data.js
node --check atlas/motion-model.js
node --check atlas/motion-bridge.js
node --check integral/i18n.js
node atlas/tests/motion-core.cjs
node atlas/tests/rates-core.cjs
node atlas/tests/response-core.cjs
node atlas/tests/travel-core.cjs
node atlas/tests/legacy-signed-area.cjs
node laplace/tests/pole-boundaries.cjs
git diff --check
```

With `NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules` and `ATLAS_BASE_URL=http://127.0.0.1:18775`:

```sh
node atlas/tests/browser.cjs
node atlas/tests/motion-browser.cjs
node atlas/tests/rates-browser.cjs
node atlas/tests/response-browser.cjs
node atlas/tests/travel-browser.cjs
```

Set the corresponding `ATLAS_EVIDENCE`, `ATLAS_MOTION_EVIDENCE`, `ATLAS_RATES_EVIDENCE`, `ATLAS_RESPONSE_EVIDENCE`, `ATLAS_TRAVEL_EVIDENCE` to a writable evidence folder as documented in atlas/README. Homepage regression also passed with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`, `HOME_TEST_URL=http://127.0.0.1:18775/`, `HOME_TEST_EVIDENCE=<folder>`, `node tests/leetcode-home-section.cjs`.

- Atlas regression317 checks: all34 nodes,43 edges,7 trails, actual internal source anchors, map/list/search/filter, both languages and history. Graph relations remain editorial explanations, not mandatory prerequisites.
- Earlier projection/rates/response suites all passed after the shared runtime changes: cardinal/free-vs-forced/steady-vs-transient/peak/pole distinctions; original state, source and Back recovery; three resets; parameter rules and old repaired terminology/stability fixtures.
- Travel suite passed in both languages: return/outward/equal/reversed fixtures and endpoints; actual a/b controls, parameter invariance/scaling; original clock across all three views/language; b passes a; lesson/Back/reload/close/response recovery; reset/end/replay/legacy old-session fallback/storage denial.
- Static checks confirmed all78 integral dictionary keys and interpolation placeholders match between languages, plus123 motion dictionary keys and91 DOM dictionary references.
- Desktop1280, widths320/390/768,200% text at320 in both languages,48px visible controls, keyboard seek/play/focus, forced-colors/reduced-motion, DPR1/2/3 repeated resize. Saved desktop/mobile/200% screenshots visually inspected. Zero reported page exceptions or external runtime-asset requests.
- Homepage integration regression passed with120 catalog entries; answers not modified. This is navigation regression coverage, not full LeetCode algorithm validation.

## Independent review and concurrency

Independent design accepted before runtime edits; full design adjudication archived with evidence. All mandatory conditions implemented. Independent final functional/scientific review passed with zero must-fix findings. Its own Chrome cold walkthrough confirmed the task, shared state, sources/Back, storage denial, old-session fallback, bilingual320/390/200% and keyboard/forced-colors. Independently recomputed456 arbitrary/reversed/adjacent-representable intervals against a110-digit Decimal cosine and a separately derived cumulative total-variation reference: max absolute error7.43e-16m, max tiny relative error2.82e-16. Separately checked243 free-motion/rates states,42 response states with126 ODE time samples, and100 interval identities. Current four-round architecture and source seams checked. Independent handoff check found all25 local links and11 named test files; own final hash/link check also passed. Evidence, scripts, screenshots and source references are archived below this record.

Targets were staged in task-5 and applied under exact pre-edit SHA256 guards; source+root excluded hashes captured before mutation. See concurrency.json in the evidence folder for final own targets, excluded-file comparison, HEAD and new concurrent files. Never reset/stage/commit/clean the shared working tree. Earlier frozen-bubble, bicycle, .claude and LeetCode work retained.

## Limits and next handoff

No deployment/push. Local preview: http://127.0.0.1:18775/atlas/?trail=travel&node=integral — choose Whole return/完整往返 to set the example; opening preserves shared state. Server existing at18775 belongs to this local task context; do not kill unrelated servers. Served file output is current working tree.

Exact ideal undamped Hookean oscillator only; no arbitrary velocity functions, friction, forcing, empirical motion or general numerical solver. Integral course's signed wording repaired narrowly; its other claims and unrelated lessons are not comprehensively certified. Canvas is sampled illustration; floating point and printed decimal precision remain. Physical phones, screen-reader speech, hardware and comprehension/retention have not been tested.

> Historical recommendations: continuity and the signed-work task below were completed by [continuity round5](atlas-continuity-verification-20261026.md) and [work round7](atlas-work-verification-20261026.md). Broader audits remain evidence-based candidates; use the [current index](../../atlas/README.md).

Next by learning value: (1) task-based continuity review asking learners to predict/explain signs between rates and accumulation, (2) audit existing work–energy lessons for a useful ∫F dx=ΔK link using the same oscillator, only if an actual gap exists, (3) broader legacy scientific audit. Re-read atlas/README and WORKFLOW, current hashes/status and these sources before editing shared runtime. Parent decides next bounded round; this is not permission for unlimited rewrites.

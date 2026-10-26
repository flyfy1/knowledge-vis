# Round3 — derivative/kinematics/net-force verification and handoff

Status: **implemented, locally verified, functional/scientific and handoff independent reviews passed;0 remaining must-fix findings**. Current handoff synchronization is part of this delivery. No push/deployment by this task. [Current development index](../../atlas/README.md).

## Audit first, then choose the smallest loop

Reviewed prior README, BRIEF, source/assumption records, model/bridge and route seams. Prior records were usable, but original BRIEF's24-node/3-route/no-motion language looked current beside later additions. It is now explicitly historical; latest contracts are linked first. Root README's stale atlas summary is replaced by a count-independent link to the current handoff index. Historical release evidence is preserved.

Existing derivative page already teaches secants→tangents. Existing velocity-vt page only has nonnegative velocities, so it cannot demonstrate signed motion/acceleration direction and its unconditional area=distance language needed narrowing. This round reuses the existing oscillator rather than build a third simulation.

Delivered loop: select derivative→oscillation→net-force route → compare x–t/v–t analytic tangents → read signedv,nonnegative|v|,a,ΣF → inspect left/speeding vs right/slowing, then turn vs crossing → return to original lessons with state retained. Added exactly2 concepts/2 sourced relations/1 route: **33 concepts,42 relations,6 editorial routes**. Existing region id remainswaves; its title now includes motion. No graph framework or bulk-node import.

## One model/controller, two views

Projection and rates both use MotionModel.at and MotionBridge, one phase/clock/m/k/A/session key. Existing atlas app owns `trail=motion/kinematics` view state. Switching view/node/locale preserves playback/phase/parameters; leaving both views pauses. Prior response model/controller remains separate and untouched. No rates model, rates controller or third persistent store.

Model: ideal horizontal constant-mass oscillator, inertial frame, no friction/drive; x=Acosωt,v=x′,a=v′,ΣF=ma=−kx. Support and weight cancel vertically. This equality is scoped to this force system, not a claim that one spring force is always net force. Differentiation defines rates; Newton/Hooke are assumed physical laws, not proved universally by the animation.

Dimensionless trig residuals below1e−12 are snapped consistently to+0 before all dependent quantities. Turn(v0,a≠0) and crossing(v≠0,a0) are explicit branches; speed rule based onva is used only away fromv0. Tiny nonzero displayed rates use scientific notation rather than misleading0.000. A state with instantaneousa0 does not imply future uniform motion.

Tangents are x(t0)+v(t0)Δt andv(t0)+a(t0)Δt with physical seconds. x axis remains±1m; v scale changes only with parameter group, has real tick values and a nearby explanation. Screen angle depends on scales; these are analytic prediction curves/tangents, not measured force or hardware data.

Sources checked: [OpenStax3.2 velocity/speed](https://openstax.org/books/university-physics-volume-1/pages/3-2-instantaneous-velocity-and-speed), [3.3 acceleration](https://openstax.org/books/university-physics-volume-1/pages/3-3-average-and-instantaneous-acceleration), [5.3 net-force Newton law](https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law), existing derivative#step0/#step1/#step2 andvelocity-vt#step1/#step2 anchors. Prior oscillator derivation/source remains applicable.

## Changes

- atlas `data.js`:2 concepts,2 relations,1 trail; region label broadened without changing id.
- `index.html/app.js`: rates/projection views within existing host and URL-owned route; contextual entry labels distinguish purposes; original source links retained.
- `motion-model.js`: expose speed/net-force/sign case from existing exact solution; consistent cardinal zeros. Existing physics and phase are reused.
- `motion-bridge.js/css`: two physical-unit tangent plots and sign snapshots/readings, same controls/lifecycle; shared long-word/hidden-view wrapping. No third runtime file/model/controller.
- `tests/rates-core.cjs`, `tests/rates-browser.cjs`: new invariants/user-loop coverage. Existing atlas tests' expected graph counts updated to actual33/42; all original relationship/link checks retained. Existing motion touch-target assertion now excludes intentionally hidden alternate-view controls while preserving48px visible-target requirement.
- `derivative/i18n.js`: English average-displacement/time labels consistently say velocity.
- `velocity-vt/i18n.js`: both languages, directly in s2hint/c3, restrict distance=area to this page'sv≥0; general signed area is displacement and∫|v|dt is distance. No calculation changes.
- `pages.config.js`: only atlas descriptive hardcoded count removed under exact hash guard; no other registry entries changed.
- `README.md`, atlas `README.md/BRIEF.md`, this report/design/evidence: discoverable current-vs-historical scope, commands, source assumptions and next-agent handoff.

No root index/CONCEPT-MAP, LeetCode answer/script, response runtime or prior stability fix was overwritten. Shared writes used pre-edit hash guards, preserving earlier uncommitted work.

## Commands and results

Run/test commands and existing Playwright setup: [README](../../atlas/README.md). Tested actual local server127.0.0.1:18775.

- `node --check` on touched JS/registry and new test runner: PASS.
- `node atlas/tests/rates-core.cjs`: PASS. Four snapshots plus independent first/second time differences across27 parameter groups/81 phases; signed speed, force/mass/Hooke identities, cardinal zeros, mass comparison,zero-amplitude case.
- Existing motion/response/legacy pole unit suites: PASS.
- Atlas existing browser baseline **296 PASS**, final **310 PASS**. Additional graph checks cover the new sourced nodes/edges/trail; original search/filter/history/disclosure/source/locale/mobile checks remain.
- Original motion browser suite: PASS after correcting its harness to measure only visible controls. It initially counted hidden rates buttons as0px targets; there was no visible touch-target failure. Prior pause/resume/seek/end/reset/DPR/Back/locale contracts remain covered.
- Original response browser suite: PASS, including its earlier legacy fixes and single-model separation.
- New rates browser suite: PASS, English/Chinese; four snapshots plus nonpreset.375/.625 quadrants; v/speed/a/force; same-phase mass comparison; velocity-axis stability with phase; projection↔rates shared-play continuity; node/locale/Back/source/response recovery;320/390/768/1280;3 resets; old-page caveats; DPR1/2/3;both locales320/200%;blocked storage;keyboard;forced-color focus;reduced-motion paused start. Zero page errors,zero external runtime asset requests.
- Existing root homepage suite: PASS with120 algorithm entries observed. Filters/IME/history/retry/timeout/generated registry and original entry behavior retained; no LeetCode content was changed.
- `git diff --check`: PASS. Total atlas/motion/response CSS9051+4206+1253=14510 uncompressed bytes; no new images/fonts/CDN runtime dependency. No npm build/lint configuration/TypeScript step exists for this static site; those absent checks were not claimed run.

## Independent review and repaired finding

Separate design_review agent (exact model id unavailable) first cold-walked UI, then checked source/math. One must-fix: generic slowing text hardcoded rightward motion, false for leftward slowdown. It is now direction-independent va sign logic, and both speeding/slowing branches are valid throughout the cycle. Independent narrow recheck covered20 bilingual states across both cycles/quadrants/turn/cross and found zero remaining must-fix findings.

Independent243 parameter/phase states passed physical-second central differences dx/dt=v,dv/dt=a,F=ma=−kx,speed and zero branches. Actual UI checks: playing view/locale changes retain running; Back/leave/source recovery;resets;fastest natural end;storage denial;320/390 and320/200%;tiny nonzero restoration fixtures show scientific notation without contradictoryzero;no console errors. It confirmed one shared model/bridge/clock and physically scaled tangents. It did not rerun all previous suites; those are separately implementer-run.

Independent source/record audit noted stale current README/root summary pending at review time. These were then synchronized, with current33/42/6, test commands and this index; final document-only follow-up is appended after completion.

## Remaining limits and next work

No functional blocker. Unverified physical phones/GPU, screen-reader speech, real learner comprehension/retention, actual force measurements and public delivery. This is one ideal differentiable oscillator, not arbitrary kinematics or a noisy differentiation system. Source lessons received narrow terminology corrections, not a comprehensive audit.

> Historical recommendation: the signed-integral return-trip task below was completed by [travel round4](atlas-travel-verification-20261025.md). Historical counts and rechecks are not rewritten as new executions; see the [current index](../../atlas/README.md).

Priority next: inspect actual integral/v–t learning tasks for signed displacement versus distance in a return trip, before choosing any new feature. Reuse existing models; do not add more simultaneous plots or a new controller merely for breadth. Broader ROC/stability/scientific audits remain separate. Start from the root→atlas README index, verify current HEAD/status/hashes, and preserve active LeetCode work and all prior local milestones.

Final document-only independent follow-up: PASS; handoff issues zero.24 local links,8 test entry paths and evidence directory exist. Current33/42/6 vs historical scope, shared-view pause rules, displacement/velocity scales and next signed-integral audit are consistent. This follow-up did not rerun UI/model checks; its exact record is `atlas-rates-evidence-20261025/independent-handoff-recheck.json`.

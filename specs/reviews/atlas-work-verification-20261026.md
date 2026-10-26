# Round7 verification / handoff — signed work and energy

Local2026-10-26 / UTC2026-10-25. Same confirmed `/Users/songyy/Documents/knowledge-vis`; baselineHEAD774f8e79 after concurrent campaign commits. Read round5 inventory and current seams first. Local work only,no commits/push/deployment/fees/credentials/security/system changes or denied-process retry. Main index: [atlas/README](../../atlas/README.md).

## Completed task

The new Work & energy view reuses the unique free-spring model/bridge,phase,clock,a/b,parameters,reset/session and route/help/return machinery. A learner predicts a sign,compares first/second quarter-cycles,and checks why full-return zero net work still contains positive and negative exchanges. It is not an energy-bar display.

Default fixtures: release→equilibrium gives+.72J (negative F and negative dx);equilibrium→turn gives−.72J;full return gives0J with positive+1.44J and negative−1.44J;swapped first endpoints give oriented−.72J while chronological work is+.72J. The force–position plot highlights the last directed leg,not the full return's superimposed area. The second plot shows already-calculated work rising/falling over the same seconds;it is not force integrated over time.

One combined concept,two relations and one route integrate the task:35 nodes,45 sourced relations,8 routes. No new physical controller,clock,parameter group or session key. Response remains a separate damped/driven static model.

## Files and interface

- `atlas/motion-model.js`: extract/reuse reduced cosChange from the distance interval;add pure workInterval with stable oriented work/energy changes,chronological positive/negative/net work and quarter-cycle path legs. at/interval public behavior retained and regressions rerun.
- `atlas/motion-bridge.js/css`, `atlas/index.html`: fourth shared view,two purposeful canvases,presets,endpoint/energy/contribution readouts;extract the one existing a-control into shared interval controls for travel/work. b remains the phase input. Existing play/reset/parameter/session handling reused.
- `atlas/app.js`: include work in existing route/view/focus/return/help adapters;pass canonical energy definitions. `atlas/data.js`: combined work-energy node,integral/net-force relations and route;background reuses canonical work/force definitions.
- `atlas/tests/work-core.cjs`, `work-browser.cjs`;`atlas/tests/browser.cjs` only expected35/45 counts adjusted. Existing courses,root homepage/registry/config,ResponseModel/Bridge and LeetCode answers untouched.
- `atlas/README.md`, `atlas/BRIEF.md`, existing specs design/verification/evidence index updated. Target SHA256 guards and final excluded comparisons preserve7178 captured files and newer concurrent work. No staging/reset/cleanup/commit of other changes.

API units: workInterval's work,deltaK,deltaU,positive,negative,chronologicalWork and leg work are joules. positive/negative here mean chronological WORK;use interval() for its distance contributions inmetres. Time endpoints a/b remain cycle fractions internally and map to seconds/positions for display. Shared UI work labels explicitly call them selected state time endpoints;work integrates x along the trajectory. Equal bounds zero the changes,not necessarily K/U. Reverse bounds change oriented differences while P/N remain chronological. Play advances b with a fixed;it recalculates the selected interval,not an external-energy counter.

## Scientific boundary and sources

For the ideal horizontal undamped,undriven Hookean trajectory,F=−kx and Wspring=∫pathFdx=.5k[x(a)²−x(b)²]. K=.5mv²,U=.5kx² and E=K+U. Net work on the block equals ΔK;here only spring force does nonzero work,so Wspring=Wnet=ΔK=−ΔU. For block+spring,elastic energy is internal and no driving/friction work enters. Net-work theorem still includes all forces;additional driving/damping changes the special spring-work-alone and conserved K+U statements. Never transfer this free-model ledger to the response lab.

Primary references: [OpenStax7.1](https://openstax.org/books/university-physics-volume-1/pages/7-1-work),[7.3](https://openstax.org/books/university-physics-volume-1/pages/7-3-work-energy-theorem),[8.1](https://openstax.org/books/university-physics-volume-1/pages/8-1-potential-energy-of-a-system),[8.3](https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy). Earlier spring/integration/rate sources retained. Definitions for K/U/J are authored once on the canonical node and rendered in both starting ideas and inline work. Parameter edits remain hypothetical same-phase comparisons,not real mechanical work protocols.

Analytic differences use−kA²/4[cos(4πb)−cos(4πa)] with reduced stable cosine differences rather than nearly equal squared endpoints. Work-sign changes occur at quarter-cycles (Fv=0);the half-cycle cuts sufficient for distance cannot show energy exchanges. Plot sampling illustrates analytic results. DeltaK is assigned from the analytic identity;that assignment alone is not independent proof. Tests below use separate endpoint energies,Fdx/Fvdt and high-precision references.

## Actual verification

Static/model commands,all17 passed:

```sh
node --check atlas/app.js
node --check atlas/data.js
node --check atlas/motion-model.js
node --check atlas/motion-bridge.js
node --check atlas/response-model.js
node --check atlas/response-bridge.js
node --check atlas/tests/work-core.cjs
node --check atlas/tests/work-browser.cjs
node atlas/tests/work-core.cjs
node atlas/tests/foundations-core.cjs
node atlas/tests/motion-core.cjs
node atlas/tests/rates-core.cjs
node atlas/tests/response-core.cjs
node atlas/tests/travel-core.cjs
node atlas/tests/legacy-signed-area.cjs
node laplace/tests/pole-boundaries.cjs
git diff --check
```

New work suite6174 counted checks:quarter signs,energy invariants,work vs independently computed endpoint K/U,swaps,equal/same-position/opposite-position/full/two-cycle bounds,positive/negative ledger and legs,parameter scaling,invalid and adjacent tiny spans. Separate sampled Fdx errors max1.26e-15J;physical-time Fvdt quadrature max3.44e-10J. Fdt alone is not used for work. Original6107 distance checks and prior force/rate/response cases pass with extracted helper.

Use installed Chrome/Playwright;no dependency changes. In repo set `NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules`, `ATLAS_BASE_URL=http://127.0.0.1:18775`, and a writable suite-specific evidence folder. Run **serially** against the local server:

```sh
node atlas/tests/browser.cjs
node atlas/tests/motion-browser.cjs
node atlas/tests/rates-browser.cjs
node atlas/tests/response-browser.cjs
node atlas/tests/travel-browser.cjs
node atlas/tests/continuity-browser.cjs
node atlas/tests/foundations-browser.cjs
ATLAS_WORK_EVIDENCE=/tmp/atlas-work node atlas/tests/work-browser.cjs
```

All eight atlas browser suites passed on final code. Homepage regression also passed with existing `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`, `HOME_TEST_URL=http://127.0.0.1:18775/`, `HOME_TEST_EVIDENCE=<folder>`, `node tests/leetcode-home-section.cjs` (120catalog entries). Total9 serial suites;full stdout/exit/timing in serial-regressions.json. Accepted final work screenshots and work-regression-work-browser.json come from the final serial run after copy fixes;the earlier work-browser report is an initial functional run. No concurrent-pressure testing or process inspection this round.

- Atlas325 checks cover35 nodes,45 relations,8 trails,all actual internal source anchors,both locales,graph/list/search/filter/history. No external runtime asset requests or page exceptions in accepted runs.
- Work browser verifies first/second-quarter scalar signs AND actual F–x shaded-pixel colors;negative F/negative dx shades cyan positive work,positive F/negative dx shades amber negative work. A plotted intermediate white peak is visible while final full-return work is zero. Ledger includes positive/negative exchanges.
- Equal/reversed bounds,parameter scaling,exactly one a/b input,4-view play/locale continuity,source course Back/reload/current-return/response/help recovery,3 resets,end/replay pass. Shared travel copy remains correct after extracting controls.
- English/Chinese320/390/768/1280,visible48px controls,320px/200% keyboard heading/current-return focus,DPR1/2/3 repeated resize,denied storage,forced-colors and reduced-motion paused entry pass. Screenshots saved and inspected. This is text-size automation,not physical-phone/pinch-zoom/screenreader speech validation.

## Independent review / repaired findings

Independent design BUILD/REUSE passed before implementation. Final science/teaching acceptance PASS,zero remaining must-fix findings in scope. It independently checked534 work intervals against110-digit Decimal endpoint elastic-energy differences and quarter-partitioned exchanges:maxabs8.90e-16J,max adjacent/tiny-span relative8.56e-17. It also reran the prior456-case distance reference on the shared helper:maxabs7.43e-16m. Scripts/results,including nested travel-regression evidence,are archived;old records were not overwritten.

Finite-floating-point boundary:12 nearly symmetric long-span results whose real work is around1e-16J round to zero in JS. These pass absolute-error bounds,not a guarantee of relative accuracy for every near-zero number. Displayed endpoints/readouts are rounded;analytic changes are not computed by subtracting printed values. No arbitrary-precision or real-world work measurement claim.

Independent single-page Chrome learner walkthrough and saved-image inspection verified arrows/axes,negative-force positive-work reasoning,quarter exchange/full return,state/Back/shared inputs,parameter rules,scope and bilingual320/200%. It found two must-fix copy contradictions,then narrowly rechecked their repair:

1. Work inherited travel's “time integral limits” labels. Work now says state-selection time endpoints tied to x(a)/x(b),and explicitly integrates x. Travel's original time-integral labels retained.
2. Equal-bound ledger unconditionally claimed intermediate exchange. Ledger now neutrally lists chronological P,N and sum;equal-bound text correctly permits nonzero endpoint energies with zero changes.
3. Same copy pass explicitly preserved the general net-work theorem while limiting only spring-alone/energy-conservation statements when extra forces act.

Reviewer's first UI script used nonexistent workIntro instead of the dynamic intro locator;its timeout is retained separately and the corrected fixture passed. It was not an application failure. Independent report accurately separates its own checks from implementer cumulative suites. No further model/UI fixes remain. Final static content checks also passed:71 app keys and159 merged motion keys have bilingual/placeholder parity,all118 motion DOM dictionary references resolve,31 local handoff links exist,all own hashes match and git diff --check is clean.

## Preview / handoff priorities and limits

Preview already served from real working tree: http://127.0.0.1:18775/atlas/?trail=work&node=work-energy . Choose release→equilibrium,then next quarter,then whole return. a/b/parameters persist across the four free-motion views;starting ideas and original source/current-return flows remain. If server is absent,start `python3 -m http.server 18775 --bind 127.0.0.1` from repo;do not kill unrelated services or repeat denied process actions.

Next by learning value:observe real predictions/explanations of F/dx signs and zero net vs nonzero exchange;decide from evidence whether an extra answer reveal/example helps. Instantaneous-power/rate and circuit-power connections are only a candidate audit,not a new feature mandate. Before another free-motion view,inspect app adapter lists/shared controls together and retain one clock/state. Broader legacy/damping/variable-force solvers,devices,speech,hardware,production delivery/load and learning outcomes are not certified.

All completed/remaining work is indexed in atlas/README with exact source/test records. No claims of measured learning effects. Parent selects the next bounded milestone.

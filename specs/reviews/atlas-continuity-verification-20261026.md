# Round5 verification and handoff — learning continuity

Local iteration2026-10-26 (UTC2026-10-25); confirmed repository `/Users/songyy/Documents/knowledge-vis`. Scope: first-visitor audit → priority → minimal repair → cumulative checks → independent recheck. Local only; no commits/push/deployment/fees/credentials/system changes. Main index remains [atlas/README](../../atlas/README.md).

## Outcome / concrete learner loop

Three independently reproduced P1 breaks are repaired:

1. Fresh mobile route entry: motion/response previously left the opened experiment below the viewport with focus outside it, unlike rates/travel. All four now reveal/focus their own existing headings.
2. View changes intentionally preserve the selected concept. When it is outside the new route, bilingual text now explains the unmatched selection both beside stops and in the active experiment. No automatic node replacement, prerequisite gate or progress inference.
3. Travel→oscillation previously left a learner at a long-distance detail card with only other-view openers. Every active experiment now has an explicitly named “Return to current experiment” action in detail. It only focuses/scrolls; URL,history,node,filters,phase,a/b,m/k/A,zeta/r and playback remain unchanged. It replaces the active view's duplicate opener. Original course/source links and other experiment choices remain. Leaving the page still pauses by the established rule; the same-page return button itself does not pause a running experiment.

A final independent keyboard check also found that the inherited rates/travel focus APIs could focus a subheading below the viewport at320px/200% after scrolling the host top. It was reproduced red, then fixed within the same app dispatcher by focusing the current view’s dynamic H2 for all shared views; all original detail openers now use this dispatcher too. Assertions now check the focused rectangle is visible, not only DOM containment. Bridges/models remain untouched.

The accepted learning loop is: choose a question → see its experiment → inspect a concept → read actual existing course → browser Back → return to the same experiment without resetting context. Ordinary non-inline trails stay editorial navigation. No concepts or model features added:34 nodes,43 sourced relations,7 trails remain.

## Changed files and ownership

- `atlas/app.js`: existing focus API dispatcher, current-experiment return action, safe bilingual route-context text, first-visit scope wording. Atlas still solely owns URL/locale; no new store/controller.
- `atlas/index.html`: two hidden context paragraphs managed by app; static intro sync; only changed app/style query versions bumped.
- `atlas/style.css`: one scoped context-note style using existing tokens/focus/48px patterns.
- `atlas/tests/continuity-browser.cjs`: real-browser acceptance at the navigation seam.
- `atlas/README.md`, `atlas/BRIEF.md`, this design/verification/evidence: existing traceability index extended with completed/pending/P2/next scope.

Data, models, bridges, all original lesson code, root homepage/config/registration and LeetCode answers are untouched. Target SHA256 guards used before every apply. See concurrency.json for final own hashes, planned-but-untouched targets and7178 excluded hashes comparison; newer unrelated work is preserved. Temporary test staging was briefly created under repo `atlas-continuity/` due to a wrong working directory, then moved to task-5; only those just-created empty directories were removed. No residual staging tree or other file cleanup.

## Red → green evidence

- `entry-before.json`: own fresh390×844 run, motion hosttop1219.3px/response814.3px with no host focus; rates/travel16.3px with heading focus. Same assertions after repair pass for all four; `entry-after.json`.
- `context-before.json`: travel→oscillation had0 current-travel return actions; shared view retained an outside-route unit-circle with0 context notes. Same checks now pass; `context-after.json`.
- `focus-zoom-before.json`/`focus-zoom-after.json`: focused rates/travel subheadings were outside844px viewport; final current-view H2 rectangles all lie within it. New full continuity checks cover route,return and original contextual-open keyboard paths in both languages.
- Independent audit screenshots/positions validate all three breaks, not only developer descriptions. Repair design accepted before edits; neutral optional-choice wording and no reselect/state mutation adopted.

## Cumulative browser transport failure and resolution of acceptance

The first overlapping run of5 older browser suites plus continuity had missing script/skeleton errors in atlas,motion,rates,response; travel/continuity passed. These failures were NOT counted as acceptance.

Following the diagnosing-bugs discipline, a stable-file probe recorded requestfailed/status/decoded sizes/globals. Serial1:0/6 failures. Six simultaneous pages:9/12 failures, with `net::ERR_CONNECTION_RESET` and0-byte bodies, including unchanged motion/response modules. Missing response-bridge directly reproduced undefined.update. No files were being written during this probe. This confirms a concurrency-dependent local transport limitation; the exact Python/kernel/proxy reset mechanism remains unproven. It does not establish a production app startup regression or production load capacity.

All original complete suites were then run **one at a time**, without changing app code or suppressing errors: atlas,motion,rates,response,travel,home all passed. `serial-regressions.json` includes commands/stdout/stderr/exit/timings. `diagnosis.md`, `load-probe.cjs/json` preserve the failures, hypotheses and evidence. Future agents should serialize browser suites against this local preview, not add retries/error suppression to pretend missing assets are okay.

An optional read-only `ps -p69578 -o pid,ppid,command` inspection was denied by the environment (“operation not permitted”) and not retried. `lsof` confirmed the Python listener and browser network proof was sufficient. This denied optional diagnostic does not block implementation or acceptance; no process/settings were changed.

## Reproducible commands / final results

From repo, existing Playwright at `/Users/songyy/Documents/integ-life/integ-games/node_modules`; installed Chrome used. No dependencies installed. No npm build,lint configuration or TypeScript step exists; syntax/model tests are the relevant static checks.

```sh
node --check atlas/app.js
node --check atlas/data.js
node --check atlas/motion-model.js
node --check atlas/motion-bridge.js
node --check atlas/response-model.js
node --check atlas/response-bridge.js
node --check integral/i18n.js
node --check atlas/tests/continuity-browser.cjs
node atlas/tests/motion-core.cjs
node atlas/tests/rates-core.cjs
node atlas/tests/response-core.cjs
node atlas/tests/travel-core.cjs
node atlas/tests/legacy-signed-area.cjs
node laplace/tests/pole-boundaries.cjs
git diff --check
```

All15 commands passed; rechecked after the visible-focus repair. Travel retains6107 counted checks and independent physical-time quadrature error6.56e-8m; no numerical model altered. Current source/physical assumptions remain those documented in rounds1–4; this round changes navigation only.

Set `NODE_PATH=/Users/songyy/Documents/integ-life/integ-games/node_modules`, `ATLAS_BASE_URL=http://127.0.0.1:18775`, and the suite-specific evidence folder variable (atlas/README). Run browser commands serially:

```sh
node atlas/tests/browser.cjs
node atlas/tests/motion-browser.cjs
node atlas/tests/rates-browser.cjs
node atlas/tests/response-browser.cjs
node atlas/tests/travel-browser.cjs
node atlas/tests/continuity-browser.cjs
```

- Atlas317 checks: all34 nodes/43 edges/7 trails, graph/list/search/filters, actual internal anchors, bilingual selection/Back. No graph expansion.
- Earlier four lab suites passed in full: scientific cases, shared single clock, phase/params/session/language/Back, repeated resets and all previously repaired legacy fixtures. No new errors or external runtime requests in final suites.
- Continuity passed in both languages: four consistent route entries; current-view return preserving URL/node/filter/history/paused state; actual course→Back→return; close/Back; visible translated outside-route note without reselect; travel→spring return; running return does not pause/restart; ordinary trail unchanged.
- Widths320/390/768/1280,48px targets,200% text,keyboard Enter,forced-colors focus,reduced-motion no autoplay,denied storage. Screenshots inspected. Existing four suites retain their DPR1/2/3/resize coverage.
- Homepage existing suite passed120 catalog entries with `HOME_TEST_URL=http://127.0.0.1:18775/`, `HOME_TEST_EVIDENCE=<folder>`, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`, `node tests/leetcode-home-section.cjs`. This is read-only catalog/navigation coverage, not LeetCode solution validation.
- All58 app dictionary keys/placeholders match across languages;25 local handoff links exist. Final independent repair acceptance PASS: zero remaining must-fix findings, including24 keyboard route/return/contextual-open paths with visible H2 rectangles.

## Independent review / remaining priorities

Initial independent first-visitor review recorded3P1 and P2 background guidance. The independent repaired-flow run passed all three, then its final focused-rectangle check found one inherited200% keyboard residual; that was red→green repaired before delivery. Final independent narrow visible-focus acceptance passed24 paths (two locales×four views×route/return/contextual opener), focused H2 top133–226px within844px viewport. Pure return retained exact state/history. Zero required findings remain in the reviewed scope; its complete acceptance.md and before/after scripts are archived.

> Historical P2/work inventory: starting-ideas/x″ context was added in [foundations round6](atlas-foundations-verification-20261026.md), and the proposed signed-work task in [work round7](atlas-work-verification-20261026.md). The following paragraphs preserve round5’s decision, not today’s implementation status. Real-learner validation remains outstanding; see the [current index](../../atlas/README.md).

P2 remains: a nearby plain-language x″=acceleration explanation and optional background guidance could help; question cards do not provide a beginner background map; advanced response mathematics may need a short, source-linked starting-ideas note. Existing lessons and local term explanations exist, so do not build a prerequisite/mastery system. Next audit should test a concrete novice prediction/explanation task and add only needed context. Agent cold-walk is usability/editorial evidence, not measured comprehension/retention.

Work–energy inventory is in the design: existing lever-pulley/circuit/particle lessons do not cover signed variable spring work; MotionModel already has K/U/E. A future task could compare quarter-cycle positive/negative spring work with whole-return cancellation, using the same bounds/model, exact units and block-vs-block+spring boundary. Sources7.2/7.3/8.1/8.3 are linked there. No energy feature added: the measured continuity failures were the highest-value closure, and a new task needs its own brief/review.

No physical phone,screen-reader speech,hardware,production load,public deployment or human learning-outcome validation. No full-site scientific certification. Local preview http://127.0.0.1:18775/atlas/ — select any of the four experiment routes, then inspect a concept and use Return to current experiment.

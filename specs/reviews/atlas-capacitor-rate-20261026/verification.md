# Capacitor-rate bridge: scoped verification and handoff

Base:227f37b692ecbdad8682c6a0b8df7fb4afd5f2d4. Isolated branch codex/atlas-capacitor-rate-20261026. Original dirty checkout and LeetCode untouched. Contract: [atlas-capacitor-rate](../../atlas-capacitor-rate.md). This is one calculus→circuit loop, not whole-site acceptance.

## Delivered behavior

One real derivative→capacitor application statement, two existing-course stations, no new concepts. Graph38/49/12. The unchanged capacitor pulse model now provides both its existing absolute-voltage trace and a fixed-scale relativeΔv/rise-run view over the same last two endpoints. +20mA/0/−20mA give+200/0/−200V/s; zero current holds an existing voltage. Initial/reset states have no measured interval. No new state/store/clock/model. Shared plot(), inductor and Buck/Boost code remain byte-identical to base.

Primary claims were checked against OpenStaxvol2 sections8.1 (Q=CV,constantC) and9.1 (I=dQ/dt); passive signed convention is named. New graph edge source9.1 and station source8.1 resolve to those claims; course shows both. Piecewise constant current makes interval and interior derivative equal; voltage is not two-sided differentiable at a genuine current jump. Negativei lowers signedV and can increase stored energy at negativeV. This is a prescribed-current ideal capacitor, not an RC/physical-circuit measurement.

## Evidence and reproducible commands

Preview: `python3 -m http.server 18929 --bind 127.0.0.1` from repository root. Node browser commands use existing Playwright via NODE_PATH, no new installation.

- Baseline `baseline.json` and `before-390.png`: no derivative/capacitor edge or route, no local slope view; existing positive pulse still yields0.1V. Missing feature reproduced before change.
- `node --check atlas/data.js`, `node --check power-converters/app.js`, `git diff --check`: pass.
- `node atlas/tests/capacitor-rate-core.cjs`: pass; independent Q/C and current/C checks, signed energy/crosszero, actual unchanged model/shared app assertions. `core.json`.
- `node atlas/tests/data-quality.cjs` and `data-quality-core.cjs`: pass; real references/optional task fields, no inferred prerequisite, malformed fixtures and general cycle distinction. `data-quality.json`.
- `node atlas/tests/signal-path-core.cjs`: existing signal math still passes; only current49-edge expected count updated.
- `node power-converters/tests/model.cjs` and `node atlas/galaxy/tests/core.cjs`: pass existing converter model and finite deterministic real-graph layout.
- `NODE_PATH=<existing node_modules> node atlas/tests/capacitor-rate-browser.cjs`: pass. Actual derivative probe−1/0/+1, taskNext, capacitor pulses/zero/crosszero, locale, refresh reset, Back/Atlas station; EN/ZH390, true computed200%text at320, keyboard/48px/3px/forcedcolors/reduced motion,16limit/repeatedreset; no pageerrors. `browser/` includes rising/flat/falling screenshot pairs, inspected by implementer. Text clarifier/spaces refined after independent read, same narrow suite rerun.
- Existing `power-converters/tests/flow-lifecycle.cjs` and `atlas/tests/browser.cjs`: serial pass; `flow-lifecycle.log`, `atlas-browser.log`/`atlas-regression/`. No unrelated whole-site retest.
- Independent design/scientific/code review: `design-review.md`, `capacitor-rate-review-20261026.md`, zero mustfix. Separate agent independently recomputed and exercised renderer without browser. No self-check presented as independent.
- UI-first independent EN/ZH390 cold task walk: `cold-review/review.md`, actual horizontal/downward Δv geometry, reset/Back correct, zero mustfix. Agent initially corrected its own regex selector before claiming the zero-current case. This is an AI walk, not a human learner study.

## Publication and limits

At this implementation record, commits/remote/deployment are not yet asserted. The final delivery record will identify the resulting SHA/release and exact installed files. Public access previously returned Cloudflare403/error1010; no public retry/bypass in this batch. Server-local installation/hashes, if verified, are not public browser acceptance. No physical phone, Safari, speech accessibility, hardware or measured learning-effect result. Full new-document course load resets pulse sequence by design; Atlas reading context is retained via existing URL/history only.

## Next bounded recommendation

After observing this current/rate distinction with a real learner, consider the existing inductor dual v=L di/dt using the same pulse approach; first establish a concrete learner gap. Do not duplicate models or automatically add every calculus relation. Public access diagnostics require site-owner inspection of Cloudflare events, not an alternate network client.

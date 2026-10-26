# Signal-fingerprint route · implementation and handoff

Based on main83cc8901; scoped candidate, not a production status claim. Feature:
`/atlas/?trail=signal&node=lti&view=list`.38concepts remain; one representation
edge and one route make48relations/11routes. No new lesson/model/store/clock or
LeetCode change. The current production revision is only `/visual-release.json`.

## What changed and why

The baseline snapshot demonstrates the absent convolution→frequency-response
relation and absent four-station route, not broken existing course URLs. New
station tasks connect conditions→h→multiply/sum→frequency cancellation, with
explicit action, folded observation/why, named evidence and exact experiment.
The existing3tap/2tap experiments supply causal waveform changes; no hidden
cross-course parameter transfer, completion profile or mastery claims.

[Spec](../../atlas-signal-path.md), [independent design](design-review.md),
[code/science](code-review.md), [cold UI](cold-review/review.md). Review found two
new seams; both resolved before delivery. Invalid optional route nodes previously
threw; null/object/array-task fixtures now return structured validation errors.
Guide focus could stay above the desktop viewport; actual before/after browser
coordinates are adjacent. `scrollIntoView(nearest)` plus the existing12px token
margin keeps the heading and focus ring visible, including fractional rounding.
The cold reader also observed Reset discarding an edited convolution kernel;
task copy now prescribes edit→Step and explicitly says Reset restores defaults.
No change to the existing course's correct reset semantics was needed.

## Reproducible final verification

- `node atlas/tests/signal-path-core.cjs`: actual LTI impulse/recurrence and
  frequency-response helpers, exact3tap cancellation,2tap halfgain, nonzero
  startup and rounded-frequency distinction. Not a universal numerical solver.
- `node atlas/tests/data-quality-core.cjs`; `node atlas/tests/data-quality.cjs`:
  structured malformed data, node/edge IDs, bilingual station fields, claim-edge
  endpoints and coverage; general relation cycles allowed. Local source files
  exist. Existing data-quality browser/atlas browser checks actual anchor targets.
- `ATLAS_BASE_URL=http://127.0.0.1:18923 NODE_PATH=<existing Playwright modules>
  node atlas/tests/signal-focus.cjs`: original draft focus branch→current branch
  in read-only browser interception, same page layout; before heading top−213px,
  after≈12px. No source files were reverted or written by the harness.
- Same environment: `node atlas/tests/signal-path-browser.cjs`: four actual
  destinations, counterexample/impulse/step actions, edited kernel retained,
  exactM3zero→unchangedΩ/M2half and screenshot comparison, Back/reload, route
  close/reopen/offroute context, EN/ZH320/390/1280, visible heading focus,48px,
  doubledtext and forced/reduced modes. No pageerror. Browser closes in finally.
- Existing shared browser regressions passed serially: `browser.cjs`,
  `continuity-browser.cjs`, `motion-browser.cjs`, `response-browser.cjs`,
  `rates-browser.cjs`, `travel-browser.cjs`, `work-browser.cjs`.
  Logs/JSON copied under regressions/. Only the expected new graphedge count
  changed in the old atlas harness; old assertions were not weakened.
- Existing motion/response/rates/travel/work, foundations, signal-domain and
  galaxy-layout core suites passed. Existing lessons' mathematics was not edited.
  New relation participates in the same real-graph galaxy layout.

Independent cold UI used no internal model as evidence: observed the exact
preset nearzero and unchanged-frequency halfgain; task links/Back/keyboard and
Chinese390 guide worked. Its report is deliberately partial: it did not inspect
all sums or compare waveform images. Root independently inspected the saved
M3/M2 screenshots; independent code/science review separately checked sources.
A provider-capacity interruption resumed only to finish existing evidence; all
owned Chrome sessions closed. This is not a real-human learning study.

## Publication / next checkpoint

Implementation/source provenance commit is recorded in the final edition header
and delivery report. Preserve main83cc8901 and original dirty worktrees. Refresh
remote main before normal integration; no force push. Parent coordinates release
for this new candidate. Do not call it online from push alone. A later scoped
release must include Atlas HTML/app/data/style and inventory; ensure Galaxy's
shared data reference is fresh too. No other course runtimes need replacement.

Supported current-Mac quota API at11:33:05UTC:10080-minute weekly window used6%,
remaining94%, resets2026-11-02T06:08:19Z; five-hour data absent. Did not trigger
≤20%pause. Initial callable discovery was transiently unavailable; no restricted
storage/UI, new service/package installation or extra credit was used.

Limits: Chrome emulation only; no physical phone/Safari/screen-reader speech,
actual speaker audition or measured learning effect. First useful next slice:
observe this bounded path with a learner/device, then use actual return-context
friction to decide whether other ordinary routes merit station tasks. Do not
mechanically expand every route or start another batch before parent checkpoint.

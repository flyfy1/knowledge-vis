# #920 author self-check — ready for separate review

Candidate is confined to `leetcode/920/`. It is authored and self-checked, not
independently accepted, submitted to LeetCode, registered, or deployed. The
already-running preview is http://127.0.0.1:18786/leetcode/920/ .
Official source and supported Python3 signature are captured with access time in
`provenance/official.json`. All 19 observed language snippets are retained there.

## Reproduce from the repository root

```sh
python3 -B leetcode/920/tests/test_solution.py
node leetcode/920/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 920 --validate-only
```

All three commands completed with exit code 0. Preflight produced no stdout or
stderr; see `tests/evidence/preflight.txt`. It was validate-only: no registration
or shared file mutation. Complexity metadata is one string covering time/space.

Both test runners accept `OUTPUT_DIR` (an absolute path is recommended) for all
results, screenshots, downloads and temporary browser profiles. The browser test
uses `NODE_PATH` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` from the environment,
and `PREVIEW_ROOT` optionally overrides the existing preview origin. It never
starts a service. Its short-lived zoom extension/profile is removed after use.

## Computation and source fidelity

`tests/evidence/numerical.json`: 435 canonical cases (all legal n<=4, goal<=7;
180 reproducible seeded cases up to 100; factorial and one-song boundaries;
official examples; fresh transfer example). Independent brute force uses
last-occurrence distance, not the DP recurrence. A separately derived
inclusion–exclusion count checks larger cases. The displayed streamed baseline
is also extracted and executed. All 62 teaching frames have every known cell
checked against exhaustive prefix buckets, including zero/impossible states and
both transition contributions. Deep snapshots, unknown cells and source mirror
are checked. Duplicate localization keys are rejected before parsing can hide
them; all 73 entries are nonempty two-string pairs.

Canonical `solution.py`, JSON mirror, visible textContent, automatic clipboard,
native manual clipboard and downloaded bytes match exactly, including final
newline. Per-attempt fresh sentinel writes/readbacks precede every manual copy
in both locales, twice each; actual Linux Control+C performs the transfer.
Neither a mocked source clipboard nor DOM selection alone substitutes for it.

## Browser and rendered meaning

`tests/evidence/browser.json`: Chromium 156.0.8078.4 on Linux; 38 recorded state
observations, 18 screenshots, no console/page/asset errors. Both locales cover
all six presets, initial/end disabled controls, forward/back/forward identity,
reset, source values and current-cell identity at (2,2), complete displayed
recurrence operands, all three prediction options, reveal then change, and
locale-preserved position/selection/feedback. Trace resets preserve the separate
question. Exact localized H1 and document titles are checked against metadata,
including narrow zh→en→zh paths. Keyboard Enter/Tab and 3px focus are exercised.
Blocked localStorage still initializes and changes language. The offline file
page displays the source and simulation with no network. Runtime assets are local.

Rendered related links were followed with keyboard Enter in both languages at
320px; the report retains labels, resolved URLs, destination excerpts and target
copy hashes. #629 step2 actually counts permutations in D[i][j] and reuses
neighboring sums; #552 step2 counts legal attendance prefixes with six states.
These are available in this preview; public-release inclusion is a later gate.

Screenshots were visually inspected, including the populated n=4/goal=4/k=0
frame (3,3)=24 with N=12 and R=0, both 320/390px layouts, 736x414 landscape,
1440px desktop, and native 200% browser zoom. Table captures omit only the sticky
nav overlay during capture so captions remain inspectable; ordinary viewport
captures retain it. Long text wraps; number/marker associations remain readable.
Selected preset text has a measured width budget including padding and a 24px
native-arrow reserve. Essential labels are not replaced with ellipses.

Native zoom uses Chromium tabs.setZoom(2), yielding outerWidth=1280,
innerWidth=640 and devicePixelRatio=2. Final captures use CDP fromSurface=true;
they contain the actual enlarged table and calculation. Physical phones, other
browser engines and production delivery were not tested.

## Accessibility and bytes

Contrast helper was calibrated against black/white=21, all three sRGB primaries,
and #747474 on black=4.492948 (correctly fails 4.5 without rounding). Actual solid
palette text/background pairs are recorded with unrounded results; the minimum
is 6.449407898769069:1 for muted on panel2. Main text exceeds 7:1. Focus/accent
and selected button text pairs also pass their thresholds. Disabled controls
use solid legible colors, not opacity. This solid-color check does not claim to
measure arbitrary compositing. There are no local motion effects; native table,
fieldset, radio, labels and disabled buttons retain semantics.

Shared plus local shipped CSS totals 11,446 bytes, below 25,000. No runtime
images, fonts, trackers or external assets were added. Evidence PNGs and official
captures are review material, never runtime dependencies.

## Harness corrections during authoring

- An early assertion looked for adjacent `2 × 1` in the English calculation,
  whose source-cell label occurs between those operands. It failed despite the
  correct displayed value. The final test asserts the complete independent
  English and Chinese calculation strings.
- A zoom extension listener initially raced page completion; the final runner
  explicitly awaits its worker and sets the target tab zoom.
- Playwright's ordinary screenshot at native zoom produced a background-only
  capture. Visual inspection caught that harness issue. CDP fromSurface captures
  show content; a nonblank byte-size guard supplements visual inspection.
  No lesson runtime change was needed for these harness corrections.

These checks establish the stated computational and UI behavior only. Separate
cold teaching review and any actual learner teach-back remain pending.
`tests/evidence/candidate.json` freezes source/test/provenance and shared-asset
hashes for the reviewer; it is not an acceptance record.

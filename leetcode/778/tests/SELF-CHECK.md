# Author self-check — candidate 778-author-r1

Status: complete author candidate, ready for separate independent review.
No independent acceptance, LeetCode submission, deployment or learner study is
claimed. The approved shared design pattern is reused. Only leetcode/778/ was
created/edited; no registry, shared file, service or campaign status was changed.

## Official contract and numerical evidence

`provenance/official.json` is the dated public official GraphQL response including
statement, both examples, constraints and the observed language/interface
snippets. Python3's exact interface is `Solution.swimInWater(self,
grid: list[list[int]]) -> int`. All original snippets are retained, including
Python, TypeScript and JavaScript; Python is the preferred faithful interface.
The canonical source preserves the input and returns an integer minimum time.

- `python3 -B leetcode/778/tests/test_solution.py`: PASS, 486 cases. Both official
  examples (3 and 16), singleton, the greedy counterexample (5), fresh prediction
  (4), all 24 permutations of 2×2, seed 778 random cases (n=3,4,5,8), and two
  n=50 cases with known result 2499. The independently derived oracle tests
  reachability at successive thresholds, without weighted relaxation.
- `node leetcode/778/tests/test_core.cjs`: PASS, 484 fixtures, 6,384 frames,
  16,816 neighbor calculations. Every permanent value matches an independently
  computed per-cell optimum; tentative values are feasible upper bounds;
  permanent costs never decrease. Every candidate, comparison and update is
  verified; snapshots do not alias later queues. Exact offline source parity
  and Acorn duplicate-key detection pass.
- Baseline code displayed in the lesson is also executable and tested against
  the separate oracle on all n≤5 cases. It returns earliest integer water level;
  its O(n⁴) time comes from up to n² fresh O(n²) threshold searches.

## Browser and rendered-state evidence

`node leetcode/778/tests/browser.cjs`: PASS on real Chromium 156.0.8078.4 on Linux,
using the supplied preview origin. `browser-results.json` records exact localized
algorithm/UI text, geometry, colors and assertions. Both locales cover all five
presets and all 74 combined frames, both endpoints, rewind/replay, reset, end,
hand reveal/hide, all prediction choices, explicit reveal, changed-answer feedback
clearing, unrelated reset isolation and locale-after-interaction preservation.
The full formula is compared literally in both locales. H1 and document title
are compared to the exact bilingual identity, including #778.

Source display via textContent, offline mirror, automatic clipboard transfer,
and downloaded bytes equal solution.py exactly, including the final newline.
Manual fallback seeds a distinct sentinel, denies writeText, checks textarea
focus/full selection, dispatches actual Linux Control+C, then reads back the
canonical source from Chromium's clipboard. No test writes the expected source
into the clipboard during the fallback check. Denied storage and offline file
opening both initialize and operate successfully. Runtime requests remain local;
no console/page errors or failed assets were observed.

All 320/390/736/1440px layouts were captured in Chinese and English. 200% CSS
layout zoom was checked at 390/1440px in both languages. This is not a native
browser-zoom or physical-phone claim. The diagram is deliberately horizontally
scrollable with legible cell sizes and sticky row headers, rather than scaled
down; keyboard ArrowRight verifies access to its offscreen columns. Tab/Enter,
3px focus outlines, 48px controls, forced colors and reduced motion were checked.

Solid-color contrast uses the actual shared computed palette and is calibrated
with black/white (21), primary colors, and #747474 on black (4.492948, correctly
below 4.5). Measured core text/panel2 is 13.397:1; muted/panel2 6.449:1;
focus orange/panel2 8.937:1. Eight relevant pairs pass AA. Disabled controls retain
full opacity and readable text. Shared plus local CSS is 11,629 bytes.

`node leetcode/778/tests/supplement.cjs`: PASS. Actual related links were activated
with Enter in both locales. #23 step1 explains heap parent ordering and minimum
selection; #407 step2 explains expansion from boundary cells and max of escape
level/neighbor height. These labels promise those concepts, not identical
algorithms. Actual observed destination text is in related-links.json. The
lesson-local index points to these existing served sections; target publication
identity must still be checked by any future release process.

## Visual inspection and author walkthrough

The author opened and visually inspected every final trace-*.png (eight widths /
locales), zoom-*.png (four maps plus two control captures), heading-*.png,
prediction-*.png and forced-colors.png. Map H/D/status text stays associated;
current/settled states use outlines, underlines and text, not color alone. At
320px and 390px/200% zoom, only part of a wide map is visible at once, as stated
beside it; keyboard scrolling exposes the remaining columns. Numbered selectors
retain a complete localized map name below, including at 200% zoom. The sticky
step navigation can scroll horizontally. Captured scroll positions sometimes
place earlier prose behind the sticky bar; actual section-link navigation waits
for the settled scroll target and verifies that the heading is below the bar.

Author walkthrough (not independent novice evidence): step0 distinguishes time
from steps and height sums; step1 repeats reachable sets across thresholds and
shows why discarding the downward route loses to 7 instead of 5; step2 extends
by max, keeps the smaller bottleneck for each destination, and derives permanent
minima from the first-unsettled-cell contradiction; step3 needs both a path at 4
and a blocked reachable region at 3; step4 maps those operations to actual heap
code and separates submission space from teaching snapshots.

## Corrections made during authoring

- The initial static table inherited a 360px minimum and overflowed 320px.
  Scoped scroll behavior to the simulated map, made the hand table flexible,
  widened map cells, and enabled long path/code-token wrapping. The retained
  layout-first-failure.png documents the earlier layout investigation.
- Narrow 200% layout exposed header crowding and a native select label too wide
  for its closed control (97.73px text + 30px padding + arrow allowance inside
  131px). Header wraps; the select now uses numbers with the full localized name
  below and an 80px minimum. zoom-controls-*.png shows the repaired controls.
- Corrected test harness assumptions: mutating a frame itself is not an alias
  test; checking the already-selected radio does not emit a change; numbered
  labels require Playwright selection by explicit value; smooth deep-link
  scrolling must reach its target rather than use a fixed 500ms wait. One run
  lost its browser target during the final offline check; isolated reproduction
  and the complete final run both pass. No historical review was altered.

## Reproduction, frozen gate and limits

See README.md for OUTPUT_DIR-aware commands. The safe non-mutating metadata gate
was run from the repository root:
`python3 -B scripts/register_leetcode_lesson.py 778 --validate-only`.
Result: exit 0, PASS; no stdout/stderr. Exact receipt is metadata-preflight.json.
Metadata fixes, if needed after this freeze, require a new candidate and separate
review; no registration or campaign-report modification is authorized here.

candidate-manifest.json binds the candidate source, tests, metadata, official
capture and shared-policy identities by SHA-256. Separate independent cold
walkthrough and six-dimension review remain pending. Real-device behavior,
native browser zoom, screen-reader audio, novice learning, production delivery
and actual LeetCode judge acceptance are unverified.

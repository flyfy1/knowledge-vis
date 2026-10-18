# #123 author self-check

Status: complete author candidate, ready for a separate independent review.
This is an author self-check, not independent acceptance, a novice study,
a LeetCode submission result, or a deployment receipt.

## Official provenance and implementation

`official.json` contains the complete public GraphQL response with access timestamp,
exact official URL, statement, constraints, examples, callable metadata and observed
code templates. Python3 explicitly supports `Solution.maxProfit(prices: list[int])
-> int`. The lesson uses that canonical interface. Official examples return 6, 4, 0.
No authorized/private access or restricted content was needed.

All authored files are under `leetcode/123/`; shared CSS/common.js, registries and
other lessons are unchanged. Exact candidate hashes are in `candidate-manifest.json`.
No commits, services, deployment, schedules or agents were created.

## Reproduce

From the repository root (Node uses the provided NODE_PATH):

```sh
OUTPUT_DIR=/tmp/123-algorithm python3 leetcode/123/tests/test_solution.py
OUTPUT_DIR=/tmp/123-browser node leetcode/123/tests/browser.cjs
```

Browser test defaults to the already-running
`http://127.0.0.1:18778/leetcode/123/`. Override `PREVIEW_URL` if needed. It uses
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when supplied and starts no server.
Output-directory overrides keep reports and screenshots outside the candidate;
Python bytecode writing is disabled. `tests/build_content.py` is an optional
lesson-local authoring helper, not a reviewer test: it regenerates HTML/copy.

## Numerical evidence

`algorithm-results.json`: Python submission, visible O(n⁴) baseline, and browser
core compared with independent enumeration of legal daily action histories.
3585 cases: every array of lengths 1..7 over {0,1,2}, 300 seeded random cases,
official examples, fresh/counterexample cases and defensive empty input.
26845 prefix frames checked across all four state conditions, including
initial unreachability; old-state linkage and budget monotonicity checked.
Input mutation checked. Extra maximum-size Python cases: 100000 alternating
0/100000 values -> 200000; 0..99999 -> 99999; 100000 identical values -> 0.
Exact source mirror equality checked. JS -0 is numerically normalized to 0 in
cross-runtime assertions; it has the same cash value.

## Real-browser evidence

`browser-results.json` and PNGs: actual headless Chromium on the supplied preview.
Both English and Chinese; all 7 presets, every forward day, start/end disabled
controls, back-forward replay, reset, direct end and slider seek. All 3 prediction
choices reveal only after explicit action; changing a choice hides feedback.
Locale changes preserve preset/day/selection/reveal/source disclosure. Shared
storage-denial fallback initializes and remains interactive. No runtime page,
console or local asset errors observed; asset requests remain local.

Clipboard API success was deterministically stubbed to verify exact copied bytes;
clipboard rejection opens a focused/selected manual textarea with exact bytes.
This does not claim native operating-system clipboard access. Browser source,
mirror, textarea and actual downloaded solution all equal `solution.py`. Source
remains available when the already-loaded context goes offline.

English and Chinese widths 320, 390, 736, 1440; 1280 viewport with CSS zoom=2
(200% layout magnification; not a claim of a physical device/browser toolbar
setting). No document overflow; state cards reflow. Narrow ledger intentionally
scrolls horizontally with row/column headers; its rightmost columns are exercised
and captured in `*-ledger-right.png`. Source code has contained horizontal scroll.
Native control/choice targets measured >=48 CSS px. Keyboard Enter/Tab/Shift+Tab,
focus outline, anchors and related deep targets tested; top-of-page navigation
highlight regression checked. Forced colors and reduced motion exercised.

Rendered text/surface contrast samples range from 6.45:1 to 16.09:1; primary
controls 13.10:1; focus accent2 on base background 10.73:1 (on card surface
8.94:1); muted control border on card surface 6.45:1. Disabled controls remain
fully opaque. Shared + local shipped CSS totals 11980 bytes (see JSON for actual
measured size if subsequently revised), below 25000. No external assets/fonts.

## Visual inspection and limits

Author visually inspected focused phone/desktop/zoom screenshots and a contact
sheet of generated states, plus full-size English header, 320px transitions,
Chinese derivation/hand/proof/prediction, source/fallback and 200% states. Inspection
identified and fixed the long preset label and stale navigation highlight. Final
captures show readable text/cards without fixed-height clipping; partial content
at a viewport edge scrolls normally. Cumulative ledger retains every processed day.

The browser is a simulation; Python execution evidence is separate. Stored teaching
history is O(n), while the submission is O(1) auxiliary space. No trace events are
omitted. Real mobile hardware, assistive-technology user testing, native clipboard,
public deployment and actual learner comprehension are unverified. Separate
independent lesson review and acceptance remain pending.

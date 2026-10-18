# #214 author self-check — ready for independent review

Date: 2026-10-18. Scope: author implementation and self-check only. Separate
teaching review, real novice teach-back, LeetCode submission acceptance, physical
devices, native browser-chrome zoom and production delivery are unverified.
No independent acceptance or deployment is claimed.

Preview used: http://127.0.0.1:18792/leetcode/214/ . No server was started.
Only leetcode/214/ was added. Registry and shared assets were not edited.

## Official provenance and source

`tests/evidence/official.json` stores the actual dated public GraphQL response,
query, endpoint, complete statement and language snippets. The official page was
also opened at https://leetcode.com/problems/shortest-palindrome/ . Verified free
Hard, prepend-only contract, lowercase input, empty input, n ≤ 50,000, both
examples, and Python3's `Solution.shortestPalindrome(self, s: str) -> str` interface.
Python is the preferred faithful interface; no exception contract is needed.
`solution.py` is canonical. Its exact JSON string is the sole assignment in
`python-code.js`. Browser display, actual clipboard, fallback selection and
actual downloaded bytes match it exactly.

## Reproduce without changing the frozen candidate

From the repository root, redirect generated evidence for a reviewer run:

```bash
export OUTPUT_DIR=/tmp/leetcode-214-review-evidence
python3 -B leetcode/214/tests/test_solution.py
node leetcode/214/tests/core.cjs
node leetcode/214/tests/browser.cjs
node leetcode/214/tests/zoom.cjs
python3 -B scripts/register_leetcode_lesson.py 214 --validate-only
```

The browser harness uses NODE_PATH and honors
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. PREVIEW_URL optionally overrides
the existing preview page URL. All emitted results/screenshots honor OUTPUT_DIR.
The default author outputs live in `tests/evidence/`.

## Observed results

- `python-results.json`: passed actual canonical Python against enumerated
  prepend-string oracle for all 511 binary strings of length 0..8, 80 seeded
  ternary cases, 500 seeded independent prefix-baseline cases, seven explicit
  fixtures, and three exact length-50,000 cases. The real callable's pi array
  was captured and all 59 cells across seven cases checked against enumerated
  proper borders. Source mirror parity passed.
- `core-results.json`: 264 inputs, 4,249 complete trace frames and 29,771 determined
  cells checked; independent direct border checks, exact fallback transitions,
  candidate suffix equality, final output, deep snapshot independence, teaching
  input bounds and duplicate-translation-key regression check passed.
- `browser-results.json`: real Chromium, both locales, every preset, every
  comparison forward/back, replay, reset and terminal controls; every prediction
  option, reveal/change clearing, and locale preservation of selection/reveal/
  frame/preset/disclosure/focus passed. Actual clipboard copy/read and download,
  denied clipboard selection, keyboard range/buttons/radios, sticky anchor
  positions, related anchors, denied storage and offline file opening passed.
  Zero page/console errors, failed assets or external runtime requests observed.
- Layouts passed at 320, 390, 736 and 1440 px in both locales. pi cells retain
  64px CSS width and wrap into rows. Large history tables deliberately scroll
  inside a named keyboard-focusable region. Navigation labels do not overlap;
  the navigation strip deliberately scrolls. All buttons/selects are ≥48px.
- `zoom-results.json` and browser checks: CSS layout zoom 2 in real Chromium at
  320, 390 and 1280 px, both locales; no document overflow; cells remain 128px
  rendered width. At the narrowest zoom layout the cells become one column.
  Focused viewport captures include initial cells and the final C-marked cell,
  allowing inspection without scaling down a very tall full-stage capture.
- Measured text/background contrast: body 16.09:1, cell 13.40:1, primary/selected
  13.10:1, muted/disabled 6.45:1, focus outline against panel2 8.94:1. Disabled
  opacity is 1. Forced colors and reduced motion were exercised. Shared/local
  CSS total 11,957 uncompressed bytes (9,425 + 2,532).
- `preflight.json` records the exact required root command
  `python3 -B scripts/register_leetcode_lesson.py 214 --validate-only`, exit 0,
  empty stderr/stdout, timestamp and unchanged watched metadata/registry/index/
  concept-map hashes. This command did not register the lesson.

## Screenshot inspection and fixes

Visually inspected regenerated EN/zh fallback stages at 320/390 and desktop,
normal viewport captures, zoomed official-example completion, focused 200%
viewport captures, forced-color focus, and manual-copy selection. Adjacent
character indices, pi values and C/P labels remain distinct. The completed
example shows both equal aacecaa pieces and final result aaacecaaa.
Stage-element captures hide the sticky navigation only while taking that image
(to avoid screenshot overlay artifacts); viewport captures retain normal navigation.

Author inspection found and corrected a duplicate `fallback` copy key which had
replaced mismatch explanations with the manual-copy label, shrinking navigation
pills whose text overlapped, and a specificity conflict keeping disabled primary
buttons cyan. Regression checks now cover all three. At 200% on 320px, long
identifiers/control words initially caused overflow; inherited anywhere wrapping
and a wrapping header resolved it. Those diagnostic captures were superseded
before candidate freeze; there was no prior independent review result.
The test harness also corrected a radio setup that focused without changing an
already selected answer and now waits for completed smooth anchor navigation.

## Frozen candidate and next action

`candidate-manifest.json` records the base checkout and SHA-256 of local candidate
files and evidence. This is a self-checked author candidate for a separate cold
review under the six-dimension rubric. Do not treat these tests as a learner
study or independent approval. Concept metadata is ready for the dispatcher;
shared registration and concept-map changes remain outside this author's scope.

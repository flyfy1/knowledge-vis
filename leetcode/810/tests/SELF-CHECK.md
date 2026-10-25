# #810 author self-check — candidate 2

Status: complete author candidate, ready for a separate independent review.
No independent acceptance, learner result, LeetCode submission, registration,
publication or deployment is claimed. Only `leetcode/810/` was created/edited.
Runtime/test identities and shared dependency hashes are recorded in
`evidence/candidate-sha256.json`; candidate 1's hash receipt is retained separately.

## Verified source and executable solution

Public official statement and actual submission snippets were captured in
`../provenance/official.json` (access date/time included). The statement was also
opened through the web tool at the exact official URL. The free Hard problem
supports Python3's `Solution.xorGame(self, nums: list[int]) -> bool`; Python is
therefore the canonical submission, with no language exception. The initial-zero
win, erasure-to-zero loss, empty-board XOR convention, optimal-play result,
16-bit values, 1..1000 length and all three official examples are reflected.

Commands run from the repository root:

- `python3 -B leetcode/810/tests/test_solution.py` — PASS: 22,097 canonical
  cases, 112,564 intermediate candidate-erasure checks, 1,364 executions of the
  baseline extracted from the actual displayed HTML. The oracle searches legal
  game trees, recomputing XOR by bit-column parity; it does not reuse the parity
  theorem or canonical XOR loop. Exhaustive arrays use alphabet 0..3 and lengths
  1..7; 240 seeded random arrays use 16-bit values and lengths 1..10. Maximum and
  near-maximum fixtures use independently known pair-cancellation/forced-play
  outcomes. Input nonmutation checked.
- `node leetcode/810/tests/test_core.cjs` — PASS: 4,508 candidate moves and
  4,124 automatic-path transitions against independent per-bit calculations;
  exhaustive alphabet 0..2 through length 6, plus presets. Parent immutability,
  original identities, child XOR, safe/losing classification, immediate terminal
  behavior and termination checked. All 82 copy keys unique; every value is a
  nonempty zh/en pair. The matcher operates before dictionary evaluation.
- `node leetcode/810/tests/browser.cjs` — PASS using the existing
  `http://127.0.0.1:18770/leetcode/810/` preview; Chromium version, host platform
  and measurements recorded in `evidence/browser-results.json`.
- `python3 -B scripts/register_leetcode_lesson.py 810 --validate-only` — PASS,
  exit 0, no stdout/stderr. Exact receipt is `evidence/preflight.json`.

The source mirror contains only the exact assignment to window.PYTHON_SOURCE.
Canonical file, decoded mirror, rendered code textContent, clipboard text,
manual fallback transfers, and downloaded bytes all agree including final newline.

## Rendered branches and bilingual meanings

Both English and Chinese were exercised for all seven presets: [1,2], [1,1,2],
[0,1], [1,2,3], [1], [0], [2,2,3,3]. The browser independently recomputed each
visible child XOR, original tile identity, remaining count, erasure count,
current XOR and safe/losing label. It checked 32 rendered game states, including
zero-at-entry and erasure-loss endpoints. History count and winner agree with
those instants. Forward/back/forward reproduces the exact stage text. Manual
unsafe selection, undo and a different safe branch replace only the saved future.

Candidate-2 regression: after erasing the unsafe 2 in [1,1,2], undo to the root,
Reset remains enabled and discards the saved unsafe future. Forward then chooses
the safe 1. Initial state without saved future keeps Reset disabled. This fixes
the author-discovered candidate-1 state omission before independent review.

The rendered formula was asserted exactly in both languages. Dynamic loss text
explains the erasing player's immediate loss, rather than confusing it with the
next player's zero-at-entry win. Each prediction option was selected and revealed;
only odd/nonzero is correct for [4,4,4,7,7]. Changing choice clears the answer;
switching locale preserves choice and reveal. Simulation resets/preset changes
preserve the independent exercise. The hand disclosure opens and closes. Locale
changes preserve snapshots and focused tile. Both localized H1 and document
identities match #810 and the corresponding metadata title.

Automatic clipboard success and four forced fallbacks (two per locale) passed.
Before every fallback attempt the test writes and reads a fresh distinct sentinel,
then denies automatic write, checks full-source focus/selection, performs Linux
Control+C, and reads back the exact source. Fallback guidance remains separate
from algorithm/prediction feedback. Download bytes match solution.py in both locales.
Storage-denied context remains interactive; offline file loading displays the
source and advances the simulation. No loading/reconnect state is fabricated.

## Device, visual and accessibility evidence

16 layout combinations: en/zh × 320/390/736/1440px × CSS zoom 100%/200%.
No document overflow or clipped tile contents. Native select width budget includes
actual system-font measurement, padding and a retained 24px arrow reserve; all
combinations pass after the documented local padding correction. Source pre blocks
have intentional contained horizontal scrolling, preserving exact code. At 200%
and 320px the layout is necessarily tall; labels wrap and remain fully reachable.

Visually inspected actual screenshots via the image viewer, including:
`board-en.png`, `heading-en.png`, `heading-zh.png`, `prediction-en.png`,
`prediction-zh.png`, `controls-en-320-z2.png`, `controls-zh-320-z2.png`,
`tiles-en-320-z2.png`, `tiles-zh-320-z2.png`, `tiles-en-390-z1.png`,
`tiles-zh-390-z1.png`, `tiles-en-736-z1.png`, `tiles-zh-736-z1.png`,
`forced-colors.png`, plus the pre-fix `fit-diagnostic.png`.
The screenshots show readable wrapped tile values/consequences, preserved duplicate
identities and history, full localized headings, and selected-answer feedback.
Some captures scroll a requested element into view under the sticky navigation;
this is a capture-position effect, not a deep-link failure. Actual navigation to
#step2 was separately checked to land below the sticky bar.

Keyboard Enter advances the real game control; Tab reaches Reset, with a 3px
focus outline. Forced-colors and reduced-motion branches were exercised. All
buttons/selects are at least 48px tall. No automatic motion, timers or external
fonts/assets exist. Shared + local shipped CSS totals 10,714 bytes (<25,000).

Contrast uses the actual shared solid colors and calibrated WCAG sRGB function:
black/white 21, primaries 0.2126/0.7152/0.0722, #747474-on-black 4.492948 (fails
4.5 without rounding). All measured normal text pairs pass 4.5; core text on panel2
is 13.397:1, muted/disabled on panel2 6.449:1, focus accent2 on panel2 8.937:1,
selected button text 13.101:1. Full unrounded results are in browser-results.json.
This measurement covers the actual solid-color lesson states, not arbitrary
transparency/gradients or other pages.

## Navigation and remaining limits

All local links and fragments respond and exist. Related links were followed by
keyboard in each locale at narrow width, and destination text was read: #782
step1 explains equal/complementary rows and the rectangle XOR invariant for
chessboard feasibility (not the complete minimum-swap problem); #51 step1 explains
column/diagonal rejection with recursive choice and undo. Both targets are actually
served on this preview. Labels promise those concepts, not this game's solution.
Destination excerpts are retained in browser-results.json.

#810 has zero console/page errors, zero asset errors and zero external requests.
Following existing #51 causes a browser /favicon.ico 404 console message because
that page lacks a favicon declaration. This inherited destination-only issue is
recorded separately; no request was suppressed and no out-of-scope fix was made.
Related content/anchors themselves are available. Future public release must
confirm both destinations are included/available in the selected release.

Independent review is pending. Real learner teach-back, real phone hardware,
native browser zoom, public delivery and LeetCode submission acceptance remain
unverified. CSS layout zoom, automated browser assertions and author screenshot
inspection do not establish those claims. No active review finding was closed by
the author. See iteration-notes.md for pre-review fixes and their boundaries.

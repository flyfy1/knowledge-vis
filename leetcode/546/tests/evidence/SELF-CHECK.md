# #546 author self-check — candidate 546-author-r1

Status: complete author candidate, ready for a separate independent review.
Candidate identity: `candidate-manifest.json` hashes runtime, canonical source,
metadata, brief, provenance and reproducible test scripts; shared asset hashes are
recorded separately. No independent acceptance, judge result, learner outcome or
publication is claimed. Only `leetcode/546/` is added to the repository.

## Official contract

Public statement and actual Python3 submission snippet verified on 2026-10-25.
See `../../provenance/official-graphql.json` and its README. Ordinary requests to
the HTML page received 403; public GraphQL returned 200 without credentials.
Python is supported and selected, so no non-Python exception contract is needed.
The source preserves `class Solution` and `removeBoxes(self, boxes: list[int]) -> int`.

## Actual executed checks

All commands ran from the repository root:

```bash
python3 -B leetcode/546/tests/check.py
node leetcode/546/tests/check-core.cjs
node leetcode/546/tests/browser.cjs
node leetcode/546/tests/screenshots.cjs
python3 -B scripts/register_leetcode_lesson.py 546 --validate-only
```

- Python: **3,485 cases passed**, including all 3-color arrays of lengths 0..7,
  200 seeded cases (seed 546), the official examples and transfer case. The empty
  case is defensive, outside the official nonempty input contract. The oracle
  enumerates all legal first subgroups of the actual remaining array rather
  than using the interval recurrence. Input nonmutation passed.
- **94 actual canonical intermediate dp results** checked against the oracle
  with the saved boxes appended to each remaining interval. Empty calls return
  zero; interval length plus saved boxes stays within the original input length.
- Maximum-length tests: 100 identical boxes → 10000, 100 distinct colors → 100,
  49 ones + [2] + 50 ones → 9802. Alternating length 100 ran as a stress case
  with score bounds checked, without claiming a separate exact oracle for it.
- Browser numerical core: the same 3,485 oracle cases, **200 extra interval/carry
  states**, and **11,831 legal reconstructed moves** passed. Checked adjacent
  original identities in the live array, equal colors, gain = removed count²,
  identity conservation and cumulative score after every move.
- Root experiment hand-checked candidates for k=0/1/2: [3,5], [6,10], [11,17].
  The visible current candidate, its dependency operands, best-so-far identity
  and final maximum matched. Rewind/replay reproduced the same readout.
- AST parsing found no duplicate bilingual dictionary keys; each entry is a
  nonempty Chinese/English pair. The rendered complete formula was compared
  with the proper locale entry, including all operands and empty boundary.
- Real headless Chromium at the existing preview URL: both locales × all six
  presets × optimal/leftmost-largest modes × every removal; start/end disabled
  controls, forward/back/reset/finish, all carry values, and root endpoints.
  Optimal preset totals [5,21,23,9,3,1]; greedy totals [3,13,17,9,3,1].
- Every prediction option was chosen, revealed, then changed; stale feedback
  cleared. Both translations explain dp(0,0,2)=9 and total 13. Locale switching
  preserved preset, trace position, carry, root position, answer, reveal,
  disclosure, and focus. Unrelated reset preserves the separate exercise.
- Exact source mirror, displayed `textContent`, native Chromium clipboard
  write/read, clipboard adapter payload, manual fallback value/selection and
  both downloaded files match `solution.py`, including its final newline.
  Denial feedback specifically explains manual copying in each locale.
- 320/390/736/1440 CSS-pixel layouts in both locales: no page overflow.
  Populated middle diagrams keep each color and original ID readable and
  associated, wrapping tiles rather than squeezing them. Code is an explicitly
  labeled horizontal scroller: keyboard arrows moved its scroll position by
  80px in both locales at 320px. Native controls, Tab/Enter/Space, a visible 3px
  focus outline, forced colors and reduced-motion modes were exercised.
- 200% **CSS zoom in real Chromium**, at a 720px viewport (360px effective
  layout width), both locales: no overflow, readable wrapped controls and DP
  operands. This records the exact zoom method, not native browser-chrome zoom.
- Blocked localStorage still permits initialization, locale switching, trace
  progression and offline embedded source. Runtime requests were local, with
  no browser console/page/HTTP asset errors. Related local links and deep
  anchors resolve. Actual deep navigation leaves the section below the sticky
  navigation; the heading remains visible with its section padding.
- Total shipped CSS: **11,820 bytes** (9,425 shared + 2,395 local). Exact shared
  colors are reused. Contrast: main text 13.40–16.09:1 on the three shared dark
  surfaces; secondary text 6.45–7.74:1; accent text 10.91–13.10:1; focus/orange
  text 8.94–10.73:1. Main text exceeds 7:1; all measured secondary pairs exceed
  4.5:1. Disabled controls use opaque secondary text on the panel (7.08:1).

Metadata preflight command:
`python3 -B scripts/register_leetcode_lesson.py 546 --validate-only`
returned **exit 0, empty stdout/stderr**. Source hashes before and after matched.
See `preflight.json`. Complexity is one string covering O(n⁴) time and O(n³)
space. No registration, registry change, acceptance update or deployment ran.

## Visual inspection and fixes

The author opened actual generated screenshots, including English 320px middle
and endpoint diagrams, Chinese 320/390px states, English 390px candidate operands,
English/Chinese zoom captures, the English desktop header, the 320px transfer
exercise and Chinese source disclosure. Numeric IDs remain with their boxes;
readouts wrap without colliding; prediction selection and feedback agree.

Initial self-checks caught and corrected long clipped selector labels, bright
primary styling on disabled buttons, and a progress highlight that could remain
on an old section after returning to the header. Controls now use short labels
with the full input printed separately, disabled buttons use readable panel
styling, and scroll-derived navigation correctly starts on step 01. Final browser
and populated-diagram scripts passed after these changes. A test attempted to
click an already-disabled Reset after a preset reset; the test was corrected to
assert that legitimate disabled state before using keyboard Next/Back.

Some full-element screenshots include a sticky-navigation overlay caused by
Playwright scrolling a tall element into view. `*-viewport.png` and `*-middle.png`
show ordinary settled viewport geometry; those were used to distinguish capture
artifacts from actual clipping. The desktop header was re-opened after the final
navigation fix and shows step 01 selected.

## Evidence boundary

The files are frozen for a new independent review; this author run neither
performs nor claims that review. Physical mobile devices, native browser-chrome
zoom, actual novice teach-back, a LeetCode submission and production delivery
were not tested. No external runtime assets, service, schedules, agents, commits
or publishing were added. Reproduction instructions and output-directory
redirection are in `../README.md`.

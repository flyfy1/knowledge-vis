# #741 author self-check — ready for independent review

This is an author candidate, not independent acceptance, a novice study, a public
release, or an accepted LeetCode submission. Only `leetcode/741/` was authored.
The candidate is identified by `evidence/candidate.json`; registry and shared
assets are unchanged. Runtime URL: http://127.0.0.1:18770/leetcode/741/ .

## Official contract

`provenance/official.json` captures the dated successful public GraphQL response,
query and endpoint. It includes the complete official statement, both examples,
constraints and actual submission snippets. Python3 is explicitly offered as
`class Solution: def cherryPickup(self, grid: list[list[int]]) -> int`.
Canonical language is Python; a non-Python language contract is unnecessary.
The page paraphrases the verified rules and links to the exact official URL.

## Reproduce from repository root

```sh
python3 -B leetcode/741/tests/check.py
node leetcode/741/tests/browser.cjs
node leetcode/741/tests/inspect.cjs
python3 -B scripts/register_leetcode_lesson.py 741 --validate-only
```

Use the existing preview service. Node resolves installed Playwright and Acorn
through NODE_PATH; Chromium uses PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set.
All artifact-producing tests accept OUTPUT_DIR, e.g.
`OUTPUT_DIR=/tmp/review-741 node leetcode/741/tests/browser.cjs`.
`core.cjs` accepts the independently generated fixtures on stdin and writes no
files. `check.py` invokes it automatically. No external runtime packages ship.

## Observed checks

- `check.py`: exit 0, 8,926 official-valid grids (all n≤3 ternary grids, plus 140
  seeded cases up to n=5, seed 741); executed the canonical Python interface
  against independently enumerated path-coordinate unions. Input unchanged.
- JS trace: 407,181 state values matched independent prefix-pair unions, with
  path lengths, legal moves, endpoint identity, union scores, predecessor maxima
  and gain equality checked. Both official examples, all seven preset promises,
  the unique-best-single-path greedy failure, and fresh quiz values checked.
- Boundary executions: n=1 both values, forced corridors, blocked paths, n=50
  all ones gives 196 and all zero gives 0. Canonical mirror byte-exact including
  final newline. Acorn checks copy-property uniqueness before object evaluation;
  every translation entry is a nonempty two-string pair.
- `browser.cjs`: exit 0 on Linux headless Chromium 156.0.8078.4. All 261 rendered
  states across seven presets checked in each locale against a separate path
  enumeration in the test. Every layer rewind/replay (including a manually
  selected state), start/end/reset and legitimate single-cell disabled controls
  passed. Both hand routes, all quiz choices, reveal→change, locale retention,
  selected-state keyboard activation and meaningful focus passed.
- Rendered Python, embedded string, downloaded bytes, automatic clipboard text,
  and manual fallback clipboard text all equal solution.py exactly. Manual test
  seeds a different clipboard sentinel, forces API write rejection, checks full
  focus/selection, dispatches Linux Control+C, then reads actual clipboard back.
- 320/390/736/1440 CSS-pixel widths and CSS zoom 200% at width 780 (390 effective)
  passed geometry checks. Grid cells retain equal widths; essential state and
  table labels reflow. Source blocks intentionally scroll horizontally and have
  keyboard focus. Sticky step highlight tested on the zoomed diagram.
- Blocked localStorage, file:// offline initialization, source disclosure, related
  anchors, reduced motion, forced-colors focus, local asset requests and console
  checked. Zero runtime/asset errors and zero external asset requests observed.
- Text contrast sampled from actual computed colors/background composition,
  including disabled single-cell controls and selected states: minimum 6.4494:1.
  Core body text exceeds 7:1; minimum belongs to muted text. Focus accent2 against
  panel2 is 8.9372:1. Shared + local CSS: 11,649 bytes (<25,000).
- `inspect.cjs`: exit 0. `rendered-meaning.json` records the full recurrence,
  3+1=4 merge, invalid endpoints, passable-but-unreachable endpoints, and fresh
  quiz feedback in both languages. Algorithm text remains distinct from copy
  failure feedback.
- Metadata preflight from repository root:
  `python3 -B scripts/register_leetcode_lesson.py 741 --validate-only` → exit 0,
  empty stdout/stderr. No registration performed; complexity is one string.

## Visual inspection and harness notes

The author opened and inspected all final screenshots in evidence using image
viewing tools: dense 4×4 board and predecessor table at all four widths in both
locales, both 200% CSS zoom captures, plus header, hand calculation, unreachable,
single-cell, prediction feedback and source captures at 320px in both locales.
No intersecting state labels, squeezed unequal cells or page overflow observed.
Source clipping at the right is intentional contained scrolling, not lost text.

The initial supplemental harness incorrectly expected selecting an already
selected quiz answer after a locale switch to clear feedback. The page correctly
preserved selection/reveal across locales. The harness now first changes to the
other choice, then changes back, retaining the hidden-feedback assertion. Its
initial failure was `inspect.cjs:15:57, false == true`; final run passed. No
product behavior was changed for this harness correction. During visual checks
the initial observer-based step highlight was stale at CSS zoom; the local
scroll/resize calculation was corrected before the final browser run and the
zoomed active anchor is now asserted. These are author-stage fixes, with no
prior independent review outcome to amend.

## Remaining limits

No real phone, native browser-menu zoom, screen-reader listening session,
novice teach-back, independent lesson review or LeetCode submission performed.
No deployment/registration or shared campaign state changes. The next gate is a
separate source-blind cold walkthrough and review of this frozen candidate.

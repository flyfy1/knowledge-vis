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

## 2026-10-25 repair self-check — 741-R1

Status: **fixed awaiting independent review**, not closed or independently
accepted. Historical report `specs/reviews/741-review-1-c02e416e.md` and original
`evidence/candidate.json` are preserved. New candidate receipt:
`evidence/fix-r1/candidate.json` (SHA-256 manifest; no commit requested).

| Finding | Causal fix | Reproduction and evidence | Next gate |
| --- | --- | --- | --- |
| 741-R1 | Shorten English p2 from “Official example 2: no path → 0” to “Official 2: no path → 0”; bump copy.js query version. | `tests/preset-readability.cjs`; `evidence/fix-r1/before/` retains the failing closed-selector screenshots/measurements, `after/` retains passing ones at 320/390px in EN/ZH and the EN→ZH→EN roundtrip. | Separate reviewer reruns the unchanged 320px reproduction and 390px control against this candidate, then decides closure. |

The baseline command (repository root)
`OUTPUT_DIR="$PWD/leetcode/741/tests/evidence/fix-r1/before" node leetcode/741/tests/preset-readability.cjs`
returned **exit 1**, `741-R1: selected text exceeds closed control text area`.
At 320px the English text was 234.2404px, versus 206px available after the
existing 15px left/right padding and a conservative 24px native-arrow allowance.
The screenshot visibly hides the result. Chinese 320px and English 390px fit.
The unchanged regression with `OUTPUT_DIR` ending in `fix-r1/after` returned
**exit 0**: new English width 165.9843px, leaving about 40px spare. Native control
width stays 262px (client 260px), font stays 16px; Chinese remains 142.7842px.
Both direct and roundtrip screenshots visibly show identity, no-path scope and
`→ 0`. The preset still resets to t=0 and finishes with result 0. These measurements
use Linux Chromium 156.0.8078.4 and the recorded CSS stack, without inferring a
resolved font. The arrow allowance is bounded to this environment.

The first draft of the screenshot harness captured while shared smooth scrolling
was still moving. Before the retained baseline run it was corrected to request
reduced motion, wait two animation frames and assert the selector lies inside the
viewport. Both retained red and green runs use that same corrected harness.

All following commands ran from the repository root and returned **exit 0**.
Artifact-producing checks used
`OUTPUT_DIR="$PWD/leetcode/741/tests/evidence/fix-r1/after"`:

- `python3 -B leetcode/741/tests/check.py`: actual official Python class executed;
  8,926 oracle cases and 407,181 intermediate JS states pass, including obstacles,
  singleton grids, n=50, greedy failure, input preservation, localization duplicate
  detection and exact offline mirror parity.
- `node leetcode/741/tests/browser.cjs`: 261 selected states per locale, all seven
  preset results, rewind/replay/reset, all quiz choices and feedback invalidation,
  locale retention, keyboard, 320/390/736/1440px and CSS 200% zoom pass. Canonical
  source equals rendered textContent, clipboard, native-key manual fallback and
  downloaded source including final newline, in both locales. Blocked storage
  and file:// opening pass; no console/resource/external-request errors.
- `node leetcode/741/tests/inspect.cjs`: both-locale formula operands and overlap
  guard, completed-layer ledger 1→3→4, final versus pending labels, shared
  destination 3+1=4, invalid/unreachable distinction, and prediction explanations
  pass. Added adversarial greedy t=3 rows (1,2) assertion: chosen predecessor
  (0,2)=3, gain 2, result 5; last candidate has value 2. Rewind/replay restores
  exact stage text. This checks candidate/value binding separately from counts.
- `node leetcode/741/tests/preset-readability.cjs`: required reproduction passes
  in both locales at 320/390px, with complete selected scope and result.
- `python3 -B scripts/register_leetcode_lesson.py 741 --validate-only`: **exit 0,
  empty stdout/stderr**, recorded in `evidence/fix-r1/preflight.json`. Complexity
  remains the single string `O(n³) time; O(n²) auxiliary space`. No registration.
- `git diff --check`: no whitespace errors.

Author visually inspected the retained before English 320px capture and after
English direct/roundtrip 320px, Chinese 320px, both locales at 390px, both 320px
dense predecessor views and both CSS-200% board captures. The fixed label and
result are complete; the dense candidate/value/ledger labels remain legible.
The full browser check records minimum sampled contrast 6.4494:1, focus 8.9372:1,
and shared plus local CSS 11,649 bytes. No style or color change was needed.

The saved official evidence offers Python3 and TypeScript. Python3's exact
`Solution.cherryPickup(self, grid: list[list[int]]) -> int` interface matches the
canonical source. There is no non-Python language contract or supportedLanguages
list to repair; Python already has preference. Read the registration source-pair
table: Python maps to solution.py / python-code.js / PYTHON_SOURCE. These files
remain unchanged and byte parity passes; no mirror regeneration was needed.

Only lesson-local files/evidence changed. Algorithm, recurrence, teaching sequence,
metadata, shared assets, historical report and prior evidence are preserved.
No child agents, service changes, commits, registration or deployment. The new
candidate still needs focused independent re-review of 741-R1; headless Linux
checks do not claim physical-device, macOS-font or native-browser-zoom coverage.

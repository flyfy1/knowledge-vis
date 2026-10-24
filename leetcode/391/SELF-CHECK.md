# #391 author self-check — candidate 391-author-v1

Status: complete author candidate, ready for a separate independent review.
No independent acceptance, learner outcome, LeetCode submission, registration,
publication or deployment is claimed. All authored files are within leetcode/391/.
The approved design shell is reused; this report does not replace teaching review.

## Official contract
Public statement and Python3 selector/interface verified on 2026-10-25 at
https://leetcode.com/problems/perfect-rectangle/ and public GraphQL.
`tests/evidence/official.json` records access timestamp, statement, constraints,
examples and all observed code snippets. Python3 faithfully supports the contract;
no non-Python language fallback or language-contract.json is needed.

## Reproduce without modifying this frozen candidate
Run from repository root, choosing an external writable output directory:

```bash
OUTPUT_DIR=/tmp/391-author-check python3 -B leetcode/391/tests/test_solution.py
OUTPUT_DIR=/tmp/391-author-check node leetcode/391/tests/test_core.cjs
OUTPUT_DIR=/tmp/391-author-check node leetcode/391/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 391 --validate-only
```

Browser uses NODE_PATH, PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if set, and the already
running preview at http://127.0.0.1:18770. PREVIEW_ROOT can override the origin.
No server is launched. `tests/build_copy.py` is an authoring utility, not a test;
it regenerates copy.js only and is not needed to rerun checks.

## Actual results
- Python: 3,508 cases against an independent coordinate-partition midpoint
  coverage oracle. Includes every multiset of 1..5 rectangles with edges on
  coordinates 0..2, 1,500 seeded cases (seed 391), all three official examples,
  negative/maximum coordinates, corner-only touching, T-junctions and prediction.
  Additional n=20,000 exact tiling and missing/duplicate-tile cases pass.
  Input unchanged. Largest area 40,000,000,000 is exact.
- JS simulation: same 3,508 oracle outcomes; 19,442 prefix checks of area,
  full odd-corner sets, before state, four toggles and small-grid total coverage.
  Deep snapshot isolation and deterministic replay pass. Large coordinate cases
  use the geometric oracle; unit-grid enumeration is restricted to small boxes.
- Source: exact Python file/mirror/display/copy/download parity. Real Chromium
  clipboard success tested with granted permissions; denied clipboard exposes
  focused, selected full-source textarea. Mocked success/rejection paths also
  exercised in both languages. Offline file opening displays exact source.
- Localization: 98 unique two-language keys checked before JSON overwriting can
  conceal duplicates; semantic checks for area/corner pass/fail, add/remove,
  all three prediction choices, and clipboard feedback in both languages.
  Locale switching retains trace position, preset, selected answer, reveal,
  and language-toggle keyboard focus. Storage denial retains in-memory state.
- Browser: both languages, six presets, every forward/back transition, replay,
  reset, both endpoints, all prediction choices/reveal/change, source and copy.
  Actual keyboard Enter/Tab, focus outline, forced colors and reduced motion.
  320/390/736/1440 CSS-pixel viewports; 200% CSS document zoom at desktop and
  390px. Narrow diagrams intentionally scroll horizontally (minimum 360px SVG)
  with visible guidance, focus and keyboard access. No page-wide overflow.
  Local/related targets and sticky section destinations checked.
  Zero page/console errors, HTTP asset errors or remote asset requests.
- Shared plus local shipped CSS: 12,659 bytes, under 25,000.
  Computed token contrasts: text/bg 16.09:1; text/panel 14.70:1;
  muted/panel2 6.45:1 (also disabled labels); accent/panel 11.97:1;
  accent2/panel2 8.94:1; focus accent2/bg 10.73:1; bad/panel2 6.35:1;
  bg/accent 13.10:1. Core text exceeds 7:1; all measured text pairs exceed AA.
  Buttons/selects/nav targets measured at least 48×48 CSS px. Radio labels
  provide the full 48px-high clickable row; source areas scroll without shrinking.
- Metadata: `python3 -B scripts/register_leetcode_lesson.py 391 --validate-only`
  executed from repository root, exit 0, no stdout/stderr. Validation only;
  complexity is one nonempty string covering time and space. No registration.

## Visual inspection and author fixes
Inspected actual Chromium screenshots in both languages: 320/390 trace, desktop,
200% diagram, dense intermediate six-corner state, before/after/toggle ledger,
prediction feedback and source mapping. Text and values remain associated;
long sets wrap. At narrow widths the rightmost diagram columns are intentionally
inside a keyboard-accessible scroll region, with visible scroll guidance.

A first intermediate screenshot showed (1,1)/(2,1) coordinate text colliding;
labels were centered on points and the dense state was recaptured and inspected.
Deep-link testing found a heading partially underneath the sticky nav after
mixed zoom/locale interaction; local scroll-margin is now 96px and actual link
clicks pass. An early test-harness grid check attempted a maximum-coordinate
unit grid; the harness now only enumerates small grids, while large correctness
uses the independently compressed geometric oracle. These are author fixes,
not independent review findings or closures.

Some viewport screenshots naturally show a sticky bar over a scrolled-off portion
of a large diagram. The dedicated zoom-grid captures temporarily hide the nav
only during capture to inspect the full diagram without that capture artifact;
normal sticky navigation is tested separately and unchanged at runtime.

## Evidence boundary
`tests/evidence/` contains executable-check results, official capture, source
downloads and screenshots. `candidate.json` hashes the frozen runtime, metadata,
brief and test files. No actual mobile hardware, browser chrome zoom, screen-reader
session, production deployment or novice teach-back was tested. CSS document zoom,
headless Chromium and oracle checks establish only the stated author-check scope.
Separate independent per-problem review is still required before acceptance.

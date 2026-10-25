# #600 author self-check — frozen candidate 1

2026-10-25. Author session only; independent reviewer/run: pending. No score,
independent acceptance, actual novice result, LeetCode acceptance, or deployment
is claimed. Final source identity is recorded in candidate.json. Only this
lesson directory was changed; collection/registry/campaign state were untouched.

## Actual checks and results

- `python3 -B leetcode/600/tests/test_solution.py`: PASS. Executed the canonical
  Solution.findIntegers interface for every n in 0..20,000 against an incremental
  string-enumeration baseline and an independently written memoized digit
  recursion. Tested 691 seeded/boundary large cases and all-bit closed boundaries.
  Official examples 5→5, 1→2, 2→3; maximum 10^9→2,178,309. Zero is explicitly an
  extension outside the official positive-input contract.
- `node leetcode/600/tests/test_core.cjs`: PASS. 4,095 exhaustive inputs, 18,883
  transition frames, 691 larger cases. For all frames through n=256, separately
  enumerated each branch and checked its size, no duplicate membership, running
  totals, equal-prefix coverage and stop condition. Suffix lengths 0..15 were
  checked against full enumeration. Acorn checks actual object property nodes
  for duplicate localization keys before evaluation; all entries are nonempty
  bilingual pairs with matching placeholders. Exact mirror/source equality passes.
- `node leetcode/600/tests/browser.cjs`: PASS in real headless Chromium against
  the already-running preview at port 18781. Both locales; all eight presets and
  every intermediate frame, all suffix choices, initial/final/back/reset/range
  endpoints and replay. All quiz options, explicit reveal and change after reveal;
  revealed answer and selection survive locale/preset changes. Native clipboard
  content, mock copy payload, manual selected text and actual Control+C clipboard
  readback, downloaded bytes and rendered textContent all equal solution.py.
  Keyboard buttons/disclosure/range, focus 3px outline, accessible table scrolling,
  related anchors and sticky navigation checked. Blocked storage and offline
  after initial load work. No runtime console/page errors, failed asset responses
  or external asset requests. Forced colors and reduced-motion focus checked.
- `node leetcode/600/tests/visual.cjs`: PASS. Both locales at 320px, full 30-bit
  input grid, introduction and canonical source; disclosure survives locale change.
  Visible place-value explanation includes 2ⁱ−1 and f[i] in both languages.
- `python3 -B scripts/register_leetcode_lesson.py 600 --validate-only`: PASS,
  exit status 0, no stdout/stderr. Run from the repository root after final
  metadata/content edits. No registration or acceptance-state write was invoked.

## Visual and semantic observations

Inspected generated screenshots using the image viewer: both locales' suffix
formula and concrete k=3 split (000/001/010 vs 100/101), quiz with answer 8 and
its two counted branches, 320/390/736/1440 scan layouts, dense maximum input,
200% desktop zoom, full 30-bit grids, introduction and expanded source.
The final 320px source soft-wraps long lines without changing textContent.
At n=6 the diagram marks only the first two bits as read; final count 5 agrees
with ledger rows 0??→3 and 10?→2 and the explicit add-before-stop explanation.
The pending scan never labels its partial total as the final answer. At n=5 the
finish row includes n exactly once. Chinese/English feedback both distinguish
missing the second branch from wrongly including invalid 13.

The ledger deliberately scrolls horizontally at narrow widths; the localized
hint describes this, its region has a localized accessible name and keyboard
focus, and actual arrow-key scrolling passed. Element captures temporarily hide
the sticky navigation to avoid screenshot-only overlays; normal page navigation
and target geometry were tested with it visible. Viewport screenshots naturally
show portions of a long page and are not evidence of clipped document content.

An author pass first found maximum-input binary text overflowing by 7px at
320px; `.readout,.question,.formula` now wrap anywhere. The before-fix
`debug-overflow.png` is historical; the final full matrix passes. An early harness
assumption that a suffix choice survived page reload was corrected by explicitly
setting that fixture; the product only promises preservation across locale changes.
Final copy presents the concrete n=5 calculation before its general branch rule,
including why removing 2ⁱ outweighs every possible lower-bit tail.

Measured shared + local shipped CSS: 11,339 bytes (<25,000). All local colors reuse
shared tokens. Browser report stores foreground/background readings: core body
16.09:1, explanation 12.62:1, muted hint 7.74:1, disabled text 6.45:1, primary
13.10:1, focus against panel2 8.94:1. All sampled text pairs exceed AA; controls
are at least 48px tall. Shared nav is 96%-opaque bg; even compositing its bg over
the brightest allowed panel2 yields muted-text contrast above 7.6:1.

## Boundary of this evidence

CSS zoom=2 is a headless layout/access check, not a physical-device browser-zoom
observation. No screen-reader session, physical phone, actual novice teach-back,
public deployment, independent lesson review or LeetCode submission occurred.
The next gate is a separate source-blind reviewer of this frozen candidate.

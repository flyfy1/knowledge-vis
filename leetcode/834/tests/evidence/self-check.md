# #834 author self-check — frozen candidate r3

Author: Codex; exact model identifier unavailable. Date: 2026-10-26 Asia/Singapore.
Status: complete author candidate, ready for separate independent review.
Independent reviewer/run: pending. Independent acceptance: not claimed.
No submission, novice study, registration, deployment, commit or publication was
performed. Only leetcode/834/ was authored. The approved reused design contract
is cited in BRIEF.md. Runtime/source identities are in candidate-sha256.json.

## Official verification

`official.json` records the public official GraphQL response and exact official
URL, fetched at 2026-10-25T19:18:15.442181+00:00 (2026-10-26 Singapore).
Observed frontend ID 834, free access, all three official examples, constraints,
and actual Python3 selector snippet:
`Solution.sumOfDistancesInTree(self, n: int, edges: list[list[int]]) -> list[int]`.
Python is therefore the preferred canonical language; no exception is needed.
Saved official material is review evidence, never a runtime dependency.

## Executed commands and results

From repository root:

- `python3 -B leetcode/834/tests/test_solution.py` — PASS, 1,742 small cases:
  all labeled trees through n=6 via Prüfer sequences, plus 300 seeded cases
  (seed 834). Independent per-source BFS oracle. Official examples and input
  nonmutation checked. Maximum n=30000 path and star checked against closed forms.
- `node leetcode/834/tests/test_core.cjs` — PASS, 43,582 snapshots. Final results
  match independently generated BFS cases. Intermediate summaries are checked
  against the actual union of already merged subtrees, rather than assuming a
  partial summary is complete. Every reroot checks the per-node ±1 changes,
  both component counts and full sum. Snapshots are isolated. Bilingual key
  duplicates are detected from source definitions before evaluation; every copy
  value is a pair of nonempty strings. Exact Python mirror equality passes.
- `node leetcode/834/tests/browser.cjs` — PASS, Chromium 156.0.8078.4 on Linux.
  Both locales, all five presets, every forward/back operation, endpoints,
  reset, complete answers, replay identity and state-preserving language rounds.
  Hand calculation changes from 6 to 4 and restores. All three fresh prediction
  options are selected then revealed; changing choice clears feedback; reveal
  remains hidden until explicitly checked. Rendered central formula and concrete
  6−3+1=4 transition were inspected in both languages and recorded as text.
  Exact localized H1 and document title pass. Both normal clipboard transfers
  match canonical bytes, including final newline. Each manual attempt first
  verifies a new per-locale non-source sentinel; fallback focus/full selection
  and Linux Control+C then transfer the exact source to the real clipboard.
  Each downloaded file matches solution.py exactly. Blocked storage is tolerated;
  source display works with solution.py requests blocked. No page/console/local
  asset errors; runtime requests remain local. Keyboard Enter activates controls
  and related anchors; 3px focus outline is measured.
- `node leetcode/834/tests/visual.cjs` — PASS, focused bilingual screenshots
  at 320/390/736/1440px, populated official-tree graph, table left and right,
  headings and 200% CSS zoom. Screenshots were visually inspected by the author.
- `node leetcode/834/tests/access.cjs` — PASS, all closed preset labels measured
  at 320px in both locales with a conservative 24px arrow allowance, longest
  English/Chinese labels captured and inspected. Keyboard ArrowRight scrolls
  the table with its node IDs staying fixed. Actual Tab order, 3px table focus,
  reduced-motion mode and keyboard focus under forced colors pass.
- `python3 -B scripts/register_leetcode_lesson.py 834 --validate-only` — PASS,
  exit code 0, no output. This was the non-mutating validation mode; registration
  and shared files were not changed. Metadata complexity is one string:
  `O(n) time; O(n) auxiliary space`.

All tests that write artifacts support OUTPUT_DIR. Reproduction commands and
preview/executable overrides are in ../README.md. Original failure observations
remain in navigation-first-check.txt and access-harness-diagnostic.txt. The
former prompted a runtime correction before freeze; the latter records test
harness corrections, not runtime defects or independent closure.

## Visual observations and limits

Inspected English/Chinese 320px headings, hand-path distances, all nodes of the
six-node official graph, both horizontal ends of the table, narrow prediction
choices, 390px prose/controls, desktop header/quiz, and zoomed graph/table.
The table uses deliberate horizontal scrolling; node IDs stay visible at the
right edge, keeping answers associated with nodes. No shrink-to-fit labels.
Long English preset names remain complete at 320px. Early viewport captures
can crop a heading behind a sticky navigation bar depending on screenshot scroll
position; keyboard anchor geometry and focused element captures separately
confirm ordinary navigation and readable diagrams. Zoom captures were adjusted
to keep the sticky bar outside the focused table capture.

Measured palette contrast (browser-results.json): text ≥13.39:1, muted text
≥6.44:1, cyan ≥10.91:1, amber focus ≥8.93:1, green feedback ≥10.00:1 on the
three used shared surfaces. Selected language cyan/dark text is 13.10:1.
Disabled content remains opaque muted text; control borders use muted; table
focus and active-node ring use amber. Shared plus local CSS is below 12 KB,
well under 25000 bytes. Exact CSS byte count is in browser-results.json.

200% coverage uses actual CSS zoom=2 in Chromium at a 720px viewport, giving a
360px content layout; this is synthetic browser layout stress, not evidence
from a real mobile device or platform browser zoom shortcut. Platform fonts,
real devices, real assistive-technology speech, public deployment, actual
learner comprehension and LeetCode submission acceptance remain unverified.
The next required step is a fresh independent cold walkthrough and source audit
of this frozen candidate, scored under the six-dimension review rubric.

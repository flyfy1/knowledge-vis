# #132 author self-check — candidate 1

Status: complete author candidate, ready for a separate independent lesson review.
No independent acceptance, novice results, LeetCode submission, or publication is
claimed. Only leetcode/132/ was authored; git status showed that folder alone.
The approved pattern/design adjudication is reused; no shared files were changed.

Official statement and Python3 callable interface were observed via public GraphQL.
See evidence/official-graphql.json and official-verification.md. The exact observed
limits/examples are included in BRIEF.md. The canonical method is executed offline.

## Observed checks

- `python3 -B leetcode/132/tests/test_solution.py`: PASS, 2,356 cases. Exhaustive
  binary strings length 1–10, seed 132 random strings, official examples,
  counterexamples, and four length-2000 fixtures. Independent cut-mask oracle.
- `node leetcode/132/tests/test_core.cjs`: PASS, 384 cases / 4,464 snapshots.
  Independent cut masks check every computed palindrome cell, completed prefix,
  current provisional minimum, event order/count and deterministic snapshots.
- `node leetcode/132/tests/browser.cjs`: PASS on the existing preview with real
  headless Chromium. All 14 preset × locale paths, each endpoint and complete
  forward progression, backward/forward snapshot replay, reset, range Home/End,
  end, three prediction selections/reveals and changed-answer clearing; locale
  preserves preset/position/selection/reveal/disclosure. Clipboard readback,
  forced-denial manual-copy focus, displayed/embedded/downloaded byte parity,
  denied storage and offline file access passed.
- Browser widths: 320, 390, 736, 1440 in EN and zh; 200% CSS layout zoom in both.
  Native keyboard focus, 3px outline, 48px standalone action/link targets, forced
  colors and reduced-motion paths checked. No page errors, asset errors or external
  runtime requests. Related links and sticky anchor landing verified.
- All 26 PNG screenshots were opened for author visual inspection across the
  check runs, including worked explanation, prediction feedback, source/fallback,
  narrow tables/controls, desktop and zoom. Final 736px navigation and 320px matrix
  were re-opened after fixes. Text and cells wrap or use contained horizontal
  scrolling. The matrix keeps row starts visible and its caption outside the
  scrolling area. Element screenshots can capture a sticky nav overlay; the real
  landing geometry is tested separately.
- Exact palette contrast: 30 foreground/surface pairs all ≥4.5:1; minimum 6.45:1
  for muted text over panel2. Core text and focus exceed their AA requirements.
  CSS shipped: 11,846 bytes including shared CSS (under 25,000).
- `node --check` app.js and copy.js: PASS.
- Repository-root `python3 -B scripts/register_leetcode_lesson.py 132 --validate-only`:
  PASS, exit 0, no stdout/stderr. See evidence/preflight.txt. Metadata complexity
  is exactly one nonempty time/space string. No registration or campaign mutation.

## Findings corrected during authoring

Horizontal scroll originally hid the matrix start labels; the first column is now
sticky. The long caption now sits outside the horizontal scroll region. Extra
local rules bring header/related links to 48px. Screenshot inspection found a
stale active step pill on long sections; section-position tracking replaces the
entry-only observer and the browser test asserts step2 while inspecting its table.
Two early test assumptions were corrected: wait for smooth-scroll settlement,
and use actual keyboard navigation before checking :focus-visible in forced colors.
All final browser checks passed after these changes.

## Limits and handoff

These are author checks and computational oracles, not a separate review. No real
learner or physical device was tested. Zoom is Chromium CSS layout zoom, not native
browser-chrome zoom. Browser simulation does not execute Python; Python tests do.
The page makes this distinction and separately states snapshot storage costs.
Registration/concept-map publication is outside this author's scope. Independent
review must use a fresh run and the six dimensions in the repository review gates:
hand calculation; causal savings; maintained-state proof; visible interaction;
canonical Python/cost; equivalent bilingual/device access. No score is preassigned.

Reproduction commands and OUTPUT_DIR support: README.md. Candidate identity:
`candidate.json` hashes the complete frozen lesson (excluding the manifest itself).

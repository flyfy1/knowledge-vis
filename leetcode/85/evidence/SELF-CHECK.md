# #85 author self-check — ready for separate review

Date: 2026-10-18. Author: Codex author session (exact model identifier unavailable).
Scope: only `leetcode/85/`; no registration, commit, deployment, or independent
acceptance. The separate reviewer must cold-walk the candidate. No actual novice
learner study or LeetCode submission was performed.

## Official and teaching contract

`OFFICIAL-VERIFICATION.md` and `official.json` retain the public page/GraphQL
statement, constraints, examples, callable metadata and observed Python3 selector.
The canonical source uses that Python interface. Browser snapshots are explicitly
labeled as a JavaScript teaching simulation, separate from Python execution.
The BRIEF preceded implementation and carries forward the approved design contract.

Walkthrough self-check: six cells give area 3 rather than the count of five ones;
row heights preserve rectangles at each bottom row; a shorter column fixes a
pending rectangle's right edge; the new stack top is an excluded left edge;
equal heights need the earlier equal bar to recover the full width. The lab
retains every settled rectangle, and the unseen [2,4,3,1] exercise requires the
same boundary rule. Its 6,6 answer was checked against executable trace and
canonical Python on 0100 / 0110 / 1110 / 1111. These are author observations,
not independent teaching acceptance or actual learner outcomes.

## Executed checks

Reproduction commands and environment variables: `../tests/README.md`.
Every report/screenshot producer accepts OUTPUT_DIR; browser BASE_URL defaults
to the already-running http://127.0.0.1:18775. No server was started.

- `test_solution.py`: PASS, 1,192 canonical Python cases. All 682 matrices with
  dimensions 1..3 × 1..3; 500 seeded cases up to 7×7; official examples; transfer
  case; out-of-contract empty matrix; 200×200 all ones, all zeros and checkerboard;
  200-cell single row and column. Independent four-boundary rectangle oracle uses
  2D zero-prefix counts. Input unchanged. Also executes the displayed slow baseline
  on 40 cases. Offline mirror is byte-for-byte JSON encoding of solution.py.
- `test_core.cjs`: PASS, 1,090 cases / 29,139 frames. Independently enumerate
  rectangles and check every enclosed cell. Verify all intermediate heights,
  nondecreasing stack heights and increasing indices, sentinel zero, each popped
  region's cells, width, area, ledger maximum, row-end optimum, snapshot independence
  and unchanged input. Includes the fresh transfer's two exact pop operations.
- `browser.cjs`: PASS in real headless Chromium, both locales, all seven presets;
  244 forward operations plus complete backward walks, endpoint disables,
  reset and backward→forward snapshot equality. All prediction options are
  chosen then revealed; changing choice hides old feedback. Locale changes
  preserve position, preset, answer/reveal, disclosure, and focus.
- Browser source checks: exact displayed, clipboard-copied, downloaded and fallback
  textarea source equals solution.py. Clipboard success and denied fallback checked
  in both locales. Blocked storage initializes and switches locales. Blocking
  solution.py fetch does not prevent the offline source mirror from displaying.
- Real keyboard: range Home/Right/End, focused Reset via Enter, Tab focus outline.
  Every measured button/select/summary/answer-label target is at least 48px high.
  Forced-colors and reduced-motion modes exercised. All local links and deep
  anchors exist, including the first-use stack explanation link.
- Layout: EN and zh at 320, 390, 736 and 1440 CSS px. No page overflow; at 320,
  matrix cell width is 43.5px and six histogram columns are about 40.33px each.
  The ledger deliberately scrolls within its own table wrapper. Both locales also
  checked at 200% Chromium CSS layout zoom in a 1280px viewport; this is a layout
  zoom stress test, not physical-device or browser-chrome automation evidence.
- Zero browser console/page/HTTP asset errors; all runtime requests stay local.
- `check_style.cjs`: PASS. Shared CSS 9,425 bytes + local CSS 3,122 bytes = 12,547,
  below 25,000. Exact shared palette reused. Contrast: explanatory text 12.62:1,
  stage hints 7.08:1, disabled text 6.45:1, correct feedback 10.00:1, incorrect
  feedback 6.35:1. Focus against adjacent dark surfaces is 8.94–10.73:1. The 4px
  offset separates focus from cyan buttons; orange versus cyan alone is not
  claimed to pass. Numerical outlines and bars also pass measured contrast.

## Visual inspection and fixes

Author opened the saved PNGs with the image viewer, including EN/zh phone matrix
and histogram views, desktop populated trace, both 200% zoom views, both revealed
exercises at 320 and desktop, Chinese manual-copy fallback, initial hand example,
Chinese derivation, and forced-colors controls. Cells stay equal and readable;
✓ labels mark real all-one cells, not zeros; the extra sentinel remains a zero
bar even while outlined. The sticky navigation has intentional contained
horizontal scrolling. Screenshots show author-observed geometry only.

Early browser checks caught a missing empty-ledger element ID, which interrupted
rendering before prediction feedback; fixed and full checks rerun. Visual audit
then changed the active column's border/padding into an outline so it cannot
alter data geometry. A stronger max-height check found the 1px baseline border
could shrink height-4 units; fixed the unit height and prohibited flex shrinking.
The final browser regression includes a height-4 frame and requires every rendered
unit to have identical geometry, active or inactive. No known author-check failures
remain. Final numerical and browser reports are saved beside these notes.

## Limits / handoff

Ready means complete author candidate with actual self-checks. Independent review,
public deployment verification, real-device checks and learner comprehension are
pending or outside this author run. `../lesson-entry.json` is ready for dispatcher
registration after the required review; shared registry/concept-map files were
not modified. Candidate SHA-256 hashes are in `candidate-sha256.json`.

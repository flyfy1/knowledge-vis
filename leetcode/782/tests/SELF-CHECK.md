# #782 author self-check — candidate 782-r1

Status: complete author candidate, ready for a separate independent review.
No independent acceptance, LeetCode submission, learner-study result or deployment
is claimed. Implementation and tests belong only to leetcode/782/.

Official statement, all three examples, 2≤n≤30 binary-square constraints and the
actual Python3 selector/interface were verified from public official GraphQL on
2026-10-25. Raw response and access timestamp: ../provenance/official.json.
Canonical interface: Solution.movesToChessboard(self, board: list[list[int]]) -> int.
Python is the preferred faithfully supported language; no fallback was needed.

## Executed checks

From /home/songyy/projects/leetcode-hard-campaign-20261018:

- `python3 -B leetcode/782/tests/check.py`: PASS, 704 cases. All 528 binary boards
  of size2/3 matched both a legal-swap BFS oracle and exhaustive permutation
  baseline. 156 seeded size4/5 cases, official/fresh/counterexample cases, constant
  and alternating boards, odd size29 and grouped max-size30 boundaries passed.
  The size30 grouped construction requires 7 row +7 column swaps =14. Input
  immutability was checked for every case.
- `node leetcode/782/tests/core.cjs`: PASS, same 704 oracle fixtures, 3,291 frames.
  Every intermediate row relation, selected target count/mismatch cost, witness
  row/column swap, accumulated move count, final board, and snapshot isolation
  checked. All seven preset promises match. Dictionary duplicate keys are checked
  in its AST before evaluation; every entry is a nonempty [zh,en] pair.
- `node leetcode/782/tests/browser.cjs`: PASS in real local Linux Chromium using
  the configured PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Both locales, all seven
  presets, each forward/back/forward frame, reset and endpoints, hand move/undo,
  all prediction options/reveal/change, locale preservation and localized H1/title,
  actual keyboard activation/focus, all local anchors and the related #765 anchor.
  Full source textContent, embedded mirror, successful clipboard and downloaded
  bytes match solution.py including its final newline. Each locale’s automatic
  copy failure was followed by verified full selection and native Control+C;
  each attempt began with a distinct written/read-back clipboard sentinel.
  Blocked storage, file:// offline initialization, reduced motion and forced-color
  focus outlines passed. No console, page or local-asset errors; runtime requests
  were local only. 36 screenshots retained.
- `node leetcode/782/tests/focused.cjs`: PASS, actual first row-swap frame7, eight
  marked cells (two complete rows), same board at 200% CSS zoom with equal cell
  widths and readable digits/axes, and closed repaired select labels in EN/zh.
  Six focused captures retained. Full viewport zoom screenshots are supplemented
  by complete board captures so the viewport edge does not hide the diagram.
- `python3 -B scripts/register_leetcode_lesson.py 782 --validate-only`: PASS,
  exit0, empty stdout/stderr. Actual command/cwd/timestamp in evidence/preflight.json.
  This did not register the lesson or change shared files.

Machine-readable results: evidence/python.json, core.json, browser.json, focused.json.
Rerun commands and output redirection: README.md. Tests accept OUTPUT_DIR.

## Visual and semantic inspection

Inspected all 36 main captures via inspection-sheet-1…6.png, with full-resolution
320px trace, Chinese structural-failure state, EN/zh intermediate row-swap states,
complete EN/zh zoom boards and repaired EN/zh selected controls inspected directly.
Boards retain their axes, equal cell sizes, visible 0/1 digits and original/current
association. At320/390 the boards stack; at736/1440 they sit side by side. Text and
controls wrap without hiding quantities. Intermediate row1↔row2 moves exactly the
marked rows; its readout says one executed swap and final result still pending.
The completed official trace says two executed swaps and minimum2. Structural and
count failures both say −1 with zero executed swaps and explain different causes.
The ledger retains the operations used to reach each board and rewinds with it.

EN and Chinese render the complete four-corner XOR formula, not a truncated
localization value. Prediction feedback binds to fresh110/001/110: row labels101
cost0; column labels110 can target101 because there are two ones; swapping1↔2
costs1. Changing the answer hides that derivation; locale roundtrips preserve the
same choice and revealed meaning. Copy-failure text describes manual copying,
while structural-failure text describes the violated rectangle, in both languages.
Local term reminders were added to support readers jumping directly into a step.

Contrast helper calibrated with black/white, each primary luminance and the
near-threshold #747474/black case (4.492948… fails4.5). Actual composited solid
text/background pairs, including white/dark board digits and disabled controls,
measure at least7.078851579:1. Focus outline on panel exceeds3:1. Computed pairs
and unrounded ratios are in browser.json. Shared+local shipped CSS =11,316 bytes,
below25,000; palette values reuse exact shared tokens.

Screenshot-only element captures suppress sticky navigation during capture to
avoid overlay artifacts; normal viewport captures retain it. Native selected
label measurements use the real computed16px font stack, actual width/padding
and a20px arrow allowance in this Linux Chromium. They do not establish behavior
for untested host fonts. Draft clipping evidence and development harness fixes
are retained in evidence/development-notes.md and draft-long-select.png.

## Self-walk reconstruction and limits

The tiny001/110/001 board needs at least one move because it has equal neighboring
zeros; swapping columns1/2 attains one. Reordering columns preserves equal or
complementary rows, yielding the four-corner invariant. Balanced type counts then
make alternating targets possible. Each opposite mismatch pair takes one swap,
which both attains and proves the lower bound; independent row/column costs add.
The canonical getter-based code computes these costs without constructing witness
boards or mutating the input. Snapshot history belongs to the simulation only.

This is an author reconstruction, not a novice teach-back or separate review.
Real mobile devices, browser-level zoom beyond the recorded200% CSS zoom, other
platforms/font installations, public delivery and actual LC acceptance remain
unverified. A fresh reviewer must inspect the frozen candidate before acceptance.

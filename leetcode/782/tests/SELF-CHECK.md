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

## Repair self-check — 782-r2, 2026-10-25

Finding **782-MAC-FIT-01: fixed awaiting independent review**. Changed only the
English preset4 copy to `Four-corner failure: −1` and its copy.js cache reference
to `782-r2`. The immutable original candidate.json and all earlier evidence are
retained; the new freeze is candidate-repair-20261025.json. No independent closure
or acceptance is claimed. Original review 782-review-1-f9de8180 has no required
findings; optional 782-R1-A01 is unchanged, consistent with the narrow repair.

Applied website-design and diagnosing-bugs skills. Reused the independently
diagnosed and dispatcher-approved design: P0 complete label and preserved
behavior; P1/P2 none. Font/layout redesign remains deferred because shortening
the label resolves the demonstrated width issue. No algorithm change is needed.

Feedback loop, before editing: `OUTPUT_DIR=leetcode/782/tests/evidence/repair-20261025/red
node leetcode/782/tests/selected-label.cjs` exited 1 in 2.60 seconds: actual
`Four-corner check fails · −1`, expected `Four-corner failure: −1`. It traverses
the real control in EN→ZH→EN, retains screenshots/metrics and the original width
predicate. This Linux host fits the old label; the local red assertion locks the
prescribed repair, while actual clipped-result reproduction is the preserved
Mac evidence in 782-review-mac-fit-diagnosis-20261025.md. No claim of reproducing
Mac clipping on Linux is made.

Ranked falsifiable hypotheses (announced before intervention):
1. Excess label length: changing only English copy should reduce text width and
   restore spare space. Confirmed by independent Mac diagnosis and local delta.
2. Stale locale rendering: EN→ZH→EN should change measurements if responsible.
   Rejected: repeated English measurements are identical before and after repair.
3. Unexpected styling: font/padding/control width should differ if responsible.
   Rejected locally: all three are identical across red/green runs, as are every
   other label's measurements. No styling intervention was necessary.

The confirmed cause is a native-select label exceeding the unchanged Mac width
budget, visibly hiding the complete result. Local English text width fell from
201.760147 to 168.160065px; 260px control, 30px padding and 20px arrow reserve stay
fixed, increasing spare width from 8.239853 to 41.839935px. Chinese remains
`四角检查失败 · −1` with 82.896027px spare. Mac's diagnostic new-label margin was
34.65px; that is historical diagnostic evidence, not execution of this candidate.

Fresh complete author runs, all exit 0, from the repository root, using
`OUTPUT_DIR=leetcode/782/tests/evidence/repair-20261025/green`:

- `python3 -B leetcode/782/tests/check.py`: actual official Python callable,
  704 independent-oracle cases, input unchanged.
- `node leetcode/782/tests/core.cjs`: 704 fixtures / 3,291 frames, intermediate
  swaps, cumulative moves/history, target identities and costs, snapshot isolation,
  exact solution.py/PYTHON_SOURCE mirror, duplicate-key and bilingual-pair checks.
- `node leetcode/782/tests/browser.cjs`: original full suite unchanged, including
  every assertion after the former Mac failure. Both locales, all presets and
  frames/replay, formulas, prediction scope/change and preserved locale state;
  source textContent/copy/download and native fallback exact with fresh verified
  sentinel per attempt; four widths, CSS 200% zoom, anchors/focus, contrast,
  offline/storage/network checks. 36 screenshots; minimum contrast 7.078851579;
  shared+local CSS 11,316 bytes. No errors.
- `node leetcode/782/tests/focused.cjs`: unchanged suite, both locales' populated
  row-swap state and 200% board geometry; six captures.
- `node leetcode/782/tests/selected-label.cjs`: approved wording, all seven labels
  at 320px through EN→ZH→EN and completed impossible result −1; original width
  predicate unchanged. Two focused failure-label captures.

Browser: local Linux Chromium 156.0.8078.4; native fallback shortcut Control+C.
Inspected new EN/zh closed failure-label screenshots: entire label, −1 and arrow
visible. Inspected English frame7/10 at 320px: one performed swap, pending final
result, eight marked cells and cumulative history agree. Inspected Chinese
structural-failure capture: board 01/00, XOR 0^0^1^0=1, zero swaps, final −1.
Other screenshots remain available for separate review.

Read the exact LANGUAGE_FILES source/mirror table in register_leetcode_lesson.py:
Python → solution.py / python-code.js / PYTHON_SOURCE. Saved official evidence
includes faithful Python3; Python remains canonical, so no non-Python contract or
supportedLanguages exclusion applies. Canonical/mirror files did not change.

Required safe metadata command: `python3 -B scripts/register_leetcode_lesson.py
782 --validate-only` from repository root: **PASS, exit 0, empty stdout/stderr**.
Recorded in green/preflight.json with timestamp and unchanged-lesson snapshot.
Complexity remains the valid string `O(n²) time; O(1) auxiliary space`.

Mac full-suite execution of the newly frozen candidate and fresh separate review
remain pending with the dispatcher. Real devices, native toolbar zoom, public
delivery and LeetCode acceptance are unverified. No service, shared file, review
report, acceptance record, campaign state, registry, commit or deployment changed.


## Mac proof handoff self-check — 782-r3, 2026-10-25

Status: **ready for separate re-review; independent acceptance pending**.
Finding **782-MAC-FIT-01: fixed awaiting review of this handoff candidate**.
This append supersedes the earlier statement that actual repaired-candidate Mac
execution is pending. It preserves that statement as the historical evidence
boundary at the time of r2. No runtime, canonical source, metadata or original
test assertion changed in this round. New freeze:
[../candidate-mac-proof-handoff-20261025.json](../candidate-mac-proof-handoff-20261025.json).

### Finding mapping and separately attributed affected-host proof

The [handoff](../../../specs/reviews/782-review-mac-proof-handoff-20261025.md)
requests incorporation of supplied proof, with no runtime change. The latest full
[independent review](../../../specs/reviews/782-review-2-4f9587dd.md) remains
historically `changes_required`; its sole required finding is 782-MAC-FIT-01.
Its score and outcome have not been changed here. The optional syntax advisory
remains optional and unchanged.

For **782-MAC-FIT-01**, the earlier repair shortened only the English preset-4
label to `Four-corner failure: −1` and updated its asset cache reference. The
[dispatcher Mac execution report](../../../specs/reviews/782-review-mac-repaired-candidate-20261025.md)
now supplies actual Darwin Chromium 151.0.7922.34 execution against
`efa6a0356f63e851c594c346dd2ec07b644655e7`. Its immutable
[receipt](../../../specs/reviews/782-evidence/mac-repaired-candidate-20261025/results/candidate-parity.json)
records 189 exported files with no changed or added files after execution.
All [six commands](../../../specs/reviews/782-evidence/mac-repaired-candidate-20261025/results/checks.json)
passed, including the original complete browser suite and targeted all-seven
preset EN→ZH→EN geometry at 320px. The runner and before-manifest are archived
[alongside the results](../../../specs/reviews/782-evidence/mac-repaired-candidate-20261025/).

The [separately authored supplemental review](../../../specs/reviews/782-review-mac-repair-closure-20261025.md)
judges the supplied evidence sufficient to close the affected-Mac regression
against that tested revision. This is that reviewer's bounded conclusion, not
my independent acceptance of this new candidate. The next reviewer must
adjudicate the finding and normal lesson gates against the frozen handoff.
I did not run a Mac browser or perform its clipboard transfers. I read the
archived receipts and personally inspected the supplied English and Chinese
failure-label screenshots: the complete label, −1 and arrow are visible.
Recorded English width is 175.350px within the unchanged 210px text budget,
leaving 34.650px spare. The original 20px arrow reserve remains unchanged.

### Identity and fresh local regression evidence

Before editing documentation, checked all **131 lesson-local files** in the
supplied Mac manifest against both current bytes and immutable Git bytes at the
tested revision: all exact. Also checked the four original suites (check.py,
core.cjs, browser.cjs, focused.cjs) against failing candidate
`0e53a2131353accc11a5ef746c5eba164efb14e4`: byte-identical. The current HTTP
responses match local index.html, style.css, copy.js, core.js, app.js,
python-code.js, solution.py and shared common.js/style.css. Shared files were
only read. The before-edit checks and command receipts are in
[evidence/mac-proof-handoff-20261025/verification.json](evidence/mac-proof-handoff-20261025/verification.json).
Only this documentation, new local evidence and the new freeze are changed.

All commands below ran from the repository root and exited **0**. Test outputs
were redirected with `OUTPUT_DIR=leetcode/782/tests/evidence/mac-proof-handoff-20261025`;
older red/green and independent evidence remain untouched.

- `python3 -B scripts/register_leetcode_lesson.py 782 --validate-only`: PASS,
  empty stdout/stderr. Complexity remains exactly the nonempty string
  `O(n²) time; O(1) auxiliary space`. No registration performed.
- `python3 -B leetcode/782/tests/check.py`: actual official Python interface,
  704 oracle cases, exhaustive 2×2/3×3, seeded and n=29/30 boundaries, no mutation.
- `node leetcode/782/tests/core.cjs`: 704 fixtures / 3,291 frames; target identity,
  intermediate swaps, cumulative moves/history, snapshot isolation, AST duplicate
  keys, two-string locale pairs and exact offline mirror.
- `node leetcode/782/tests/browser.cjs`: complete unchanged suite, EN and zh,
  all presets and frame rewind/replay; hand undo/reset; all prediction choices,
  change invalidation and locale preservation; complete rendered XOR formula;
  exact textContent/source/copy/download including final newline; actual native
  Control+C fallback on this Linux host, fresh written/read-back non-source
  sentinel before each locale attempt. Four widths (320/390/736/1440), CSS
  zoom=2, keyboard/focus, local links, contrast, offline and blocked storage
  passed, with no console or asset errors. 36 screenshots retained.
- `node leetcode/782/tests/focused.cjs`: populated row-swap frame and 200% CSS
  board geometry in both locales passed.
- `node leetcode/782/tests/selected-label.cjs`: seven presets, EN→ZH→EN at
  320px, exact repaired wording and terminal −1 passed with the original width
  predicate. Personally inspected both new local failure-label screenshots;
  complete labels and results are visible.

Rendered-state regression scope is unchanged: four-corner formula and
mismatch/2 operands, after-operation frame labels, performed-swap totals versus
pending/final minimum, and prediction input 110/001/110 remain consistent.
The Python source/mirror pair is exactly the registration table's
solution.py / python-code.js / PYTHON_SOURCE. Saved official selector evidence
includes faithful Python3 and TypeScript; Python is canonical and is not omitted
or replaced. No non-Python language contract is necessary. No embedded source
regeneration was necessary because no canonical bytes changed.

Read website-design and diagnosing-bugs skills. Applied the former to preserved
UI verification, reusing the existing approved BRIEF. No new feature/layout:
P0 is attributed proof and candidate identity; P1/P2 none. No new hard bug was
investigated, so new reproduction/hypothesis/instrumentation phases are not
applicable; the prior red loop, ranked hypotheses and confirmed width cause
remain above and in unchanged historical evidence. Font/layout redesign and
optional syntax changes remain deferred outside this evidence-only handoff.

These are author self-checks plus explicitly attributed supplied Mac evidence.
They establish neither independent acceptance of r3, real-device coverage,
native browser-menu zoom, public delivery, novice teach-back nor judge acceptance.
No review report, rubric, registry, campaign state, service, commit or deployment
was changed. Next action: separate reviewer verifies frozen bytes, evaluates the
Mac evidence for 782-MAC-FIT-01, and records their own conclusion.

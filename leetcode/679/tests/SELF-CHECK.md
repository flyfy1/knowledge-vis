# Author self-check — #679

Status: complete author candidate; independent lesson review pending. This run
authored and checked the lesson. No independent acceptance, novice teach-back,
LeetCode acceptance, public deployment, or registration is claimed.

Official verification: provenance/official.json records the public GraphQL
response, access timestamp, statement, examples, constraints and complete
observed codeSnippets. Python3 is a faithful supported interface; no non-Python
exception is needed. Canonical solution uses fractions.Fraction and leaves the
input unchanged. Offline source mirror is exactly the JSON-encoded source,
including its final newline.

## Executed verification

- `python3 -B leetcode/679/tests/test_solution.py`: PASS. All 495 unordered
  four-card hands in 1..9 match an independent contiguous-interval expression
  oracle (404 solvable). Also 200 seeded ordered hands, official examples,
  all-one/all-nine failure, fractional successes, input immutability, and 6258
  actual canonical recursive calls with positive rational denominators and
  lengths 1..4. Fresh prediction branch fails while its original hand succeeds.
- `node leetcode/679/tests/test_core.cjs`: PASS. All 34 excerpt frames preserve
  a disjoint exact cover of card identities A–D. An independent arithmetic
  evaluator checks each displayed expression against its value and original
  leaves. Failed subtrees are actually unsolvable, parent restoration is exact,
  snapshots do not alias, division-by-zero is excluded, 0/5 is retained.
  All 76 bilingual copy keys are unique, both entries nonempty; exact mirror
  parity holds. Shared plus local CSS is 11056 bytes (<25000).
- `node leetcode/679/tests/browser.cjs`: PASS. Actual headless Chromium at the
  supplied preview origin. Both locales, five presets, start/end disabled
  controls, forward/back/forward, reset, hand arithmetic, all three predictions,
  explicit reveal, changed-answer feedback clearing, locale state/focus
  preservation, source disclosure, source textContent, downloaded bytes,
  successful copy and denied-write native-copy fallback. Native select/Tab/Enter
  actions, 3px visible focus, forced colors and reduced motion, blocked storage,
  all related anchors, local-only assets and zero console/resource errors.
  Widths 320/390/736/1440 in both locales, plus 200% CSS layout zoom.
- `python3 -B scripts/register_leetcode_lesson.py 679 --validate-only`, run from
  repository root: PASS, exit 0, no stdout/stderr. The non-mutating validation
  was used; registration was not run. Receipt: evidence/preflight.txt.

The exact test outputs are solution-results.json, core-results.json and
browser-results.json under evidence/. Reproduction commands and external
OUTPUT_DIR support are described in README.md.

## Rendered meaning and visual inspection

Author inspected the saved English/Chinese header captures, narrow 320/390
fractional stages, desktop fractional stage, and zoom stages/ordinary viewports.
The two values at fractional excerpt state 5/7 are 8 (card D) and 1/3 (cards
A,B,C), with expression 3−(8÷3). At 320px they stack, and at 390px they fit in
two separately readable boxes. Neither value is paired with another group's
identity. The retained ledger shows child (3+3)=6, rejected subtree, unchanged
parent, sibling 8÷3, then 3−8/3. Both languages say that the skipped subtree
is omitted, not one arithmetic operation. Thin borders separate boxes; values,
expressions and card labels remain visible at 200% layout zoom.

Representative binding checks (same values in both locales):

|State/actions|English observed meaning|Chinese observed meaning|
|---|---|---|
|fraction preset → next ×5|Child call: (3 − (8 ÷ 3)) = 1/3; remove both inputs, insert one result.|子调用：(3 − (8 ÷ 3)) = 1/3；移除两个输入，放入一个结果。|
|choose prediction 1 → reveal|Correct; last pair yields only −2, 0, 1; parent still has a solution.|判断正确；最后一对只有 −2、0、1；父调用仍可找到解。|
|change prediction after reveal|feedback hidden until another explicit check|反馈隐藏，等待再次检查|
|deny clipboard → copy|clipboard unavailable, full source selected for manual copy|剪贴板不可用，已选中完整源码供手动复制|
|locale after interaction|same preset, frame, selected answer, reveal, open source, focus|预设、帧、选择、揭晓、源码展开和焦点保持|

Full-page and tall element screenshots may capture the sticky navigation at a
scroll-dependent vertical position. This is a capture artifact; dedicated zoom
viewport images and the live anchor geometry check distinguish it from an
obscured target. No runtime style was hidden for captures.

Measured sRGB contrast (shared exact tokens, actual rendered state checks):
body 16.09:1, stage text 14.70:1, muted on panel2 6.45:1,
disabled text on panel 7.08:1, selected navigation 13.10:1,
orange focus on panel 9.81:1. Essential body text exceeds 7:1; secondary text
exceeds AA 4.5:1. No color-only correctness encoding or auto animation.

Limits: headless desktop Chromium, CSS layout zoom rather than browser chrome
zoom, no physical phones or screen-reader session. Algorithm/source/UI tests
are author evidence, not actual learner outcomes or an independent review.

Candidate hashes are in candidate-sha256.json. A separate reviewer must review
this frozen lesson and run independent checks before acceptance/release.

## 2026-10-25 · 679-R1 repair self-check

Candidate: **679-r1-fix**, frozen separately in `../candidate-r1-sha256.json`.
Base: c368c0b018d41763af8de9d6ac36a323900bb4a3; original candidate manifest and
independent report are preserved. Status: **fixed awaiting independent review**.
This is author evidence; reviewer closure has not been granted.

|Finding|Cause and fix|Regression evidence|Next action|
|---|---|---|---|
|679-R1|English p4 label was wider than the closed 320px native select. Replace “intermediate below one” with “intermediate < 1”; preserve full input, intermediate meaning, 16px type and existing control. Bump copy.js query version.|`evidence/r1-before/run.txt` is red; identical final `selected-label.cjs` passes on repaired copy, in `evidence/r1-fix/selected-label-run.txt`. Inspect before/after `en-320-selected.png`, repaired `en-320-roundtrip-selected.png`, Chinese counterpart, and 390px captures.|Independent reviewer rechecks frozen candidate and decides closure.|

Measured in headless Chromium **156.0.8078.4 on Linux**, matching the report's
browser/platform and unchanged reproduction: 320×950, section 03, p4, 0/7,
closed select. Font stack: 16px `"PingFang SC", "Microsoft YaHei", system-ui,
sans-serif`; no claim about the resolved installed font. Control outer width
262px, client width 260px, padding 15px per side; conservative extra arrow
reserve 16px leaves 214px. Original text measured **251.60px**; repaired text
**196.38px**. Chinese remains **184.61px**. At 390px the control is 332px wide.
All eight cases (both locales × both widths × direct/roundtrip) passed. Inspected
the closed 320 English direct/roundtrip and Chinese roundtrip, plus both 390
locale screenshots: complete labels including `< 1` and 小于一的中间值 are visible.
An initial screenshot attempt caught smooth scrolling at the page header;
the final runner uses instant scrolling. Before/after evidence was regenerated
using that same final runner; the old-label red output is retained.

Commands run from repository root (OUTPUT_DIR is
`leetcode/679/tests/evidence/r1-fix` for test commands):

- `python3 -B leetcode/679/tests/test_solution.py`: PASS; actual canonical Python,
  all 495 unordered hands (404 solvable), 200 seeded ordered hands, 6258 observed
  recursive calls and input preservation.
- `node leetcode/679/tests/test_core.cjs`: PASS; 34 frames, expression/card
  partition, failed subtree/return, zero handling, bilingual pair shape and
  duplicate-key detection, exact decoded Python mirror including final newline.
- `node leetcode/679/tests/browser.cjs`: PASS; both locales, all five preset
  results, endpoints/reset/rewind/replay, every prediction, state/focus on locale
  switch, exact displayed/copied/downloaded Python source, selected manual
  fallback and actual Linux Control+C readback, keyboard, contrast, local assets,
  blocked storage, reduced motion/forced colors, zero console/resource errors.
  Layout checks at 320/390/736/1440 and 200% CSS layout zoom. Inspected repaired
  English 320 and Chinese 390 dense fraction stages and English zoom viewport.
- `node leetcode/679/tests/selected-label.cjs`: PASS with unchanged red-case
  actions on repaired label; see selected-label-results.json for full geometry.
- `node leetcode/679/tests/rendered-contract.cjs`: PASS; both locales at fraction
  frame 5/7 show 8 using D and 1/3 using A,B,C, exact `(3 − (8 ÷ 3)) = 1/3`.
  Rewind/replay and locale roundtrip preserve the identity/value pair. Hand
  readout counts 0..3 completed operations and history lengths 0..3, then rewinds
  and replays. No cumulative search-count claim exists: the trace counts excerpt
  frames. Prediction remains scoped to the separate [2,3,7,8] child [-1,-1];
  feedback lists −2,0,1 and alternate parent solution, survives preset changes,
  and hides on answer change.
- `python3 -B scripts/register_leetcode_lesson.py 679 --validate-only`: **PASS,
  exit 0, empty stdout/stderr**, from repository root; receipt `evidence/r1-fix/preflight.txt`.
  Complexity remains one nonempty time-and-space string; no metadata repair needed.

Read registration's exact `Python: solution.py / python-code.js / PYTHON_SOURCE`
pair. Canonical Python is supported by the saved official Python3 snippet in
provenance/official.json and remains preferred; no non-Python language exception
or supportedLanguages exclusion is involved. Source/mirror did not need
regeneration. Served runtime files match local bytes (served-source-receipt.json).
No shared files, registry, services or prior review/acceptance state were edited.

Limits: headless Chromium on Linux, synthetic CSS zoom, no physical device,
macOS, real learner, production delivery, or LeetCode submission claims. The
separate independent re-review and finding closure remain pending.

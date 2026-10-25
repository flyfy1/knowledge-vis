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

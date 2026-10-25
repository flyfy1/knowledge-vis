# #780 author self-check — candidate r4

Date: 2026-10-25. Status: complete author candidate, ready for separate independent review; not accepted, registered, deployed or submitted to LeetCode. Base checkout: 81bee47c5d50bf5ec2c916a3e38b7b98a176cf53. Candidate hashes are in candidate.json. Only leetcode/780/ is owned by this author run.

Official source: public LeetCode GraphQL, full response and Python3 callable snippet saved in tests/evidence/official-graphql.json; exact official URL and access timestamp in official-verification.md. Direct HTML 403 was retained, not bypassed; GraphQL normally exposed the complete free statement and selector snippets. Python is the preferred, verified official interface.

## Computational evidence

`python3 -B leetcode/780/tests/test_solution.py` passed 15,774 canonical Python cases and the same browser-core fixtures. Forward BFS is the independent small-input oracle. Exhaustive positive starts 1..7 and targets 1..17, seed 780 random cases, 400 large constructive paths, official examples and maximum/boundary expectations passed. Tests checked 34,934 intermediate transitions: exact quotient/remainder arithmetic, strictly decreasing sum, forward-oracle reachability preservation, immutable nested snapshots and deterministic replay. Exact solution.py/python-code.js parity passed.

`python3 -B leetcode/780/tests/test_copy.py` passed 97 unique two-string translation pairs, rejecting duplicate keys before evaluation. Representative dynamic meanings are recorded in browser.json: all terminal branches in both locales, central complete formula, every prediction choice and clipboard fallback. This is a semantic author check, not merely key equality.

## Rendered checks

`node leetcode/780/tests/browser.cjs` and `node leetcode/780/tests/boundary-browser.cjs` passed in the real provided Chromium on Linux. Both locales, nine presets, every frame forward/back/replay, reset/endpoints, hand-addition cap/undo, predictions before/reveal/change/reset, locale state preservation, successful source copying, real native manual copying after a distinct sentinel, exact displayed/embedded/copied/downloaded source and file:// initialization passed. Native manual copy used Control+C and clipboard readback; source equality includes the trailing newline.

Preset results in order: true, true, true, false, false, false, true, true, false. Initial frames do no work; batch frames finish one full modulo; final check frames leave coordinates unchanged. The boundary supplement checked 16 narrow terminal cases and the large coordinate 1000000000.

Widths: 320, 390, 736 and 1440 CSS px; English and Chinese; plus 200% CSS zoom at 1440px (effective 720px content) in real Chromium. This is a content zoom test, not a claim about OS zoom or physical devices. Native selects were measured for every option including padding and arrow allowance. Actual keyboard Tab order, Enter activation, local anchor landing below the sticky nav, 48px targets, 3px focus, reduced motion, forced colors and denied localStorage passed. No browser console, asset or external runtime request errors were observed.

Measured minimum text contrast: 7.078851579017443:1, exceeding the 4.5:1 text threshold and 7:1 core-text target. Focus contrast is recorded in browser.json. Calibration uses correct 0.2126/0.7152/0.0722 weights and the below-threshold #747474 control. Total shared + local CSS: 11,331 bytes, below 25,000.

Visual inspection was performed by opening the generated screenshots, including the populated English/Chinese 320px trace and hand path, 390px trace, English/Chinese predictions, 736px and desktop stages, large terminal coordinates at 320px, bilingual 200% views and final bilingual header identity at 320px. Coordinates, history equations and choice labels remain associated and legible; controls reflow. Stage-only screenshots intentionally suppress sticky navigation at capture time; ordinary zoom/header screenshots keep it. The 200% viewport is scrolled within a tall stage, so text above that viewport is naturally outside the view.

The author caught and fixed inherited smooth scrolling interfering with keyboard anchors, and primary-button specificity overriding disabled endpoint styling. The final browser check asserts both anchor geometry and disabled primary background, while native disabled behavior remains checked. See tests/evidence/author-debug-notes.md for earlier author/harness observations. No independent findings are implied.

## Metadata preflight

From repository root: `python3 -B scripts/register_leetcode_lesson.py 780 --validate-only` exited 0, with empty stdout/stderr. Evidence: tests/evidence/metadata-preflight.json. Complexity is one nonempty string covering time and space. No registration command or shared metadata mutation was performed.

The final metadata/source/assets are frozen together as a new author candidate r4 for independent review. Related links remain within this lesson: #step1 explains the forced predecessor, #step2 explains the modulo invariant and boundary, in both languages. No external continuation is advertised. Registration, campaign state and historical review results are untouched.

Limitations: author checks are not a separate reviewer, novice teach-back, LeetCode submission result, production verification, physical-device audit, or cross-platform browser/font certification. Next action is a separate run's cold walkthrough and source audit of this frozen candidate.


## 2026-10-26 — new candidate 780-copy-r1-20261026

Stable finding **780-COPY-R1: fixed awaiting separate independent review**.
The preceding r4 results are historical author evidence. Checkout base for this
revision: `8cedba5490bb862133f157a9d6af619cee323fb9`. Historical independently
accepted runtime base: `c214c6549b53618d96782b6f827a5018c4c7f6e4`.
Read the repair request, historical independent report, BRIEF, teaching/review/trace
specifications, rendered-state/source contract, exact registration language pairs,
and website-design skill. The explicit owner request authorizes this narrow revision;
no new layout, service, algorithm, or teaching refinement is needed.

Fix mapping: remove `<footer class="site-foot" data-i18n="foot"></footer>` and its
unused `foot` localization key. Removed Chinese:
“作者自查候选 · 尚待独立评审。未声称 LeetCode 提交通过或实际学习效果。”
Removed English:
“Author self-checked candidate · Independent review pending. No claim of LeetCode acceptance or observed learner outcomes.”
No replacement learner prose. Change `copy.js?v=780-r4` to
`copy.js?v=780-copy-r1` for the changed asset. Exact runtime diff is
`tests/evidence/copy-r1/runtime.diff`. No app reference to `foot` existed; no HTML
binding or dictionary key remains. All remaining 96 dictionary entries equal the
accepted base exactly. Before/after SHA-256 receipts are in `identity-before.json`
and `identity-after.json`; app.js, core.js, solution.py, python-code.js, style.css,
and lesson-entry.json are byte-identical to that base.

Focused failing feedback: `node leetcode/780/tests/copy-r1-browser.cjs` rejected
the original candidate because one workflow footer existed (expected zero).
`before-browser.log` retains the failure. During harness authoring, a frame assertion
assumed spaces in `1 / 3`, while the unchanged template renders `1/3`; and immediate
visibility sampling raced the asynchronous clipboard-success update. These harness
failures are retained in `harness-frame-spacing.log` and `harness-async-copy.log`.
The test now uses the exact existing frame label and waits for the acknowledged
hidden fallback. No runtime changes resulted from these harness corrections.

Final command `node leetcode/780/tests/copy-r1-browser.cjs` exited 0:
`after-browser.log` and `browser.json`. Real Chromium on Linux (version in JSON),
using NODE_PATH and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Actual served bytes for
all seven runtime files equal this checkout. zh→en→zh preserves the (3,17) batch at
(3,2), frame 1/3, one retained history entry, hand point (1,2), quiz choice C and
revealed reasoning. The complete equation `17 = 5 × 3 + 2` and boundary formula
with `ty ≥ sy` remain rendered; rewind/replay restores the batch and changed quiz
choice clears feedback. `handLimit`, `sim`, and `s4e` retain exact source text,
including sum-20 teaching bounds, simulation versus Python, full modulo/final-check
frames, and zero-remainder meaning. All static localized bindings are nonempty;
old workflow strings and the footer element/key are absent. No replacement
acceptance claim was added. No console/page/HTTP errors were observed.

Exact source checks in each locale compare all 384 UTF-8 bytes, final newline
included: canonical Python, decoded mirror, rendered textContent, successful
clipboard copy, native manual fallback clipboard readback, and download bytes.
Each fallback attempt resets and reads back its own distinct locale sentinel before
denial, confirms textarea focus/full selection, uses Linux Control+C, and reads
back the source without normalization. No mirror regeneration was necessary.
Python is already the preferred faithful official interface, verified in the
retained official-graphql.json Python3 snippet. No non-Python language contract or
supportedLanguages omission applies. Registration policy pair remains
solution.py / python-code.js / PYTHON_SOURCE.

Focused Python execution (7 hand-expected official/transfer/boundary examples)
passed, recorded in `python-smoke.json`; no broad numerical suite was rerun for
this prose deletion. `python3 -B leetcode/780/tests/test_copy.py` exited 0 with
96 unique, nonempty bilingual pairs, using duplicate-aware parsing;
`copy-validation.log` retains output.

Page-end layout checked in both locales at 320, 390, 1280 CSS pixels and 200% CSS
zoom at 320 and 1280 pixels (10 captures). Related links retain Tab order and Enter
activation. Page has no horizontal overflow and main/body bottom geometry matches,
with no orphan footer gap. Visually opened both 320px/100% captures and all four
320px/1280px 200% captures: source controls, disclosures and final links wrap with
readable text; ordinary existing section padding remains. Sticky navigation is
retained in captures. This is Chromium CSS zoom evidence, not physical-device or
browser-toolbar zoom certification. All 10 screenshots and geometry are in browser.json.

Required safe metadata command from repository root:
`python3 -B scripts/register_leetcode_lesson.py 780 --validate-only`
**Exit 0; empty stdout/stderr**, receipt `metadata-preflight.json`.
Complexity is still the single string
`O(1 + log(max(tx, ty))) time; O(1) auxiliary space`.
No registration, campaign/history/report edit, shared file edit, commit, push,
deploy, service change, or child agent. New candidate hashes are frozen in
candidate.json; the previous author manifest is retained under this evidence
folder. Next action: a separate reviewer checks and closes 780-COPY-R1 against
this candidate. No independent closure, acceptance or production delivery is claimed.

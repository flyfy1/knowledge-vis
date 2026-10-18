# #44 review-1 fix candidate — author self-check

Date: 2026-10-18. Scope: only `leetcode/44/`. This is a new uncommitted
candidate for separate independent re-review, identified by `candidate-sha256.json`.
The previous review evaluated `20fd69d0d3f8a0a847189b3462e474886ec3caa1`;
checkout base for these edits is `f31b415b4c79f7d5fb86fc50b3f9cbe4abb66416`.
The old report and its changes_required outcome remain historical evidence.
No finding is independently closed here, and no registration, acceptance,
campaign-state, service, Git-configuration or publication changes were made.

## Fix mapping

| Stable finding | Candidate change | Self-check evidence | Status / next action |
| --- | --- | --- | --- |
| 44-META-01 | Add bilingual lesson-entry.json, exact official URL, valid anchors, Python language and one complexity string: `O((m+1)(n+1)) time; O(n+1) auxiliary space`. | Exact safe preflight below exits 0. `candidate-sha256.json` freezes metadata with the new candidate. | Fixed awaiting independent review; reviewer reruns preflight against this candidate. |
| 44-TEACH-01 | Make the displayed baseline remove final characters, so recursive arguments remain original prefixes. Work a / b** through both actual paths to the repeated empty / b* call, explain why it is false, why the path does not affect its answer, why both prefix lengths matter, and identify dp[0][2]=false. Derive diagonal, left, above and rolling memory in separate paragraphs. | regression.py executes the actual baseline extracted from index.html, confirms the full eight-call sequence and exactly two empty / b* calls, then compares it and canonical Python with an independent first-star-length oracle on 21,483 pairs. core.cjs checks every active cell and dependency on 1,275 traces. EN/ZH narrow screenshots show both repeated paths and the transition explanation. | Fixed awaiting independent review; fresh walkthrough of steps 01–02 and their mapping is still required. |
| 44-TEACH-02 | Replace regex-dependent question with fresh ba / ?* wildcard exercise: calculate left ba / ? = F, above b / ?* = T; final F or T = T. Distractors target empty-only star and diagonal-only reasoning. Explain every option and contrast ba / a* = false. Optional regex comparison is labeled; ab / a* = true remains in derivation. | Actual core quiz matrix is independently checked; browser exercises all three choices/reveal in both locales, changing choice clears feedback, and switching locale preserves selection/reveal. EN/ZH quiz screenshots include the incorrect-diagonal feedback. | Fixed awaiting independent review; reviewer tests prediction and its prerequisites. |

Also clarify m=text length and n=pattern length and use O(n+1) space for empty
patterns, explaining allocation and the full-table teaching storage separately.
Canonical Python and its mirror are unchanged. The recursive baseline's Boolean
behavior is preserved by exhaustive testing; its traversal direction now exposes
the same prefix pairs as the table, with no suffix-to-prefix leap.

## Commands and results

All commands ran from repository root. Commands write only lesson-local test
evidence, except the safe preflight and diff check, which are non-mutating.

- Before repair: `python3 -B scripts/register_leetcode_lesson.py 44 --validate-only`
  exited 2: `Metadata validation failed: [Errno 2] No such file or directory: '/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/44/lesson-entry.json'`.
- `python3 -B leetcode/44/tests/regression.py` — exit 0; 21,483 exhaustive pairs
  checked against both actual displayed baseline and canonical solution; 1,000
  seeded random canonical/oracle pairs; 11 transfer/boundary/maximum cases.
  Includes 2000-character text/pattern cases, empty inputs, repeated stars,
  ba / ?*, ba / a*, and ab / a*. Detailed result: `algorithm.json`.
- `node leetcode/44/tests/core.cjs` — exit 0; 1,275 trace pairs and 15,337
  active-cell prefix truths/dependency checks. Confirms fresh quiz matrix and
  identical duplicated teaching/quiz dictionary fields. Result: `core.json`.
- `node leetcode/44/tests/browser.cjs` — exit 0 (final run after new screenshot
  coverage); real Chromium via Playwright from NODE_PATH, executable from
  PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Result: `browser.json`.
- After repair: `python3 -B scripts/register_leetcode_lesson.py 44 --validate-only`
  — **exit 0, no stdout/stderr**. Registration was never run.
- `git diff --check` — exit 0, no whitespace errors.

## Browser coverage and observations

Preview: http://127.0.0.1:18770/leetcode/44/ . Served index.html, copy.js, app.js,
solution.py and python-code.js byte-match the checkout. Both locales cover initial
and terminal disabled controls; all four presets give T/F/T/F; forward → rewind →
forward restores full snapshots; reset restores initial state; preset changes
restart. All three quiz choices reveal their own causal feedback, answer changes
clear it, and language changes preserve the complete snapshot and open disclosure.
Keyboard range End/Home/ArrowRight and Space/Enter on previous/next work.

At event 16, current (2,3) is T, left (2,2) is F and above (1,3) is T, with
separate dependency outlines; the previous table has an uncomputed dot at (2,3).
Screenshot inspection of en/zh-320-trace.png confirms the six-column table fits
and letters, indices and source cells remain readable. en/zh-320-quiz.png confirms
new question/options/feedback wrap without clipping. Focused overlapA/overlapB
and transition screenshots in each locale were visually inspected: both actual
paths and the saved-result explanation remain visible and readable.

Automated layout coverage: 320, 390, 736, 1440 CSS px in both languages, no
page-wide overflow, separate i/j labels and values, no state text clipping;
viewport changes preserve state. The focused 200% screenshots use CSS root zoom=2
at 1280×900: table values/dependency outlines remain distinct; ordinary vertical
scrolling reaches other content. This is not native browser-menu zoom evidence.
No page errors or failed requests; all runtime requests stayed on the preview
origin. Storage denial still permits language switching and trace controls.

Displayed code, successful clipboard read-back, actual browser download, and
forced-copy-failure textarea each exactly match solution.py in both locales.
Fallback is visible, focused and fully selected. Offline mirror parity is checked
separately. No generated-source update was needed.

## Official and language boundary

Official statement re-opened on 2026-10-18:
https://leetcode.com/problems/wildcard-matching/ . Whole-string matching,
independent * including empty consumption, ? for one character, lowercase text
and pattern limits 0–2000 agree with the lesson and the previous independent audit.
The original faithful `Solution.isMatch(self, s: str, p: str) -> bool` interface
remains canonical Python. No non-Python exception or supportedLanguages list
exists to omit an available preferred interface. Read the exact `LANGUAGE_FILES`
pair in scripts/register_leetcode_lesson.py: solution.py / python-code.js /
PYTHON_SOURCE; exact string parity including the trailing newline passes.

## Verification limits and handoff

This evidence establishes the tested computations and browser behavior. It does
not establish novice comprehension, independent teaching acceptance, an official
LeetCode submission result, production delivery, native menu zoom or real-device
accessibility. No new layout/CSS/tokens were introduced. No child agents used.
Next action: a separate reviewer cold-walks this frozen candidate, audits the
fix mapping after the walkthrough, and rechecks all three stable finding IDs.

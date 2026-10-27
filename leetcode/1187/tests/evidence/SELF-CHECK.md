Author self-check (2026-10-27, Asia/Singapore):

- `python3 leetcode/1187/tests/test_solution.py` passed exhaustive arrays of lengths 1–6 over values 0..3 for every 3-value arr2, 500 seeded random cases, and the three official examples plus boundary checks.
- `node leetcode/1187/tests/test_core.cjs` passed deterministic trace/brute agreement for all four presets and every frame.
- Source parity: `python-code.js` is generated from the exact bytes of `solution.py`; preflight below checks it.
- Browser checks still required: Chromium at the provided preview URL, both locales, prediction/reveal/change, all presets and endpoints, copy fallback, widths/zoom/focus, and visual inspection. This record is author evidence only and does not claim independent review or acceptance.
- Real Chromium against `http://127.0.0.1:18770/leetcode/1187/` at 320, 390 and 1440 CSS px: both locales, all four presets, reset/next/end, prediction → reveal → changed prediction, no 4xx responses, no horizontal overflow; screenshots `/tmp/1187-390.png` and `/tmp/1187-1440.png` were visually inspected. Clipboard fallback branch is implemented; system clipboard permission denial was not forced in this run.
- Metadata gate: `python3 -B scripts/register_leetcode_lesson.py 1187 --validate-only` exited 0.

Repair evidence for required findings (2026-10-27, Asia/Singapore):

- L1187-R1: corrected the prediction feedback in `copy.js` to identify the actual replacement state `last=2` at cost 1, matching the frame after `[1,5]`. Browser regression advanced the trace after reveal in both `en` and `zh`; feedback named `last=2` and the rendered states contained `2 : 1` and `5 : 0`.
- L1187-R2: separated the static range-label translation (`progressLabel`) from the parameterized numeric readout (`progress`). Browser regression checked both locales and asserted that visible page text contains no `{i}`, `{n}`, or `{ans}` placeholders; the readout showed numeric `Processed 0/5 positions; current answer 0` in English and its Chinese equivalent.
- L1187-R3: added lesson-local responsive containment: wrapping header controls, a one-column narrow trace grid, constrained lesson overflow, and a contained step navigator; disabled buttons retain legible muted text/background styling. Chromium regression at 320px with `body.style.zoom=2` measured `document.scrollWidth=320` and `clientWidth=320`, kept the language toggle within the viewport, and verified code remains internally scrollable. The disabled Previous control computed at opacity 0.72 with the lesson disabled colors.
- L1187-R4: rewrote both complexity explanations to state at most `O(m)` states per round, one binary search per state, `O(n·m·log m)` total time, and rolling `O(m)` space. The rendered source/mapping section was included in the browser regression.

Regression command (lesson-local browser probe; NODE_PATH and Chromium executable supplied by the environment):
`NODE_PATH=/home/songyy/projects/integ-games/node_modules node /tmp/check1187.cjs` → `1187 browser regressions passed: both locales, trace/reveal, placeholders, disabled styling, 320px/200% containment, and source parity`.

Logic and metadata commands:
- `python3 leetcode/1187/tests/test_solution.py` → `1187 solution exhaustive + seeded checks passed`.
- `node leetcode/1187/tests/test_core.cjs` → `1187 core trace checks passed`.
- `python3 -B scripts/register_leetcode_lesson.py 1187 --validate-only` → exit 0 (safe validation; no registration run).

These are author repair checks only; no independent acceptance is claimed.

Repair evidence for L1187-R5 (2026-10-27, Asia/Singapore):

- Root cause: changing `#preset` rebuilt `trace` but left `choice`, `revealed`, checked radio state, and the Example 1 prediction/feedback text alive. The feedback therefore described a previous input after the arrays had changed.
- Fix mapping: `app.js` now clears `choice`, `revealed`, and checked prediction radios on preset change; it derives the selected-example question and answer from the new trace (while preserving Example 1's hand-prefix question), and computes correctness/result text from that same selected quantity. `copy.js` adds localized selected-example wording and the `-1` option/result; `index.html` renders that option.
- Failing feedback loop before the fix: `NODE_PATH=/home/songyy/projects/integ-games/node_modules node /tmp/check1187-fail.cjs` → `RED: expected stale feedback to be cleared` after reveal on Example 1 then selecting Example 2.
- All-preset bilingual regression: `NODE_PATH=/home/songyy/projects/integ-games/node_modules node /tmp/check1187-all.cjs` → `1187 all preset prediction answers passed in en and zh at 320px`.
- Bilingual regression after the fix: `NODE_PATH=/home/songyy/projects/integ-games/node_modules node /tmp/check1187-fixed.cjs` → `1187 prediction preset regression passed in en and zh`. It checked reveal, preset change invalidation, relabeled prompt, radio clearing, and Example 2's independent answer 2 in both locales.
- Preset-label correction: the prior `p3` label said impossible although the independent core/Python result is 2; it now says answer 2 in both locales, and the all-preset browser check covers it.
- Existing logic regressions: `python3 leetcode/1187/tests/test_solution.py` → `1187 solution exhaustive + seeded checks passed`; `node leetcode/1187/tests/test_core.cjs` → `1187 core trace checks passed`.
- Metadata preflight: `python3 -B scripts/register_leetcode_lesson.py 1187 --validate-only` → exit 0.

This is author self-check evidence for a new candidate and does not claim independent acceptance.

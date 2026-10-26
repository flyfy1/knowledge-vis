# Reproduce author checks

Run from the repository root; preview is the already-running http://127.0.0.1:18770. Do not start a service. Tests use installed packages through NODE_PATH. When configured, Chromium launches with PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Linux is the observed browser host; native manual copy uses Control+C (Meta+C on macOS). Clipboard permissions are granted only to the test browser context.

Use a new output directory to avoid changing the frozen candidate:

```bash
OUTPUT_DIR=/tmp/1095-review-python python3 -B leetcode/1095/tests/test_logic.py
OUTPUT_DIR=/tmp/1095-review-core node leetcode/1095/tests/test_core.cjs
OUTPUT_DIR=/tmp/1095-review-browser node leetcode/1095/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1095 --validate-only
```

For one combined author evidence directory, give all three checks the same OUTPUT_DIR. PREVIEW_URL optionally overrides the browser lesson URL. Every result/screenshot/download writer accepts OUTPUT_DIR. Browser CSS zoom=2 tests layout stress equivalent to 200% page scaling; this is Chromium desktop emulation, not a claim about a physical phone or every browser zoom implementation.

- `test_logic.py`: execute actual official callable with counted/bounds-checked MountainArray mock; independent first-match linear oracle; all strict mountains whose peak is1..6 and smaller side values are chosen from0..peak-1, targets0..7; official examples, seeded random and maximum constraints. Check input unchanged and at most56 calls.
- `test_core.cjs`: independently check every candidate interval and discarded value, peak inclusion, call-accounting deltas, bounds, history and final first-match result; detect duplicate localization keys before evaluation with Acorn; exact offline source equality and bilingual dictionary shape.
- `browser.cjs`: real Chromium, both locales/all presets/all operations with rewind/replay, every branch, preserved locale/disclosure/prediction state, changed-answer feedback invalidation, separate reset scope, actual keyboard/focus, clipboard success plus four native fallback attempts (fresh verified sentinel each time), downloaded bytes, offline opening, blocked storage,16 width/zoom layouts, selected-label width budget, cell geometry, contrast calibration and rendered colors, forced colors, local asset errors and related-link keyboard navigation. Results contain actual localized transition/history text and destination section text. Original-language Python execution is separate from browser simulation.
- `contact_sheet.py`: optional review aid composing existing screenshots, no new browser verification.
- `freeze.py`: after all three results coexist in OUTPUT_DIR, rerun non-mutating preflight and write candidate/source/shared-policy hashes. It never registers or edits shared state. Author evidence used the default lesson-local evidence folder. A reviewer should use a new OUTPUT_DIR and should not use this author script to assert independent acceptance.

The self-check report records actual evidence and limitations. Independent cold teaching review, novice comprehension, accepted LeetCode submission, registration and public delivery were not performed by this author run.

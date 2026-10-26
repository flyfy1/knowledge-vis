Author self-checks for #906. These do not perform an independent teaching review or submit to LeetCode.

Run from repository root (use the existing preview at http://127.0.0.1:18770):

```bash
python3 -B leetcode/906/tests/test_solution.py
node leetcode/906/tests/test_core.cjs
node leetcode/906/tests/browser.cjs
node leetcode/906/tests/visual.cjs
node leetcode/906/tests/source-paint.cjs
python3 -B scripts/register_leetcode_lesson.py 906 --validate-only
```

Every result/screenshot script accepts `OUTPUT_DIR`; set it to a separate directory for review, e.g. `/tmp/review-906`, to preserve this candidate's evidence. Browser scripts use installed Playwright via `NODE_PATH`, and honor `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` and optional `PREVIEW_ROOT`. No persistent server is started. Source copying uses the actual browser clipboard and host-native shortcut. `build_copy.py` is an authoring tool, not a read-only review test; do not run it against a frozen candidate.

Numerical independence: Python baseline scans all roots and uses arithmetic digit reversal. Full-domain oracle fills symmetric digit slots. The JavaScript core test scans all small roots and compares every candidate and cumulative count. Browser assertions then bind the checked core to visible state; they are not a replacement for the independent oracle or a cold teaching review.

Visual suite screenshots wait for layout/paint before capture. The preserved `zh-320-source-unsettled.png` was captured before settling and showed a blank code paint despite exact DOM content. `source-paint.cjs` checks the canonical text and captures settled code in both locales. Code deliberately scrolls horizontally; the page and candidate ledger reflow without horizontal overflow. Zoom evidence uses CSS layout zoom 2, not an automated native browser-menu setting. No physical phone, novice learner, public deployment, or LeetCode judge is tested.

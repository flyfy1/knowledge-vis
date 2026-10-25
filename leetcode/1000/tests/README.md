# Reproduce author checks

From repository root, using the already running preview:

```sh
EVIDENCE_DIR=/tmp/1000-review python3 -B leetcode/1000/tests/test_solution.py
EVIDENCE_DIR=/tmp/1000-review node leetcode/1000/tests/test_core.cjs
EVIDENCE_DIR=/tmp/1000-review PREVIEW_URL=http://127.0.0.1:18800/leetcode/1000/ node leetcode/1000/tests/browser.cjs
EVIDENCE_DIR=/tmp/1000-review PREVIEW_URL=http://127.0.0.1:18800/leetcode/1000/ node leetcode/1000/tests/visual.cjs
python3 -B scripts/register_leetcode_lesson.py 1000 --validate-only
```

Use the installed Playwright via NODE_PATH. Both browser runners respect PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. No service is started. Every test that emits evidence honors EVIDENCE_DIR. test_solution.py emits oracle-fixtures.json consumed by test_core.cjs. Its direct pile-sequence oracle is independent of interval DP; it tests all target pile counts, canonical intermediate cells (captured without source alteration), official cases, exhaustive small inputs, seeded arrays, equal-weight/max boundaries and nonmutation. Source JSON mirrors and duplicate localization keys checked before parser overwrite.

browser.cjs tests both languages, every preset and endpoints, exact rewind/replay, operands/candidate identity, locale state retention, prediction change/reveal, real clipboard writes and fallback native Control+C on Linux (fresh verified sentinel for EACH locale), exact source/download parity, keyboard/focus, 320/390/736/1440 at100%/200% body zoom, measured contrast, table scrolling, related anchors, forced-colors/reduced-motion, denied storage, offline and file opening. visual.cjs adds source/failure/current-row/fallback captures and synthetic long-text wrapping. Body zoom is a desktop browser approximation; no physical phone or browser chrome zoom claim.

build_copy.py is an authoring helper confined to this folder. It regenerates copy.js and index.html only; do not run it during frozen review. Canonical source mirror was generated from solution.py using JSON encoding, not hand edited.

The candidate is self-checked, not independently accepted. See evidence/SELF-CHECK.md and candidate-manifest.json. A separate fresh review must perform its own cold walkthrough and calculations. Tests are not novice learning evidence or a LeetCode submission result.

Additional focused checks (all honor EVIDENCE_DIR and PREVIEW_URL):

```sh
EVIDENCE_DIR=/tmp/1000-review node leetcode/1000/tests/related.cjs
EVIDENCE_DIR=/tmp/1000-review node leetcode/1000/tests/zoom-table.cjs
EVIDENCE_DIR=/tmp/1000-review node leetcode/1000/tests/accessibility.cjs
EVIDENCE_DIR=/tmp/1000-review python3 leetcode/1000/tests/make_sheets.py
```

related.cjs keyboard-activates the real links in both locales at320px and records destination sections. zoom-table.cjs captures each column of the populated current row at320/390px and200% zoom; deliberate horizontal panning is required for the wide semantic tables. accessibility.cjs measures enabled/disabled endpoint pairs with a separately calibrated solid-color sRGB calculation. Contact sheets help inspect the browser captures; their thumbnails do not replace full-resolution source images.

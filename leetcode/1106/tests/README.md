# Reproduce author checks

Run from the repository root. Only this folder is owned. No server, registration, commit, publication or agent is started. The preview is already running at http://127.0.0.1:18770.

```bash
OUTPUT_DIR=/tmp/leetcode-1106-check python3 -B leetcode/1106/tests/test_logic.py
OUTPUT_DIR=/tmp/leetcode-1106-check node leetcode/1106/tests/test_core.cjs
OUTPUT_DIR=/tmp/leetcode-1106-check node leetcode/1106/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1106 --validate-only
```

Use installed NODE_PATH for Playwright; the browser honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. PREVIEW_URL optionally overrides the complete lesson URL. OUTPUT_DIR controls all emitted cases, results, screenshots and downloads; run logic before core in the same output directory. build_copy.py is an authoring generator; do not run it against a frozen candidate. Its unique add-key declarations are audited before conversion to JSON. It owns only this lesson's copy.js.

Logic: official examples, all208 grammar strings of length≤10,1500 seeded tree-generation attempts,1045 distinct small valid cases total, four maximum/deep cases. Two independent expected routes: recursive grammar evaluation and values evaluated on generated trees before serialization. The displayed substitution baseline is executed too, including the maximum cases. Python official callable and exact Boolean return types are checked.

Core: prefixes independently reduced via textual substitution, every frame before/after/history boundary checked, truth flags checked, snapshot mutation isolation tested. Long snapshot fixtures capped at300 characters; maximum20000 input execution belongs to Python, not this teaching history allocation.

Browser: both locales,9 presets, every character and rewind/replay, endpoints/reset, literal/no-reduction case, hand reset, hidden-before-reveal prediction and all options, change invalidation, locale preservation including focus and hand state. Canonical display/copy/manual native clipboard/download equal source including final newline. Every manual attempt starts with a distinct verified sentinel, then automatic writes are disabled, and the host OS shortcut is dispatched (Linux Control+C here). Filesystem offline/blocked storage paths checked. Both locales ×320/390/736/1440 ×CSS zoom1/2, native selector20px arrow budget, before/after geometry, local requests, focus/forced colors/reduced motion, and calibrated WCAG contrast. CSS zoom stresses layout but does not establish native browser-toolbar zoom or actual mobile-device behavior.

Screenshots require human visual inspection; contact_sheet.py can combine final outputs. Related sections #224 step2 and #726 step2 are navigated via keyboard and recorded with destination hashes/text; their arithmetic-context and count-merging meanings are separately read by the author. Public release inclusion remains a later release gate.

Evidence is author self-check only. No independent reviewer, real learner outcomes, online judge acceptance, or deployment is implied. Ready means complete author candidate ready for the separately dispatched independent review.

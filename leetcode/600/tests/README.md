# #600 author verification

From the repository root, with the provided NODE_PATH and Chromium executable:

```bash
python3 -B leetcode/600/tests/test_solution.py
node leetcode/600/tests/test_core.cjs
node leetcode/600/tests/browser.cjs
node leetcode/600/tests/visual.cjs
python3 -B scripts/register_leetcode_lesson.py 600 --validate-only
```

The preview is already running at http://127.0.0.1:18781. No test starts a service.
Browser tests honor PREVIEW_ROOT and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.
The Node tools require the installed playwright and acorn packages via NODE_PATH.

Every artifact-producing test accepts OUTPUT_DIR. To preserve the frozen evidence,
set the same new output directory on the four test commands (Python writes oracle
cases consumed by the other tests). Tests do not edit lesson sources or shared files.
For example, use OUTPUT_DIR=/absolute/reviewer/output before each command.

Evidence is in evidence/: numerical reports, independent expected cases, real
Chromium results, downloaded original Python and screenshots. Visually inspect
screenshots after rerunning; producing them does not establish visual inspection.
`visual.cjs` captures the complete 30-bit grid and intro/source at 320px.
`browser.cjs` covers each preset and operation in both languages, six suffix lengths,
all quiz choices and changed choices, locale after interaction, native clipboard
readback, actual fallback Control+C, disabled endpoints, keyboard range/buttons,
horizontal table scrolling, deep links, blocked storage, loaded-page offline use,
forced colors, reduced motion, 320/390/736/1440 and CSS 200% zoom at desktop width.

`debug-overflow.png` is deliberately retained as historical author debugging
material from before the long-binary-label wrapping fix, not current candidate
visual evidence. Final screenshot names omit the debug prefix.

SELF-CHECK.md records observations and limitations. candidate.json fingerprints
lesson/runtime/test inputs and shared dependencies. This is an author run only:
independent lesson acceptance, real novice outcomes and LeetCode submission are
not established. A separate reviewer should start source-blind at the preview.

# Author self-check reproduction

Run from repository root, using the already-running preview. No service startup,
registration, agent dispatch or deployment is part of these tests.

```bash
export OUTPUT_DIR=/tmp/891-self-check
python3 -B leetcode/891/tests/test_solution.py
node leetcode/891/tests/test_core.cjs
node leetcode/891/tests/browser.cjs
node leetcode/891/tests/access.cjs
python3 -B scripts/register_leetcode_lesson.py 891 --validate-only
```

All result/screenshot emitters honor OUTPUT_DIR; default is tests/evidence.
Set NODE_PATH to the available Playwright package location if not inherited.
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is used as launch executablePath when set.
LESSON_URL can override http://127.0.0.1:18770/leetcode/891/. Browser test uses the
local browser host's process.platform for native clipboard shortcuts; each fallback
starts with a new distinct verified clipboard sentinel. Linux was actually tested.
Screenshots require human visual inspection after reruns. Current author inspection
and limitations are in evidence/SELF-CHECK.md. No independent review is implied.

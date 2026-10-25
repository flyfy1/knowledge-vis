# Reproduce author checks

From repository root (preview is already running):

```bash
OUTPUT_DIR=/tmp/leetcode-834-check python3 -B leetcode/834/tests/test_solution.py
OUTPUT_DIR=/tmp/leetcode-834-check node leetcode/834/tests/test_core.cjs
OUTPUT_DIR=/tmp/leetcode-834-check node leetcode/834/tests/browser.cjs
OUTPUT_DIR=/tmp/leetcode-834-check node leetcode/834/tests/visual.cjs
OUTPUT_DIR=/tmp/leetcode-834-check node leetcode/834/tests/access.cjs
python3 -B scripts/register_leetcode_lesson.py 834 --validate-only
```

The first command generates independent BFS cases consumed by the second.
Browser scripts use installed Playwright via NODE_PATH and respect
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. PREVIEW_URL may override the full lesson URL.
All results, screenshots and downloads go to OUTPUT_DIR (defaults to this
lesson's tests/evidence). Use a different directory to preserve frozen evidence.
There are no runtime dependencies on evidence files.

`build_page.py` is an optional lesson-local authoring utility, not a test: it
regenerates only this lesson's skeleton, metadata, baseline and exact source
mirror. Do not run it against a frozen review candidate.

These are author self-checks. A separate run must conduct the independent cold
review. Do not treat a rerun of these commands as acceptance or submission proof.

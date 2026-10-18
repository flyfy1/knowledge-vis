# Reproduce author checks

Run from repository root. Use Python 3.11+ and Pandas 3.0.6 (the author runtime); Playwright is available through NODE_PATH in this environment.

```sh
python3 -m venv leetcode/185/tests/.venv
leetcode/185/tests/.venv/bin/pip install pandas==3.0.6
OUTPUT_DIR=/path/to/reviewer-output leetcode/185/tests/.venv/bin/python -B leetcode/185/tests/check_solution.py
OUTPUT_DIR=/path/to/reviewer-output node leetcode/185/tests/check_core.cjs
OUTPUT_DIR=/path/to/reviewer-output node leetcode/185/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 185 --validate-only
```

`OUTPUT_DIR` redirects result JSON and screenshots without modifying the frozen candidate. Browser checks use the already-running http://127.0.0.1:18789 preview (override PREVIEW_URL); executablePath honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. No service is started. Clipboard success is tested with a deterministic API stub capturing exact bytes; denial exercises real UI manual selection. Download uses the actual browser download event and reads its bytes. Browser sim and real Python are deliberately separate tests, each checked against direct larger-distinct counts. Official null behavior is unspecified; missing salary/key cases only test documented Pandas robustness. No LeetCode submission, learner study, external review, production deployment or real mobile-device test is claimed.

Presets are bounded and completely traced. `check_core.cjs` validates every prefix assignment, retains previous frames, and exhausts small salary arrays; `check_solution.py` independently compares full output multisets and protects both input DataFrames. Official capture is review material only, never loaded by the lesson.

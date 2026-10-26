# Author self-checks

Run from the repository root, with the provided NODE_PATH and optional PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH environment variables. Use the existing preview service; do not start another one.

```bash
OUTPUT_DIR=/tmp/1147-review python3 -B leetcode/1147/tests/numerical.py
OUTPUT_DIR=/tmp/1147-review node leetcode/1147/tests/core.cjs
OUTPUT_DIR=/tmp/1147-review node leetcode/1147/tests/browser.cjs
OUTPUT_DIR=/tmp/1147-review node leetcode/1147/tests/supplemental.cjs
OUTPUT_DIR=/tmp/1147-review python3 -B leetcode/1147/tests/contact_sheets.py
python3 -B scripts/register_leetcode_lesson.py 1147 --validate-only
```

`OUTPUT_DIR` defaults to `tests/evidence/`. Numerical checks generate the fixtures consumed by core checks, so retain the order above. `PREVIEW_URL` may override the browser URL. Contact sheets require the already available Pillow package. Browser scripts require the installed Playwright; localization syntax checks use the installed Acorn. No package installation is required.

The first oracle enumerates every cut mask and tests the resulting whole chunk list. A second oracle uses an all-outer-length recurrence independently of the first-match trace. The actual official Python callable is imported and executed. Trace checks include conservation, all intermediate optimal-remainder identities, candidate identity, shortest matches, progress and terminal counts. Browser source equality retains every character including the final newline. Linux native manual copying uses Control+C and a fresh verified clipboard sentinel for EACH locale. CSS zoom checks the 200% layout; physical-device/browser-chrome zoom is not claimed.

Evidence is author self-check material. It does not replace the separate cold review or claim novice outcomes, judge acceptance or public deployment. Prior author-detected issues and their fixes remain in `evidence/validation-history.md`.

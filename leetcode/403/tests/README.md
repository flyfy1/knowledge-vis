# #403 reproducible author checks

Run from the repository root, using the existing preview (no service startup):

```sh
python3 -B leetcode/403/tests/test_solution.py
node leetcode/403/tests/test_core.cjs
node leetcode/403/tests/browser.cjs
node leetcode/403/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 403 --validate-only
```

Every test that writes evidence honors `OUTPUT_DIR`. To keep the candidate unchanged:

```sh
OUTPUT_DIR=/tmp/frog403-review python3 -B leetcode/403/tests/test_solution.py
OUTPUT_DIR=/tmp/frog403-review node leetcode/403/tests/test_core.cjs
OUTPUT_DIR=/tmp/frog403-review node leetcode/403/tests/browser.cjs
OUTPUT_DIR=/tmp/frog403-review node leetcode/403/tests/accessibility.cjs
```

Browser resolves Playwright/acorn through installed packages and `NODE_PATH` when provided. It honors `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` and optional `PREVIEW_URL` (full lesson URL). Screenshots are generated evidence, never runtime assets. `official.json` is the actual saved public GraphQL response, including all observed codeSnippets, statement, examples and access timestamp.

Python oracle enumerates subsequent stone indices; it does not reuse the canonical candidate-length recurrence. Browser-model oracle computes incoming edges between stone pairs and checks exact intermediate discovered sets. The browser checks actual clipboard success, forced clipboard failure and manual selection, browser download bytes, blocked localStorage, and already-loaded offline interaction.

The 200% captures use CSS zoom=2 at a 1440px viewport, giving a 720 CSS px effective layout in real Chromium. They do not claim a physical phone or OS magnifier test. Contrast calculations use sRGB relative luminance. Measured muted text passes AA; the shared muted token does not reach the preferred 7:1 on every surface. Native focus uses the shared 3px orange outline. All claims are author self-checks; no independent review, learner study, public deployment or accepted LeetCode submission is implied.

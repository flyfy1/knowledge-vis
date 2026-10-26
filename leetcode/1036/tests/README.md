# Reproduce author checks

Run from repository root with the existing preview serving this checkout:

```sh
python3 -B leetcode/1036/tests/test_solution.py
node leetcode/1036/tests/test_core.cjs
node leetcode/1036/tests/browser.cjs
node leetcode/1036/tests/browser_extra.cjs
python3 -B scripts/register_leetcode_lesson.py 1036 --validate-only
```

Every test emitting evidence accepts OUTPUT_DIR (absolute path recommended).
Browser scripts use NODE_PATH for installed Playwright, honor
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH and accept PREVIEW_URL. Default URL:
http://127.0.0.1:18770/leetcode/1036/. No service is started.
`build_page.py` is an author-only local page/copy helper, not a verification command.

`evidence/official.json` is the full observed public GraphQL capture including
statement, examples, constraints, access time and official Python3 interface.
`numerical.json`, `core.json`, `browser.json`, `browser-extra.json` and
`preflight.json` record executed author checks, not independent acceptance.
`candidate.json` binds runtime, source, metadata, brief, tests and shared assets.
The candidate needs a separate reviewer run using the frozen six-dimension rubric.

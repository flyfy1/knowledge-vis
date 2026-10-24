# Reproduce author checks

Run from the repository root, with the existing preview on port 18770:

```sh
python3 -B leetcode/332/tests/check.py
node leetcode/332/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 332 --validate-only
```

`OUTPUT_DIR=/absolute/new/directory` redirects generated reports and screenshots for both test programs. Browser tests use the installed `NODE_PATH` and honor `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. No server is started. Python baseline code is extracted from the actual HTML and executed on the small cases too. Canonical Python is executed directly; the JavaScript visualization is tested separately.

`evidence/algorithm.json` and `evidence/browser.json` record author self-checks, not independent acceptance. `evidence/preflight.json` records the safe metadata gate. `../provenance/official.json` preserves the complete public GraphQL statement and language snippets with access timestamp. `../candidate-manifest.json` identifies the frozen candidate and shared dependencies. Reviewer reruns should use OUTPUT_DIR to preserve this evidence.

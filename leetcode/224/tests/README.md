# Reproduce the author self-check

From repository root, with the existing preview at http://127.0.0.1:18794:

```sh
OUTPUT_DIR=/tmp/224-algorithm python3 -B leetcode/224/tests/test_solution.py
OUTPUT_DIR=/tmp/224-browser node leetcode/224/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 224 --validate-only
```

Use the environment's NODE_PATH for Playwright. If set, PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is passed to launch. No server is started. Tests never register the lesson. Official evidence is frozen in evidence/official.json, from the public official GraphQL question query, with access date, statement, complete observed codeSnippets and Python3 signature. No login or paywall bypass was used.

AST parsing is an independent **test oracle**, not part of the submission or browser. Recursive baseline is deliberately for small inputs. Generated binary operands are parenthesized to respect the official prohibition on consecutive operators. Maximum-depth inputs run through the iterative canonical solution only, compared to closed-form expected values.

Screenshots, reports and downloads use OUTPUT_DIR (Playwright temporary download is managed by its browser context). Clipboard success uses actual browser write/read under granted clipboard permissions and an additional deterministic writeText fixture; denial uses the real manual fallback UI. This does not claim physical operating-system clipboard testing. Browser zoom is checked as both doubled CSS zoom and a doubled-device-scale/halved-layout viewport; no claim of physical device testing. The frozen candidate is ready for a separate review, not independently accepted or published.

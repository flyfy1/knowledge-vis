# Author checks (not independent review)

Run from the repository root. Tests support OUTPUT_DIR (test_budget.py uses explicit --output);
set it to a new directory when reviewing a frozen candidate.

```sh
python3 -B leetcode/843/tests/test_budget.py --output /tmp/843-review/green.json
OUTPUT_DIR=/tmp/843-review python3 -B leetcode/843/tests/test_solution.py
OUTPUT_DIR=/tmp/843-review node leetcode/843/tests/test_core.cjs
OUTPUT_DIR=/tmp/843-review node leetcode/843/tests/browser.cjs
OUTPUT_DIR=/tmp/843-review node leetcode/843/tests/focused.cjs
OUTPUT_DIR=/tmp/843-review node leetcode/843/tests/budget_browser.cjs
python3 -B scripts/register_leetcode_lesson.py 843 --validate-only
```

Browser scripts use the already-running preview at http://127.0.0.1:18770;
PREVIEW_URL may override it. They respect NODE_PATH and
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, use actual Playwright Chromium and native
Linux Control+C / macOS Meta+C based on the browser host, and seed/read a fresh
non-source clipboard sentinel before each fallback attempt. No source is written
to the clipboard by the fallback test itself. Outputs include final-newline parity.

`build_copy.py` and `build_html.py` are local authoring helpers, not reviewer test
commands. They write only this lesson; do not run them on a frozen candidate.
Official capture is retained in tests/evidence/official-graphql.json and explained
in official-verification.md. No paywall or credentials were used.

Numerical tests independently enumerate reply groups and history consistency.
The JS trace is not execution of Python. Python executes against a fake judge
that implements the documented API and validates the original callable contract.
The 26-word disjoint stress succeeds under budget 30; it does not establish a
universal ten-call bound. Paired families are all-secret budget regressions,
including the actual singleton final call. The budget-10 22-word simulation is
a deliberately infeasible negative control and must never display success.

843-BUDGET-R1 history (all writes stay in this lesson):

```sh
python3 -B leetcode/843/tests/test_budget.py --source leetcode/843/tests/evidence/budget-r2/before.py --output leetcode/843/tests/evidence/budget-r2/red.json
# Exit 1 expected: 20/22 and 20/24 found.
python3 -B leetcode/843/tests/test_budget.py --source leetcode/843/tests/evidence/budget-r2/before.py --diagnostic-bound 11 --output leetcode/843/tests/evidence/budget-r2/diagnostic11.json
# Exit 1 overall: 22/22 fixed, but only 22/24; diagnostic only.
python3 -B leetcode/843/tests/test_budget.py --source leetcode/843/tests/evidence/budget-r2/before.py --diagnostic-bound 30 --output leetcode/843/tests/evidence/budget-r2/diagnostic30.json
# Exit 0: all fixtures pass; diagnostic only, not the canonical repair.
```


843-R2-SELECT01 selected-value regression (author check):

```sh
OUTPUT_DIR="$PWD/leetcode/843/tests/evidence/select-r3/green" node leetcode/843/tests/selection_browser.cjs
```

Checks complete adjacent selected text for presets 6/8 at 320/390/1280 in
zh→en→zh, normal size and CSS zoom 2. It verifies the description association,
wrapping geometry, full screenshot visibility and retained round/candidate state.
`select-r3/red/selection-results.json` preserves the pre-fix exit-1 result from
the initial normal-size test: full selected-scenario readout missing. The final
test additionally covers zoom and visible capture bounds. This is a readout
repair; it does not assert that native option text itself now fits the select.

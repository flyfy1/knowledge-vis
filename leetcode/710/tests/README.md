# Reproduce author checks

From the repository root (existing preview at port 18770, no service launch):

```sh
LESSON_OUTPUT_DIR=/tmp/leetcode-710-review python3 -B leetcode/710/tests/test_solution.py
LESSON_OUTPUT_DIR=/tmp/leetcode-710-review node leetcode/710/tests/test_core.cjs
LESSON_OUTPUT_DIR=/tmp/leetcode-710-review node leetcode/710/tests/browser.cjs
LESSON_OUTPUT_DIR=/tmp/leetcode-710-review node leetcode/710/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 710 --validate-only
```

Use installed Node packages via NODE_PATH. The browser runner honors
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if set. LESSON_URL optionally overrides the
lesson URL; it defaults to http://127.0.0.1:18770/leetcode/710/. Every test writes
results and screenshots only to LESSON_OUTPUT_DIR when supplied. The default is
this folder's evidence/. No generator, registration, server, credentials or
networked submission is needed. Python -B avoids cache writes.

The Python oracle enumerates allowed values independently, intercepts only the
random ticket, and executes the actual canonical Solution.pick method. It checks
exact output multiplicities and number/arguments of random API calls. The JS core
has separately derived per-frame set/uniqueness/range invariants; browser tests
exercise the real page and source transfer. A frequency histogram is a seeded
smoke check, not the mathematical argument for equal probability.

Browser screenshots are inspected by the author, not learner evidence. The
200% check uses Chromium CSS rendering zoom, not a physical-device test. The
clipboard host is recorded in browser-results.json; native Control+C on this
Linux host is verified by reading back source after a distinct non-source
sentinel. Clipboard denial is injected only into the automatic write method;
manual keyboard copying still uses Chromium's native implementation.

The v1-clipped-select screenshot is historical author evidence, not the final
candidate. It intentionally is not overwritten by a rerun of the final candidate.
See SELF-CHECK.md for the repair and test-harness corrections. A separate run must
conduct the independent cold walkthrough and judge the frozen candidate.

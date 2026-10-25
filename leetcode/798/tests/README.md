# Reproduce the author checks

From the repository root (use the already running preview at port 18770):

```sh
OUTPUT_DIR=/tmp/798-review python3 -B leetcode/798/tests/test_solution.py
OUTPUT_DIR=/tmp/798-review node leetcode/798/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 798 --validate-only
```

The browser runner uses installed Playwright via NODE_PATH and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. OUTPUT_DIR is optional and applies to every emitted JSON/screenshot; neither test changes the candidate. The browser uses Linux Control+C (or Meta+C on a macOS browser host) for native manual copy, with a new verified clipboard sentinel for each locale. When running a remote browser on a different host, use that host's shortcut rather than inferring it from the client.

The numerical oracle physically rotates a list then counts the value/index comparisons. It does not derive expected scores from losing intervals. Python is executed through the actual Solution.bestRotation callable; inputs are checked for mutation. Browser core checks cover individual interval membership, every scanned bad/score and earliest-best pair. The maximum-sized cases use closed-form expectations.

Evidence files are author self-checks. They are not an independent review, a real-device study, an observed learner outcome, public release verification or a LeetCode submission result. The 200% layout check scales CSS using zoom:2; it is a browser rendering test, not a physical-device or OS magnifier test.

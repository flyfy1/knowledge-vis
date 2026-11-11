# Reproduce author checks

From the repository root (no server is started):

```sh
export OUTPUT_DIR=/tmp/leetcode-913-review
python3 -B leetcode/913/tests/check.py
node leetcode/913/tests/core.cjs
node leetcode/913/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 913 --validate-only
```

`check.py` generates oracle fixtures in OUTPUT_DIR for the two Node checks.
Use the environment's NODE_PATH when supplied. The browser honors
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH and PREVIEW_ROOT (default
http://127.0.0.1:18770). It requires the already-running preview to serve the
same candidate. Chromium clipboard permissions are granted on the local origin;
the actual native fallback uses the host OS shortcut after verifying a distinct
clipboard sentinel for each attempt. Source equality includes the final newline.
No real LeetCode submission is made.

The independent tiny oracle recursively follows literal history, treating a
repeated full state as a draw. It checks every triple for all valid simple
graphs of size 3 and 4 with legal moves at every cat node. The synchronous oracle
has no queue or decrement counter and checks larger inputs. Canonical Python
and the displayed full-scan baseline execute on every case. Simulator checks
compare every reachable final state and intermediate counter; simulator snapshots
are deliberately limited to n≤9 to avoid unnecessary O(n^4) teaching memory.
Canonical Python and the full-scan oracle also execute dense and path n=50 cases.

Review status: these are author self-checks, not a separate independent review,
LeetCode acceptance, production verification or actual learner measurements.

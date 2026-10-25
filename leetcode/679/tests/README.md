# Reproduce the author checks

From the repository root, using the existing preview server (do not start a new
server). Browser dependencies resolve via the supplied NODE_PATH. If
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is present, the runner uses it.

```bash
OUTPUT_DIR=/tmp/679-review python3 -B leetcode/679/tests/test_solution.py
OUTPUT_DIR=/tmp/679-review node leetcode/679/tests/test_core.cjs
OUTPUT_DIR=/tmp/679-review node leetcode/679/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 679 --validate-only
```

All result/screenshot writers accept OUTPUT_DIR and create it if needed. The
browser runner defaults to http://127.0.0.1:18783 and accepts PREVIEW_URL. The
Python oracle enumerates contiguous expression intervals for each permutation,
independently of the submission's arbitrary pair-reduction search. Its interval
splits cover all five four-leaf parenthesis shapes. Duplicate card hands are
exhaustively tested as 495 multisets; 200 seeded cases exercise different orders.

The browser uses actual Linux Control+C (Meta+C on a macOS host) after denied
programmatic write. It seeds a distinct clipboard sentinel first, checks focus
and complete selection, then reads the clipboard after the real shortcut. It
never writes the source to the clipboard to simulate fallback success.

Screenshot names include locale and viewport width. `stage` captures retain
fractional values and the search ledger. A sticky navigation bar can appear at
a capture-dependent position in tall element/full-page captures; the dedicated
zoom viewport captures show the settled ordinary screen. Zoom uses CSS layout
zoom 2, not device pixel ratio or a claim of physical device testing.

Frozen author evidence is under evidence/. Independent reviewers should choose
an external OUTPUT_DIR to avoid modifying the candidate. Self-check evidence
is not independent lesson acceptance or a LeetCode submission result.

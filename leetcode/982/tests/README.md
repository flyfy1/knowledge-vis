# Reproduce the author checks

From the repository root, with the existing preview at http://127.0.0.1:18795:

```sh
export LESSON_EVIDENCE_DIR=/tmp/leetcode-982-rerun
python3 -B leetcode/982/tests/test_solution.py
node leetcode/982/tests/test_core.cjs
node leetcode/982/tests/browser.cjs
node leetcode/982/tests/capture_zoom.cjs
python3 -B scripts/register_leetcode_lesson.py 982 --validate-only
```

Use the installed browser packages via NODE_PATH. The browser test honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH and optionally LESSON_PREVIEW_URL (origin only). All generated results, downloads and screenshots go into LESSON_EVIDENCE_DIR; default is this lesson's tests/evidence. Rerun into a fresh output directory to preserve the frozen evidence. No server is started, registry changed, or submission sent.

The Python oracle enumerates index triples directly. The core test independently enumerates the exact masks that should contribute to every partial transform cell; it does not merely compare the final sum to the same recurrence. Browser fixtures are produced only after those cell assertions pass. Browser checks compare all displayed f/g cells in both locales, and use native host clipboard transfers with a fresh verified sentinel per manual-copy attempt.

The 200% captures use CSS layout zoom in desktop Chromium. These are synthetic layout checks, not physical phone or browser-toolbar zoom evidence. Related lessons are checked on this local preview only. Author self-checks are not independent teaching acceptance, real learner results, a LeetCode submission result, or public delivery verification.

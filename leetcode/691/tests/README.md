# Reproduce the author self-check

From the repository root, using the already-running preview:

```sh
OUTPUT_DIR=/tmp/lesson-691-core python3 -B leetcode/691/tests/check.py
OUTPUT_DIR=/tmp/lesson-691-browser node leetcode/691/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 691 --validate-only
```

The browser test uses installed Playwright via NODE_PATH and honors
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. PREVIEW_ROOT optionally overrides
http://127.0.0.1:18783. No server is started. OUTPUT_DIR redirects every emitted
JSON, downloaded file and screenshot; no lesson source is rewritten.

The independent position-mask BFS is an algorithmic oracle, not an independent
reviewer. The canonical Python method and displayed recursive baseline are
executed. Trace checks examine intermediate states, not just returned answers.
The browser uses Linux Control+C (or Meta+C on a Darwin host) after seeding a
non-source clipboard sentinel; it reads back the actual copied source.
Clipboard write rejection is injected solely to exercise the manual fallback.

Screenshots of tall components hide only sticky navigation during capture to
avoid Playwright placing the sticky header inside an element screenshot. The
ordinary viewport capture retains navigation, and real anchor geometry is
checked with navigation present. The zoom check uses 200% CSS layout zoom in
real Chromium; it is not a physical device or browser chrome zoom claim.

Early harness attempts failed by clicking disabled Reset, assuming a final
period that the UI does not render, measuring during smooth scrolling, and
checking an asynchronous clipboard completion too soon. These were harness
assumptions; runtime files did not change to clear those failures. The final
runner retains endpoint, text, anchor and clipboard assertions, with explicit
waits and correct text expectations. Component captures were adjusted for a
sticky screenshot artifact. These diagnostics do not constitute reviewer findings
or independent acceptance.

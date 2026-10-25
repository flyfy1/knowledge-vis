Run from the repository root. Tests write only to OUTPUT_DIR (default: this lesson's tests/evidence). Use a fresh external output folder to rerun a frozen candidate without changing it.

```sh
OUTPUT_DIR=/tmp/975-review-numeric python3 -B leetcode/975/tests/numerical.py
OUTPUT_DIR=/tmp/975-review-browser NODE_PATH="$NODE_PATH" node leetcode/975/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 975 --validate-only
```

The browser test uses the already-running http://127.0.0.1:18793 preview and installed Playwright. Set NODE_PATH to the installed browser package location if it is not already configured. If PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is set, it is used for Chromium launch. No server is started. Clipboard tests use the actual browser clipboard, a distinct verified sentinel before each denied-write attempt, and the Linux/Windows Control+C or macOS Meta+C host shortcut. No source text is injected into the clipboard as a substitute for transfer.

Numerical checks execute the canonical Python, the displayed complete baseline extracted from HTML, and JavaScript snapshots against independently derived direct suffix selection and forward path walks. Exhaustive arrays use values 0..2, lengths 1..7; seeded cases and maximum-length boundaries supplement them. Browser checks include actual locale, keyboard, scrolling, clipboard, downloads, offline display and blocked storage. Every localized copy entry must be a pair of nonempty strings; raw duplicate keys are checked before JS evaluation.

Final author evidence: evidence/candidate-v4/. Earlier folders and root browser.json are development probes, not the final candidate or independent review. Raw official content and selector capture: evidence/official.json. Root favicon.ico 404 on a related lesson is recorded separately as a sibling warning; it is not suppressed as a lesson asset success. No real devices, public delivery, LeetCode submission or learner study were tested.

Run from repository root against the existing preview service:

```sh
python3 -B leetcode/862/tests/check.py
NODE_PATH="$NODE_PATH" node leetcode/862/tests/copy.cjs
NODE_PATH="$NODE_PATH" node leetcode/862/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 862 --validate-only
```

Set OUTPUT_DIR to a separate directory for algorithm results and browser
screenshots/results without changing this candidate. PREVIEW_URL defaults to
http://127.0.0.1:18770. Browser uses NODE_PATH's Playwright and
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. No server is started. The copy
shape/AST check emits only stdout. Python uses -B to avoid bytecode artifacts.

check.py executes the official Python interface, baseline, and independent
slice-enumeration oracle, including exhaustive values [-2,0,2] at lengths 1..6,
seeded cases, immutable inputs, and four maximum-size boundaries. trace.cjs
supplies simulation snapshots; Python independently checks prefix values,
completed-round optima, strict order, removals and best interval identity.

browser.cjs exercises both locales/all presets/all trace events, replay, changed
prediction, copy and repeated manual fallback with fresh verified clipboard
sentinels and native Linux Control+C. Includes canonical embedded/rendered/
copied/downloaded parity, 320/390/736/1440 widths, CSS zoom 2, keyboard and
forced colors, blocked storage, offline opening, local links and deep targets,
calibrated contrast and total CSS bytes. It records a narrowly classified
pre-existing /favicon.ico 404 requested by related lesson #239 as a related-page
warning; all lesson runtime console, page errors, bad assets and external
requests must remain empty. The test does not suppress other failures.

All evidence is author self-check, not an independent review or public delivery
verification. Headless Chromium on this host does not test physical devices,
browser-chrome zoom, screen-reader speech or actual novice comprehension.

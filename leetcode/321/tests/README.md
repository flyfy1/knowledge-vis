# #321 reproducible author checks

From the repository root, using the existing preview at http://127.0.0.1:18770:

```sh
python3 -B leetcode/321/tests/check.py
node leetcode/321/tests/core.cjs
node leetcode/321/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 321 --validate-only
```

To retain the frozen candidate, redirect generated files (create the destination first):

```sh
OUTPUT_DIR=/tmp/review-321 python3 -B leetcode/321/tests/check.py
OUTPUT_DIR=/tmp/review-321 node leetcode/321/tests/core.cjs
OUTPUT_DIR=/tmp/review-321 node leetcode/321/tests/browser.cjs
```

`check.py` creates the directory and the fixtures consumed by `core.cjs`. The browser uses installed Playwright via NODE_PATH and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. PREVIEW_ROOT can override the preview origin. No service is started. Evidence capture scripts run in a fresh browser and never write shared assets. No network is required by the runtime other than local static assets. Official-source access was a separate dated author verification.

Python oracle: enumerate every available next index in either input with cached subproblems; no greedy subsequence selection and no suffix-choice rule. A second enumeration independently lists all single-source subsequences and all two-source interleavings for JavaScript fixtures. Intermediate stack states are checked against exhaustive prefix subsequences, and merge output against exhaustive optimal prefixes. Source inputs must remain unchanged. Maximum-size fixtures have analytically determined results.

Browser: real headless Chromium in both locales; every trace frame and full rewind, endpoints, resets, all presets, all predictions/reveal/change, state preserved on language switch, stored and blocked storage, actual clipboard success/denial with selected textarea fallback, embedded/display/copied/downloaded bytes, all internal fragment targets, keyboard activation/focus and forced-colors, reduced-motion, 320/390/736/1440 widths and 200% CSS layout zoom at 1440. Contrast uses browser-computed foreground and opaque ancestor backgrounds. Focused stage screenshots show before/after values and cumulative history. Visual inspection is recorded separately in SELF-CHECK.md.

These are author checks, not independent review, measured novice comprehension, physical-device validation, official submission acceptance, or public deployment. 200% evidence uses Chromium CSS layout zoom, not browser chrome UI zoom.

Focused stage captures temporarily mask the sticky navigation **only for the screenshot** to prevent an overlay capture artifact. Normal navigation remains visible and is separately checked via real anchor clicks, target geometry and aria-current. The history region is deliberately scrollable and focusable; a screenshot can end at its scroll boundary while all snapshots remain in the DOM. Clipboard tests include the actual Chromium clipboard plus deterministic success/denial branches and manual Ctrl+C from the fallback textarea.

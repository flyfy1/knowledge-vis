# Reproduce author self-checks

Use the already-running preview at http://127.0.0.1:18770; do not start another service.
From repository root (NODE_PATH and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH are supplied by the environment):

```sh
OUTPUT_DIR=/tmp/407-review-evidence python3 -B leetcode/407/tests/test_solution.py
OUTPUT_DIR=/tmp/407-review-evidence node leetcode/407/tests/browser.cjs
OUTPUT_DIR=/tmp/407-review-evidence node leetcode/407/tests/accessibility.cjs
python3 -B scripts/register_leetcode_lesson.py 407 --validate-only
```

Use a fresh output directory for reviewer evidence. PREVIEW_ROOT optionally overrides the preview origin. All generated numerical/browser reports and screenshots go to OUTPUT_DIR (default: this lesson's tests/evidence). Tests never register the lesson or modify other lessons. The computational test invokes test_core.cjs with independently derived per-cell fixtures through stdin; it is not intended to run with empty stdin.

The oracle floods exterior-connected integer layers, independently of the canonical heap method. It covers every ternary 3×3 map, seed 407 rectangles, official examples, all six adjustable outlet heights and the fresh transfer question. Large closed-form tests separately execute the exact Python callable at the official maximum. The JavaScript trace is checked on every frame against oracle levels, visited/queue uniqueness and cumulative depths. Localization parsing uses Acorn to reject duplicate object keys before JavaScript overwrites could hide them.

Browser tests exercise both locales/all six presets/all rounds with rewind, endpoints and reset; the slider, all prediction answers/change/reveal, state preservation, clipboard success/denial, exact display/copy/download bytes, unavailable storage, offline source, keyboard, deep links and local-only assets. Screenshots cover 320/390/736/1440 px plus 200% CSS layout zoom (equivalent half-width layout; not an operating-system magnifier). accessibility.cjs additionally uses Chromium's real clipboard, measures disabled/selected controls and focus contrast, verifies 48px controls, native Tab/Enter/Home/End, forced landscape and positive-depth states. Inspect screenshots; passing overflow assertions alone is insufficient.

These are author self-checks. No independent teaching review, actual novice outcomes, public deployment or LeetCode acceptance is established.

# Reproduce the author self-checks

Run from the repository root with the existing preview server. Do not start or register a lesson:

```bash
python3 -B leetcode/149/tests/algorithm.py
node leetcode/149/tests/core.cjs
node leetcode/149/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 149 --validate-only
```

The browser requires the available `playwright` package (`NODE_PATH` in this environment). It respects `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Default preview: `http://127.0.0.1:18785/leetcode/149/`; override with `LESSON_URL`.

All three tests accept `OUTPUT_DIR`. To preserve this candidate's evidence, set it to a new directory **for all three commands**, running algorithm before core (the latter reads the former's fixtures). Example:

```bash
export OUTPUT_DIR=/tmp/lesson-149-review-evidence
python3 -B leetcode/149/tests/algorithm.py
node leetcode/149/tests/core.cjs
node leetcode/149/tests/browser.cjs
```

`algorithm.py` executes the actual official Python callable and the baseline extracted from the lesson. An independent raw cross-product oracle checks both. It checks input immutability and repeated calls. The generated small-case fixtures drive `core.cjs`, which checks every snapshot and uses direct collinearity tests for membership, local and completed-anchor maxima. Trial division separately checks reduced keys. Large tests use closed-form expected counts, including n=300.

`browser.cjs` uses real headless Chromium and the running preview. It checks both languages, all presets and trace endpoints, rewind/replay, reset, range keyboard actions, prediction/reveal/change, locale state, source display/copy/download, clipboard denial/manual selection, denied storage, file:// source, local links and asset failures, widths 320/390/736/1440, 200% CSS layout zoom, native keyboard focus, forced colors and reduced motion. It measures contrast and shared+local CSS bytes. Screenshots must also be visually inspected: assertions alone cannot establish readability. CSS zoom is explicitly an emulation of layout magnification; native browser chrome zoom and physical phones are not measured.

Results in `evidence/` are author self-check evidence, not independent review, LeetCode acceptance, actual novice testing or publication. `candidate.json` identifies files frozen for a later separate review; shared files are read-only dependencies. Metadata preflight is non-mutating and is recorded in `evidence/preflight.json`.

Optional inspection overview: `python3 -B leetcode/149/tests/contact-sheets.py` (Pillow; also honors `OUTPUT_DIR`).

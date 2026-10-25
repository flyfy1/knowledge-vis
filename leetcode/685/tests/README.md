# Reproduce the author checks

Run from the repository root with the already running preview. Python 3 and Node
with Playwright via NODE_PATH are required. No server is started by these tests.

```sh
export OUTPUT_DIR=/tmp/leetcode-685-review
python3 -B leetcode/685/tests/test_solution.py
node leetcode/685/tests/test_core.cjs
node leetcode/685/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 685 --validate-only
```

OUTPUT_DIR is supported by every test that emits results/screenshots. Run Python
before the JS core test: it generates fixtures from the independent deletion
oracle. PREVIEW_URL can override the browser target; the default is the supplied
http://127.0.0.1:18782/leetcode/685/. The browser honors
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. Native clipboard testing uses the
actual runner host platform (Linux here), a distinct sentinel, keyboard copy and
real readback. Source strings include the final newline.

- `test_solution.py`: calls the original official Python method; exhaustive valid
  ordered simple graphs for n=3/4, Prüfer-generated random tree-plus-edge cases,
  maximum n=1000 boundaries, no mutation, mirror parity and duplicate-copy-key
  detection before JSON parsing can discard duplicates.
- `test_core.cjs`: compares each result to Python's independent oracle fixtures;
  independently recomputes incoming prefixes and undirected components with BFS,
  checks forest edge counts, representative sizes, rejection preconditions and
  deep snapshots. Large canonical-runtime tests are not browser teaching inputs.
- `browser.cjs`: actual Chromium, both locales, all preset frames, backward/replay,
  endpoints/reset, hand deletion, quiz selections/reveal/change and locale
  preservation, source copying/download, local-file offline opening, storage
  denial, local asset errors, related and sticky anchors, keyboard, focus,
  reduced motion/forced colors, 320/390/736/1440 widths, and 200% CSS zoom.

Screenshots of long stages temporarily hide the sticky navigation only during
capture, avoiding the documented element-screenshot overlay artifact. The real
sticky navigation is separately tested with actual clicks and settled geometry;
no runtime styles are changed. 200% here uses the Chromium CSS zoom property,
with responsive 736px checks as additional reflow coverage, not a claim about
physical devices or browser chrome settings. Saved screenshots are reviewed
visually by the author; they do not establish independent learner results.

Default evidence is in `tests/evidence/`. `harness-history.md` preserves the
initial test-harness errors and the related-link correction. These failures are
not independent review findings. `candidate-sha256.json` freezes the authored
sources/tests and official capture, excluding rerunnable output artifacts.
Independent lesson acceptance, LeetCode submission acceptance and production
release remain pending/outside this author run.

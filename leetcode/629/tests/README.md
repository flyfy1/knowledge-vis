# Reproduce author self-checks

From the repository root, use installed Node packages through `NODE_PATH` and the provided `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. Use the existing preview server; do not start another service.

To avoid changing the frozen candidate, redirect every emitted artifact to a new directory:

```bash
export OUTPUT_DIR=/tmp/leetcode-629-review
export PREVIEW_ROOT=http://127.0.0.1:18782
python3 -B leetcode/629/tests/test_solution.py
node leetcode/629/tests/test_core.cjs
node leetcode/629/tests/browser.cjs
node leetcode/629/tests/extra-browser.cjs
node leetcode/629/tests/settled-views.cjs
python3 -B scripts/register_leetcode_lesson.py 629 --validate-only
```

The order matters: Python emits independent permutation histograms consumed by both Node tests. These histograms are produced from the definition, not from the production recurrence or formatter. The Python test also uses direct insertion sums and a separate generating-polynomial coefficient calculation. It runs the actual official class/method, including the largest allowed n,k; `sys.settrace` checks canonical intermediate windows before cell assignment. The bounded JS teaching trace is checked against the independent histograms at all 455 frames / 420 cell transitions across n=1…5,k=0…6, not only preset endpoints.

Browser checks use real Chromium on the preview URL. They exercise all presets in both locales, each intermediate cell, used-source indices, row boundaries, endpoints, replay, range keyboard, native controls, preserved locale state, all quiz choices, explicit reveal, changed-choice clearing, independent quiz/trace state, formula text, exact displayed/native clipboard/manual selected clipboard/downloaded source, local assets, related anchors, blocked storage, offline source, forced colors and reduced motion. Viewports are 320,390,736,1440; 200% CSS layout zoom is tested at width 640 and 1440, giving an effective narrow width down to 320. Supplemental checks exercise successful native copying in each locale and horizontally scroll to the rightmost table column. No actual phone, screen reader, browser toolbar zoom, LeetCode judge submission, deployment, independent acceptance or learner result is established by these tests.

Inspect the PNGs visually after rerunning; assertions about geometry alone do not replace inspection. Test scripts may emit screenshots larger than the runtime-image budget; they are review evidence, never requested by the lesson. All test output respects OUTPUT_DIR, including downloaded source. `candidate.json` binds the authored files and frozen evidence; reviewer reruns should not regenerate it or change this directory.

The settled-views capture pass uses fresh contexts and waits for font readiness. It supplements rapid viewport/locale changes with full focused tables at 736/1440 and 200% zoom at 640/1440. Inspect these together with the interactive-run screenshots.

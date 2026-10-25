# Reproduce the author self-check

Run from the repository root, using the already-running preview. No registration or service startup is needed.

```bash
export OUTPUT_DIR=/tmp/leetcode-552-recheck
python3 -B leetcode/552/tests/test_solution.py
node leetcode/552/tests/test_core.cjs
node leetcode/552/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 552 --validate-only
```

`NODE_PATH` supplies the installed Playwright package. The browser script honors `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; `PREVIEW_ROOT` defaults to http://127.0.0.1:18778. Each test writes only to OUTPUT_DIR when specified; run numerical checks first because core and browser checks consume independently enumerated buckets from that directory. The canonical solution is executed by Python; the browser numerical model is separately checked, not presented as Python execution.

The default output destination is `tests/evidence/`. Official capture files are provenance, never loaded by the product. Browser screenshots show the completed n=10 counts in both languages at 320/390/736/1440 CSS px. Full-grid captures temporarily hide sticky navigation only during capture to avoid an element-screenshot overlay artifact; the actual navigation is tested normally. Zoom captures use document CSS zoom 2 at a 1440px viewport and are headless layout evidence, not a real-device browser zoom claim.

Numerical oracle 1 generates every string through length 10, checks literal award predicates and independently groups legal strings. Oracle 2 counts no-A P/L strings via a tribonacci recurrence, then inserts a unique A with independent left/right no-A blocks. It checks official examples, seed 552, 60 cases through 6000 and 99999/100000. This is independent algorithm evidence, not an independent reviewer.

The browser checks both locales, each preset and each day, all endpoints, range input and rewind/replay, quiz distractors/correct answer/reveal/change, locale preservation including focus, trace/quiz isolation, clipboard success and manual fallback (including full selection), source/download exactness, live internal anchors, offline operation after load, unavailable storage, keyboard controls, forced colors, reduced motion, local requests and calculated contrast. It captures representative populated states and checks geometry. Human inspection of generated images is still required after a rerun.

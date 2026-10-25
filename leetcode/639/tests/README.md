# Reproduce the author checks

Run from the repository root with the existing preview at http://127.0.0.1:18783. Do not start another service. Python 3, Node, and the environment's Playwright package are used. The browser script honors NODE_PATH and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.

```bash
export OUTPUT_DIR="$PWD/leetcode/639/tests/evidence-rerun"
python3 -B leetcode/639/tests/check_algorithm.py
node leetcode/639/tests/check_core.cjs
node leetcode/639/tests/check_browser.cjs
python3 -B scripts/register_leetcode_lesson.py 639 --validate-only
```

All generated artifacts go to OUTPUT_DIR (default: this folder's evidence/). Run the algorithm check first: it writes the independent expected values used by the two JavaScript checks. PREVIEW_ROOT may override the origin without starting a service. A new output directory lets a reviewer preserve the frozen evidence. The preflight is safe and non-mutating; its author receipt is in evidence/preflight.json.

The independent oracle expands actual digits and enumerates every cut mask, rejecting invalid numeric tokens. It does not use wildcard coefficients or a prefix recurrence. The displayed baseline is extracted from the actual HTML and executed against that oracle as well. The Python submission is imported and called through its original Solution.numDecodings contract. Maximum cases use a combinatorial closed form for all stars, fast-doubling Fibonacci for all ones, and fixed zero/pair cases.

The core check compares every intermediate prefix to this oracle, checks frame independence, and validates bilingual copy shapes/placeholders; the Python check detects duplicate copy keys before JavaScript evaluation. Browser checks cover all short presets, all digit replacements, all coefficient presets, full prefix transitions, both locales, rewind/replay, endpoints, slider, independent quiz choices/reveal/change, locale preservation, keyboard Enter/Tab and focus, forced colors, actual clipboard success and manual copy after a sentinel, real downloads, source parity, blocked storage, and offline file opening. They check local requests, related fragment targets, numeric formulas and meanings, selected-label geometry, 320/390/736/1440 layouts and 200% CSS zoom. Screenshots require human visual inspection; assertions alone do not establish readability.

These are author self-checks. Fresh independent lesson review, real-device testing, learner teach-back, LeetCode submission acceptance, and public delivery are not established.

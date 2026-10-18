# Reproduce author checks for #65

Run from the repository root; use the already running preview (default `http://127.0.0.1:18770`). These are author self-checks, not independent acceptance. Python 3 and Node are used; Playwright is available through the environment's `NODE_PATH`.

```bash
OUTPUT_DIR=/tmp/lesson65-check python3 leetcode/65/tests/test_solution.py
OUTPUT_DIR=/tmp/lesson65-check node leetcode/65/tests/test_core.cjs
OUTPUT_DIR=/tmp/lesson65-check node leetcode/65/tests/browser.cjs
```

Every test that writes evidence accepts `OUTPUT_DIR`; browser also accepts `PREVIEW_ROOT` and uses `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if set. Rerunning with an external output directory does not modify the frozen candidate. Python disables bytecode writes. No service is started.

- `official.json`: unmodified public GraphQL response data plus `source` and `observedAt` provenance fields. Query requested question identity, content, examples, difficulty/access, and all code snippets. Official `Python3` snippet is `class Solution: def isNumber(self, s: str) -> bool`. Browser-readable official URL was also verified. No login or paid-content access was needed.
- `baseline.py`: independent split grammar, also displayed in the page. It does not call the submission or browser scan. The regex oracle directly encodes the official grammar and uses full matching; neither oracle converts to a float.
- `test_solution.py`: executes `Solution().isNumber`; 23 official valid/invalid strings including the three numbered examples, exhaustive lengths 0–5 over `01+-.eEa`, 7,000 seeded random strings, 2,000 grammar-generated valid strings, maximum-length and defensive out-of-contract boundaries; verifies exact source mirror syntax/bytes.
- `test_core.cjs`: independently full-matches the grammar, exhausts the same small alphabet, uses deterministic random cases, and checks every consumed prefix. A live prefix is either complete now or completable by appending `0`; flags must match the actual current part. Fatal rejection stops immediately, leaving the suffix unprocessed. 44,460 cases and 142,951 frames.
- `browser.cjs`: real Chromium, both locales, all ten presets/every frame, reversible replay, slider/button keyboard, all quiz choices and reveal/change/locale combinations, custom input/error preservation, clipboard native success and denied fallback/recovery, actual download/source equality, storage denial and offline file opening. Screenshots cover widths 320/390/736/1440, 200% CSS zoom (640px viewport with 320px-equivalent layout), landscape, hidden/revealed quiz, first-fatal-character rejection, and exponent reset ledger. It checks sticky anchors, related anchor existence, local requests, focus/forced colors/reduced motion, 48px controls, CSS bytes, and computed contrast.

Screenshots are evidence to inspect visually, not automated proof of usability. The wide history table is intentionally a contained horizontally scrolling table; the page provides a localized hint and keyboard access. Physical phones, browser-toolbar zoom, assistive-technology speech, actual learner outcomes, an online LeetCode submission, independent teaching review and production delivery are outside these self-checks.

The manifest `candidate-sha256.json` identifies lesson/test/evidence files, excluding itself and transient bytecode. Shared asset hashes identify the reused contracts but those files are outside this author's ownership. No collection registration is performed.

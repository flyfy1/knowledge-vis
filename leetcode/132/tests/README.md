# Reproduce author checks

Run from the repository root. These are self-checks, not an independent review.
Use the already running preview; no server process is started by these tests.

```sh
OUTPUT_DIR=/tmp/lesson-132-review python3 -B leetcode/132/tests/test_solution.py
OUTPUT_DIR=/tmp/lesson-132-review node leetcode/132/tests/test_core.cjs
OUTPUT_DIR=/tmp/lesson-132-review node leetcode/132/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 132 --validate-only
```

Browser tests use installed Playwright through NODE_PATH and honor
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. LESSON_URL can override the existing preview
URL (default http://127.0.0.1:18782/leetcode/132/). Runtime request assertions assume
that preview origin. Every generated screenshot/result uses OUTPUT_DIR; tests do
not modify lesson source. Prefer an absolute output directory outside the candidate.

Python: independently enumerate cut masks, exhaust binary strings of lengths
1–10, seeded random strings, official examples and four maximum-size inputs.
Execute the actual class method, not a translated function. Verify the mirror.

Core: a separately implemented JS cut-mask oracle checks every computed P cell,
every completed dp prefix, provisional minima, event count and deterministic deep
snapshots. Includes exhaustive binary strings through length 6 and seeded cases.

Browser: both locales and all presets, forward/back replay, range Home/End, reset,
endpoints, all prediction answers and answer changes, locale preservation,
source disclosure, actual clipboard copy + readback, forced clipboard denial,
manual source selection, download parity, storage denial, file:// offline opening,
keyboard activation/focus, forced colors, reduced motion, local links, asset errors,
external requests, 320/390/736/1440 widths and 200% CSS layout zoom. Caption and row
headers remain identifiable during contained horizontal table scrolling. Text
contrast uses exact rendered palette pairs, with no opacity-based disabled text.

Evidence boundaries: headless Chromium, CSS layout zoom (not browser-chrome zoom
or a physical mobile device), author visual inspection, no actual novice session,
no external submission, no deployment, no independent acceptance. Section element
screenshots may include a sticky-nav overlay at a capture-specific position;
actual anchor landing is separately tested after smooth scrolling settles.

Official evidence: `evidence/official-graphql.json` is the unmodified successful
public GraphQL response. `official-verification.md` records source, query, selector,
callable interface and date. No credentials/paywall access was used.

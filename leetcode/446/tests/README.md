Run from the repository root using the already running preview (default http://127.0.0.1:18770):

```sh
python3 -B leetcode/446/tests/check.py
node leetcode/446/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 446 --validate-only
```

To rerun without modifying frozen candidate evidence:

```sh
OUTPUT_DIR=/tmp/lesson-446-review python3 -B leetcode/446/tests/check.py
OUTPUT_DIR=/tmp/lesson-446-review node leetcode/446/tests/browser.cjs
```

The Node check consumes oracle-fixtures.json emitted by the Python check in that same directory. NODE_PATH supplies Playwright; PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is respected if set. PREVIEW_URL optionally changes the preview origin; no server is started. The offline-file test still uses the real local candidate.

The independent numerical oracle enumerates position subsets and tests their adjacent differences. It does not use the DP recurrence. Intermediate canonical states are observed with sys.settrace on the unmodified solution.py; grouping complete index subsets by final two positions provides their independent expected counts. All 363 arrays of lengths 1..5 over {-1,0,1} provide exhaustive simulation/canonical state checks. Final Python results are exhaustive through length 7, with further seeded, official, wide-value, closed-form and length-1000 cases.

browser.cjs executes Chromium, compares rendered dictionaries to independent enumeration, exercises both locales and all presets, full next/back/reset/end paths, range keyboard endpoints, explicit prediction/reveal/change, language preservation, clipboard success and denial, displayed/copied/downloaded exact source, blocked storage, offline file opening, deep anchors, widths 320/390/736/1440, 200% CSS rendered zoom at width640, focus and forced colors. Contrast is calculated from actual computed foreground/background pairs. Source equality means copied/downloaded bytes are the same canonical program exercised by check.py; no LeetCode submission is made.

Screenshots need human visual inspection; their existence alone is not a pass. See SELF-CHECK.md for author observations and limits. All checks remain author self-checks, not independent lesson acceptance.

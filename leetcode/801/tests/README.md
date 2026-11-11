# Reproduce the author self-check

From the repository root, with the existing preview serving this checkout:

```sh
export OUTPUT_DIR=/tmp/lesson-801-review
python3 -B leetcode/801/tests/test_solution.py
node leetcode/801/tests/test_core.cjs
node leetcode/801/tests/test_browser.cjs
node leetcode/801/tests/test_access.cjs
python3 -B scripts/register_leetcode_lesson.py 801 --validate-only
# Optional: record a new receipt in OUTPUT_DIR without changing the candidate
python3 -B leetcode/801/tests/freeze_candidate.py
```

Use the environment's NODE_PATH for Playwright and Acorn. All browser runners honor PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH; PREVIEW_ROOT optionally changes only the origin (default http://127.0.0.1:18770). No service is started. OUTPUT_DIR must be the same for Python and core checks because Python emits independently enumerated prefix expectations consumed by the core test. Each script which writes evidence honors OUTPUT_DIR; the output directory can be separate from the candidate.

Python tests enumerate every pair of length 2..4 over values 0..3, execute all feasible cases, then check 500 reproducible solvable random inputs, official fixtures, equality, values 0/200000, nonmutation, exact offline source, and maximum n=100000 patterns. The JavaScript core is checked at every prefix against mask enumeration, not against its own recurrence. Acorn inspects raw localization object keys before evaluation and a deliberately duplicated-key fixture proves detection.

Browser checks cover both locales, 16 hand masks, all five presets, all adjacent rewind/replay snapshots, endpoints/reset, every prediction/reveal/change path, locale preservation, source DOM/copy/download parity, actual host-native manual fallback copies with a separately verified sentinel on each attempt, blocked storage, file:// offline source, forced colors/reduced motion, 320/390/736/1440 widths, native Chrome 200% tab zoom, keyboard/focus/deep links, select text budgets and contrast calibration. The test-only extension supplies native tab zoom; it is not a runtime lesson asset.

The main browser result separates an existing #10 destination's missing /favicon.ico from #801 runtime errors. Its exact location/page is retained rather than repaired outside ownership. Every other console or response error is a failure. The source is not submitted to LeetCode. No independent teaching review or novice outcome is claimed.

## Focused workflow-copy repair (801-COPY-R1)

From the repository root:

```sh
python3 -B leetcode/801/tests/test_copy_repair.py
OUTPUT_DIR=leetcode/801/tests/evidence/copy-r1/after node leetcode/801/tests/test_copy_repair.cjs
# Existing browser suite; includes exact success/fallback clipboard and download checks:
OUTPUT_DIR=leetcode/801/tests/evidence/copy-r1/after node leetcode/801/tests/test_browser.cjs
python3 -B scripts/register_leetcode_lesson.py 801 --validate-only
OUTPUT_DIR=leetcode/801/tests/evidence/copy-r1 python3 -B leetcode/801/tests/freeze_candidate.py
```

The retained `copy-r1/before/` result is the intentional pre-fix browser failure.
Do not overwrite it on reproduction. New receipts live under `copy-r1/` and do
not replace the original candidate or its self-check evidence. Broad numerical
suites are unnecessary for this copy-only diff; the focused Python check executes
five official/fresh/equality fixtures and verifies the protected bytes and exact
allowlisted HTML/copy diff.

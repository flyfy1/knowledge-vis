# Reproduce author checks

Run from the repository root. Use the already-running preview server; these tests
do not start a service, register a lesson, or change files outside 749.

```bash
export LESSON_OUTPUT_DIR=/tmp/lesson-749-review
python3 -B leetcode/749/tests/check.py
node leetcode/749/tests/core.cjs
node leetcode/749/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 749 --validate-only
```

`check.py` writes independent explicit-wall oracle fixtures, then `core.cjs` checks
all simulated phases against them. The browser test uses the installed Playwright
through NODE_PATH and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH if set. Optional
LESSON_PREVIEW_ROOT replaces http://127.0.0.1:18770. The default output directory
is tests/evidence/self-check; set LESSON_OUTPUT_DIR to keep the candidate frozen.
Native fallback copy uses the browser-host shortcut: Linux Control+C here.
The copy test seeds a non-source clipboard sentinel, rejects writeText, selects
the complete source, dispatches native copy and reads the actual clipboard back.
No whitespace/newline normalization is allowed.

All 1092 inputs are final-result checks against an independent oracle; 843 satisfy
the unique-largest-region condition at every active day. The other 249 are
explicitly labeled out-of-contract tie extensions using stable scan order. Small
binary grids include all 512 3×3 cases; seeded inputs use seed 749. Max-size 50×50
all-zero, all-one and one-hole boards test legal dimension boundaries separately.
Core checks 6045 complete phase snapshots, regions, target sets, wall edges and
wall totals; snapshot independence is tested by mutation. The actual displayed
baseline Python snippet is executed and checked against oracle region summaries.
Browser checks all presets in both locales, deep links, disabled endpoints,
replay/reset, selection/reveal/change, state retention, clipboard paths,
source/download bytes, offline source, denied storage, keyboard and forced colors.
Screenshots cover 320/390/736/1440 and CSS 200% zoom at a 780px viewport. Headless
Linux tests are not claims about physical devices or browser-menu zoom.

No independent review, actual novice teach-back, LeetCode submission, or release
acceptance is asserted. See SELF-CHECK.md for the frozen candidate’s results.

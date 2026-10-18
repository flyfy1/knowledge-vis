# Author checks (independent lesson review remains pending)

From the repository root:

```sh
python3 -B leetcode/135/tests/test_solution.py
node leetcode/135/tests/test_core.cjs
node leetcode/135/tests/browser.cjs
node leetcode/135/tests/visual-states.cjs
python3 -B scripts/register_leetcode_lesson.py 135 --validate-only
```

No service is started. Browser checks use the existing preview root
http://127.0.0.1:18783; override it with LESSON_PREVIEW_ROOT. Playwright is loaded
through the existing NODE_PATH, and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is honored.
Every test that writes evidence accepts LESSON_TEST_OUTPUT_DIR (absolute or cwd
relative). For reviewer reruns set it to a directory outside this frozen lesson;
otherwise the author default is tests/evidence/. No test imports or edits shared
registries. `build_page.py` is an optional local markup builder, not a test and
not required for reruns; its sole output is this lesson's index.html.

Python: exhaustive allocations (all 1..n counts for n≤5) independently find the
minimum for every ratings array over 0..2; a separate rating-ordered constraint
oracle checks seeded arrays, plus actual original-interface and maximum cases.
JS: all arrays of length1..6 over0..2 plus presets; inspect each frame using
contiguous chains, independent from recurrence-based code.
Browser: every forward/back state against tested core; endpoints, presets, edit,
scrub, independent prediction states and language combinations, clipboard and
manual fallback, exact source/display/copy/download, blocked storage, file opening,
links, local requests, real keyboard and focus, forced colors, computed contrast,
320/390/736/1440, and 200% CSS zoom. CSS zoom is explicitly recorded, rather than
claimed as a physical-device or browser-chrome zoom test.

Screenshots must be inspected by the author and by the separate reviewer.
No actual learner results, LeetCode submission acceptance, production deployment,
or independent review is inferred from these checks.

Focused element captures hide only the sticky navigation during capture to avoid
a screenshot overlay; the real sticky navigation and anchor geometry are tested
with normal styles. Full-page captures begin at scroll position zero. Supplemental
visual-states.cjs captures R[1] becoming3 while C remains unknown in both locales.

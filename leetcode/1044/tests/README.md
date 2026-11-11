# Author checks

Run from the repository root using the existing preview service:

```
python3 -B leetcode/1044/tests/test_solution.py
node leetcode/1044/tests/test_core.cjs
node leetcode/1044/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 1044 --validate-only
```

All result/screenshot writers accept `OUTPUT_DIR=/absolute/reviewer/output` so a reviewer can rerun without altering the candidate. Browser additionally accepts `PREVIEW_ROOT`, uses installed packages through `NODE_PATH`, and honors `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. No server is started. Default output is this folder's evidence directory. The browser host determines the native copy shortcut; each fallback attempt verifies a fresh clipboard sentinel first. Browser tests require clipboard read/write permissions on localhost.

Python runs the canonical callable, exhaustive binary strings through length 8 and ternary strings through length 6, 600 seeded strings, examples, boundaries, three maximum-sized closed-form cases, the displayed brute-force baseline, and intermediate rank/LCP invariants via tracing. The oracle groups all windows by length, independently of suffix ordering. Core tests use independent direct string sorting/LCP and window enumeration, and parse copy.js with Acorn to detect duplicate keys before JavaScript overwrites them.

Browser checks are author self-checks, not independent review or observed learner results. Screenshots test Chromium on Linux at 320/390/736/1440 CSS-pixel viewports and 100%/200% CSS magnification. This is real rendered-browser zoom/reflow coverage, not physical-device or native browser-toolbar zoom evidence. Full-page captures establish composition; focused table screenshots establish readable values and retained row identifiers under horizontal scrolling. See SELF-CHECK.md for inspected screenshots and known limits.

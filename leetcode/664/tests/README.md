# Reproduce the author self-check

Run from the repository root with the available NODE_PATH and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH environment variables. Use the already-running preview server. Every test that writes evidence honors OUTPUT_DIR; use an absolute directory to rerun without changing the candidate.

```bash
export OUTPUT_DIR=/absolute/path/to/reviewer-output
python3 -B leetcode/664/tests/check.py
node leetcode/664/tests/core.cjs
node leetcode/664/tests/browser.cjs
python3 -B leetcode/664/tests/source-check.py
node leetcode/664/tests/zoom.cjs
python3 -B scripts/register_leetcode_lesson.py 664 --validate-only
```

Order matters: check.py writes the independent BFS expectations consumed by core.cjs; browser.cjs captures the displayed baseline consumed by source-check.py. browser.cjs accepts PREVIEW_URL. zoom.cjs intentionally targets the given localhost origin; its test-only extension sets actual Chromium page zoom to 2. It creates and removes a private test profile inside OUTPUT_DIR, never using the user's browser profile. All browser processes close after checks.

The BFS oracle enumerates actual blank/letter boards and legal overwrites, independently of interval DP. The additional split recurrence is cross-validated against that BFS, then used for seeded longer cases. The Python callable is executed directly. core.cjs checks intermediate dependencies, candidate costs, best values, final values, original-source embedding, and duplicate translation keys before parsing can hide them. Browser checks cover both locales, all seven presets and each trace frame, endpoint and rewind behavior, prediction/reveal/change, clipboard API and keyboard manual fallback, download bytes, source disclosure preservation, denied storage, keyboard focus, forced colors, reduced motion, 320/390/1280 widths, selected-label measurement, local-only requests, screenshots and computed contrast.

CSS zoom screenshots are supplemental. browser-zoom200-{en,zh}.png are actual Chromium 200% page zoom, captured through CDP to avoid Playwright's full-page screenshot coordinate mismatch at real browser zoom. The visible table is positioned instantly before capture; the script independently verifies devicePixelRatio=2, innerWidth=640, and absence of CSS zoom in a 1280px window.

These are author self-checks. They establish neither independent teaching acceptance, a real-device/assistive-technology study, LeetCode acceptance, nor public deployment.

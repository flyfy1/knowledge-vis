# Reproduce author self-checks

Run from repository root. Keep the existing preview service; no service startup is needed.

```
python3 -B leetcode/995/tests/test_solution.py
node leetcode/995/tests/test_core.cjs
node leetcode/995/tests/browser.cjs
node leetcode/995/tests/visual.cjs
python3 -B leetcode/995/tests/make_sheets.py
python3 -B scripts/register_leetcode_lesson.py 995 --validate-only
```

All emitting tests accept `EVIDENCE_DIR=/absolute/reviewer/output`, so reviewers can rerun without changing candidate artifacts. Browser optionally accepts PREVIEW_URL (default http://127.0.0.1:18798/leetcode/995/). Uses installed Playwright via NODE_PATH; honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Linux browser host uses Control+C for actual fallback copying. Clipboard tests reset and verify a distinct sentinel before each locale's fallback attempt, then inspect the actual native transfer, including final newline. Source mirror/render/copy/download must exactly match solution.py.

Numerical oracle: graph BFS from all1 through all legal whole-array flip masks; no greedy/parity decisions. Tests original Python callable, baseline, immutability, exhaustive/seeded/max inputs. JS simulation tested separately, with explicit intermediate prefix/parity/expiry/raw values. Browser tests both languages, every preset and endpoint, full rewind/replay, hand steps, fresh prediction/change, locale preservation, keyboard and focus, actual clipboard/fallback, downloads, 320/390/736/1440 widths at100/200% CSS zoom, table keyboard scroll, forced colors/reduced motion, offline and denied storage, local assets and contrast. CSS zoom supplies layout stress, not physical-device or OS zoom evidence. Visual screenshot inspection is a separate author activity recorded in SELF-CHECK.md.

These are author self-checks, not independent review, learner results, public delivery verification or LeetCode acceptance.

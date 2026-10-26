# #952 — author self-check, candidate 4

Status: complete author candidate, ready for a separate independent review. Author: Codex; precise model identifier unavailable. Reviewer/run: pending. No independent acceptance, novice comprehension result, LeetCode submission result, registration, deployment or public delivery is claimed.

The official public GraphQL capture is `provenance/official.json`, with request, access timestamp, complete statement/examples/constraints, and observed language stubs. Python3 explicitly offers `Solution.largestComponentSize(self, nums: list[int]) -> int`. The lesson uses that interface and leaves the input unchanged.

## Reproduce from the repository root

```bash
python3 -B leetcode/952/tests/test_solution.py
node leetcode/952/tests/test_core.cjs
node leetcode/952/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 952 --validate-only
```

The browser uses the existing `http://127.0.0.1:18770` preview; it starts no service. Node uses installed Playwright/acorn via NODE_PATH, and Chromium uses PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when set. All tests emitting artifacts accept OUTPUT_DIR. For a separate rerun, use the same chosen output directory for the Python and core commands, since Python writes the independently derived random corpus consumed by the core test:

```bash
OUTPUT_DIR=leetcode/952/tests/evidence/repro python3 -B leetcode/952/tests/test_solution.py
OUTPUT_DIR=leetcode/952/tests/evidence/repro node leetcode/952/tests/test_core.cjs
OUTPUT_DIR=leetcode/952/tests/evidence/reviewer node leetcode/952/tests/browser.cjs
```

The first two override commands were actually executed successfully. A reviewer should choose a new output directory and retain this frozen evidence. Browser artifacts also support that override; the author browser run used its default evidence directory.

## Observed results

- Python: 17,196 cases passed. All 16,383 nonempty subsets of 1..14; 800 random arrays with seed 952; all official examples (4,2,8); fresh prediction (3); prime powers, 1, isolated nodes, 100,000 value boundary, and two 20,000-node closed-form cases. The independent oracle builds the pairwise gcd graph and traverses components. Input mutation checks passed. Details: `tests/evidence/python-results.json`; output-directory rerun in `tests/evidence/repro/`.
- Browser numerical core: 4,183 input cases and 36,858 frames passed. Independent divisibility/prime enumeration checks factors; a separate graph traversal reconstructs every processed-association partition and the final full gcd graph. Owner-first-index, component coverage, membership count and no-mutation checks passed. Canonical source mirror exact, all 80 bilingual key pairs have two strings, duplicate-key AST check passed. Details: `tests/evidence/core-results.json` and rerun counterpart.
- Chromium: 14 preset × locale paths, every intermediate frame and rewind/replay, start/end/reset/preset change, same-root redundant union, all prediction options and reveal/change, preserved prediction when changing trace preset, locale after interaction with focus retained, source disclosure preserved, and both locale feedback meanings checked. Result: `tests/evidence/browser-results.json`.
- Layout: EN/ZH at 320, 390, 736, 1440; 200% CSS zoom at 320, 390, 1280; no document overflow, normal-width controls at least 48px, every preset label fits its closed select with the original 24px arrow reserve at normal 320 and all zoom widths. Owner table intentionally scrolls at very narrow effective widths, tested with keyboard ArrowRight. Native controls and text reflow rather than shrink fonts.
- Source: embedded, rendered textContent, successful clipboard transfer, fallback textarea and actual host copy shortcut, and downloaded bytes equal solution.py exactly including final newline. Four fallback attempts (twice per locale) each first seed/read a fresh unique non-source sentinel; Linux Control+C then transfers the selected source and readback equals canonical source. No newline conversion observed. Fallback copy is distinct from algorithm feedback.
- Accessibility/runtime: Enter activates next/reset; focus is 3px with measured contrast above 3:1; radio labels provide the 48px target; forced-colors screenshot, reduced-motion context, blocked localStorage and file:// offline initialization/source passed. Related links to #803/#step2 and #924/#step2 were followed by keyboard in both languages; each target exists. All five local deep links passed sticky-nav geometry checks. No page errors or asset HTTP errors; preview resource requests stayed on the local origin.
- Measured contrast: body 16.09:1, hint 7.74:1, primary action 13.10:1, disabled action 6.45:1, group value 10.91:1, current history 9.81:1. Exact RGB pairs are in browser-results.json. Combined shared/local shipped CSS is 11,255 bytes, below 25,000.
- Safe preflight: `python3 -B scripts/register_leetcode_lesson.py 952 --validate-only` passed with exit 0, no stdout/stderr. Exact command/cwd/timestamp recorded in `tests/evidence/preflight.json`. No registration was run. Complexity is one nonempty string covering time and space.

## Visual inspection and author corrections

Actually opened headless screenshots through the image viewer: EN 320 intermediate; ZH 320 intermediate; EN/ZH 390 complete traces; EN 1440 page; ZH prediction; EN manual-copy fallback; EN 320 and ZH 390 focused 200% views; EN 390 and ZH 320 zoomed headings. Values, component labels, owners and applied history remain readable and associated. At 200% × 320, group values and button text wrap; owner tables use deliberate contained scrolling. Long element captures can include the sticky navigation at a capture-dependent position; focused viewport captures show the group below it. That capture artifact is not treated as data overlap.

Retained draft failures and repairs are in `tests/evidence/author-fixes.md`: inherited nonwrapping official link caused real document overflow, fixed locally; long zoomed select labels were shortened with a descriptive adjacent guide. Expanding the guard to all zoom presets later caught conservative desktop native-select width budgets. The retained c3 Square screenshot was visually inspected and shows the full label; the failed budget alone did not prove visible clipping. Candidate 4 adds minimum width while retaining the original guard. The full browser suite then passed. No independent finding has been closed by these author checks.

Limits: these are author computational/browser observations on headless Linux Chromium and synthetic viewport/zoom settings. Physical mobile devices, other browser engines/platform fonts, production delivery, actual novice teach-back and independent teaching acceptance remain unverified. Separate review is the next required workflow step. Shared collection/concept-map updates are outside this author run's ownership.

Candidate identity: `tests/evidence/candidate-manifest.json` binds final source, metadata, tests, provenance and evidence hashes, plus shared asset hashes and base commit. Initial draft evidence is explicitly historical, not the final rendered candidate.

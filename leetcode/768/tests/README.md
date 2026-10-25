# Reproduce the author self-check

Run from the repository root. The preview is already running; do not start a service.

```bash
OUTPUT_DIR=/tmp/leetcode-768-review python3 -B leetcode/768/tests/test_solution.py
OUTPUT_DIR=/tmp/leetcode-768-review node leetcode/768/tests/test_core.cjs
OUTPUT_DIR=/tmp/leetcode-768-review node leetcode/768/tests/test_browser.cjs
OUTPUT_DIR=/tmp/leetcode-768-review node leetcode/768/tests/test_access.cjs
python3 -B scripts/register_leetcode_lesson.py 768 --validate-only
```

Use the environment's NODE_PATH for Playwright. Both browser runners respect PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH and PREVIEW_ROOT (default http://127.0.0.1:18770). All result/screenshot generators accept OUTPUT_DIR; set it to keep the frozen evidence unchanged. No dependency installation required. Tests use local Chromium and Linux Control+C (Meta+C if actually hosted on macOS). The test-only extension invokes native Chrome tab zoom, and is never loaded by the lesson.

`test_solution.py` executes the canonical official Python callable and actual displayed baseline against an independent all-partition, sort-and-concatenate oracle, checks no input mutation, maximum constraints, and traces real canonical local variables at comparisons. A sorted-prefix equality oracle checks a maximum-length random case independently of the max/min rule. `test_core.cjs` uses its own all-partition enumerator, checks every snapshot's extrema, cut decisions, counts and deep-copy independence, plus dictionary pair/placeholder shape. Key uniqueness is checked before executing the copy dictionary by the Python test.

`test_browser.cjs` checks all presets and hand partitions, every forward/back state, reset/endpoints, both locales, every quiz choice/reveal/change/reset, locale preservation, successful clipboard and denied automatic clipboard with actual native keyboard-copy readback after a distinct sentinel, exact displayed/downloaded source, 320/390/736/1440 widths, 200% browser zoom, keyboard focus/navigation, blocked storage, forced colors, reduced motion, file:// offline source and network/console errors. It calibrates its actual contrast helper against black/white, primaries and the 4.5 threshold near miss, then records shared solid-color pairs and rendered computed styles. `test_access.cjs` verifies actual related-link activation and destination concepts, source-bound target identity, actual DOM suffix values, repaired narrow links, and native 200% zoom with a 320px usable viewport.

`build_candidate.py` deliberately regenerates only python-code.js from solution.py. Do not run it during a frozen review unless preparing a new candidate. Canonical source parity is tested without normalizing any whitespace, including the final newline.

Evidence is author evidence, not an independent review or measured learner result. See SELF-CHECK.md and evidence/candidate.json for the frozen candidate identity.

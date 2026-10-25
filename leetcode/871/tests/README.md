# Reproduce author checks

From the repository root (preview already running on port 18770):

```sh
OUTPUT_DIR=/tmp/refuel-871-evidence python3 -B leetcode/871/tests/test_solution.py
OUTPUT_DIR=/tmp/refuel-871-evidence node leetcode/871/tests/test_core.cjs
OUTPUT_DIR=/tmp/refuel-871-evidence node leetcode/871/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 871 --validate-only
```

The Node tools use the available NODE_PATH packages (playwright and acorn).
The browser launch uses PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH when provided.
Browser native clipboard checks require clipboard permissions; Linux host uses
Control+C. Each fallback attempt verifies a distinct non-source sentinel first.
No persistent server is created, no registration is performed.

Without OUTPUT_DIR, artifacts go to tests/evidence. Reruns can use an external
output directory without modifying the frozen candidate. Screenshots require
human visual inspection; a passing script is not that inspection. The archived
self-check records the author's inspection, not independent acceptance.

Python: 12,140 exhaustive/seeded small cases; actual rendered baseline, a separate
physical-tank subset oracle, and stop-count DP. Eight fixed/large cases cover all
three official examples, the transfer case, 500 stops and 10^9 boundaries.
Core: every snapshot's reach equation, admission and choice semantics, pool
partition, largest eligible choice, deterministic immutable snapshots and a legal
physical reconstruction. Mirror exactness and AST duplicate-key checks included.
Browser: bilingual controls and state preservation, presets, rewind/replay,
endpoints, prediction/reveal/change, exact display/copy/download and native
fallback copy, 320/390/736/1440 widths, 200% CSS page magnification, focus,
reduced motion/forced colors, related links, denied storage and offline file open.
Native browser chrome zoom, physical devices, LeetCode submission and actual
learner outcomes are not established by these checks.

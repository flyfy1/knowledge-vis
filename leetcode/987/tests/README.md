# Reproduce author checks

Run from repository root. All result-producing tests accept `EVIDENCE_DIR` so a reviewer can keep the candidate frozen. Browser defaults to the already-running preview; override `PREVIEW_URL` if needed. No test starts a server or registers the lesson.

```bash
EVIDENCE_DIR=/tmp/leetcode-987-review python3 -B leetcode/987/tests/test_solution.py
EVIDENCE_DIR=/tmp/leetcode-987-review node leetcode/987/tests/test_core.cjs
EVIDENCE_DIR=/tmp/leetcode-987-review node leetcode/987/tests/browser.cjs
EVIDENCE_DIR=/tmp/leetcode-987-review node leetcode/987/tests/accessibility.cjs
EVIDENCE_DIR=/tmp/leetcode-987-review python3 -B leetcode/987/tests/make_sheets.py
python3 -B scripts/register_leetcode_lesson.py 987 --validate-only
```

`NODE_PATH` must expose the installed Playwright package. The browser runner uses `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when set. Linux uses Control+C for actual fallback copying; macOS uses Meta+C. Each locale's fallback begins with a fresh distinct verified native-clipboard sentinel. Source equality includes the final newline. Browser zoom checks use CSS body zoom=2 as a reproducible headless 200% content-zoom test, not a claim of physical device/browser chrome zoom coverage.

Python executes the exact canonical callable with a judge-equivalent TreeNode supplied by the harness. The independent oracle uses breadth-first per-row value buckets rather than sorted coordinate triples. It checks all ordered binary shapes up to six nodes with every binary-valued assignment, seeded trees, official examples, full-depth chains, multiplicity and input identity/links. The JS test independently reads serialized levels, checks final groups and intermediate collection/sorting invariants and snapshot independence, and checks copy-key uniqueness and exact mirror bytes.

Browser evidence exercises both locales, all presets, every forward/backward endpoint, replay, reset, swapping the counterexample, every prediction answer/reveal/change, locale preservation, exact source/copy/native fallback/download transfer, keyboard activation, focus/forced-colors/reduced motion, guarded storage, offline/file opening, local requests, related anchors, control sizes, contrast, selected-label budgets and 320/390/736/1440 widths at zoom1/2. Screenshots require human visual inspection in addition to assertions.

These are author self-checks. Independent teaching review, real novice learning, physical-device testing, accepted LeetCode submission and public deployment remain unverified.

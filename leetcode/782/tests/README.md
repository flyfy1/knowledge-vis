# Reproducing the author checks

From the repository root, use the already-running preview at http://127.0.0.1:18770.
Dependencies: Python 3; Node with Playwright and acorn from NODE_PATH. No installs,
registration, deployment, services, or LeetCode submission are performed.

```bash
OUTPUT_DIR=/tmp/782-review python3 -B leetcode/782/tests/check.py
OUTPUT_DIR=/tmp/782-review node leetcode/782/tests/core.cjs
OUTPUT_DIR=/tmp/782-review node leetcode/782/tests/browser.cjs
OUTPUT_DIR=/tmp/782-review node leetcode/782/tests/focused.cjs
python3 -B scripts/register_leetcode_lesson.py 782 --validate-only
```

All test-created results/screenshots go to OUTPUT_DIR (default tests/evidence).
Run check.py before core.cjs because the latter consumes independently computed
fixtures.json from that output directory. PREVIEW_ROOT may override the preview
origin; PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is honored when set.
Browser host is local Linux; native fallback copy uses Control+C. Each fallback
attempt seeds and reads a distinct sentinel before disabling automatic writes,
then uses the actual textarea selection and host keyboard copy into the clipboard.
No source is injected into the clipboard by the test during fallback transfer.

The submission is executed as Solution().movesToChessboard(board). The Python
oracle uses both legal-swap BFS and permutation enumeration for every 2×2 and
3×3 input; seeded 4×4/5×5 enumeration and explicit n=29/30 cases supplement it.
The JavaScript simulation is checked separately against those fixtures, including
all row checks, targets, witness swaps, move totals and snapshot isolation.
Bilingual dictionary keys are checked in the acorn AST before evaluation.

Author evidence only. Actual novice learning, independent review, LeetCode
acceptance, real-device browsers, other operating systems/fonts, and public
deployment are not established by these checks.

For the 782-MAC-FIT-01 repair, also run:

```bash
OUTPUT_DIR=leetcode/782/tests/evidence/repair-20261025/green node leetcode/782/tests/selected-label.cjs
```

This checks all seven labels at 320px through EN→ZH→EN using the original
`textWidth + padding + 20 <= clientWidth` predicate, captures the failure-preset
control, and locks the dispatcher-approved English wording. The saved `red/`
run fails the wording assertion on the old candidate; Linux fits the old text,
so that local failure is not a reproduction of Mac clipping. Original Mac red
evidence remains in specs/reviews unchanged. All original suites are retained.

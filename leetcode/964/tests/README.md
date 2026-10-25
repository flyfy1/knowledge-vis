# Reproduce author checks

From the repository root (Python 3, Node, Playwright and acorn available via the existing NODE_PATH):

```bash
EVIDENCE_DIR=/tmp/964-author-check python3 -B leetcode/964/tests/check.py
EVIDENCE_DIR=/tmp/964-author-browser node leetcode/964/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 964 --validate-only
```

The browser runner uses the already-running http://127.0.0.1:18790 preview and honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. It launches no service. Screenshots/reports/downloads use EVIDENCE_DIR; there is no write to the candidate when redirected. Zoom cases use Chromium CSS page zoom 2 to exercise effective layout size; this is synthetic zoom, not a physical device test. Clipboards are tested on the browser's Linux host using Control+C, not a mobile-emulated shortcut. Each fallback attempt starts with a fresh verified sentinel. Automatic clipboard success is instrumented; fallback transfers use the actual host clipboard. Contrast calculations support the solid backgrounds used here and are calibrated against black, white, primaries and a near-AA gray.

check.py executes solution.py through the official Solution.leastOpsExpressTarget interface. Its independent nearest-power recursion does not use digit-state transitions. Exact rational enumeration covers every operator string through length5 for four bases and records the first occurrence of each positive integer. Independent signed-coefficient enumeration checks the browser model's intermediate costs; large cases are compared through the independent recursive oracle. Seed964 is deterministic. Copy dictionary AST checks reject duplicate keys before evaluation, then check two-string pair shape.

These are author self-checks. Independent cold review, real novice teach-back, actual LeetCode submission, real devices and public deployment are not established.

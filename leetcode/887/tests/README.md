# Reproduce the author checks

Run from repository root, using the already running preview (no service started):

```bash
python3 -B leetcode/887/tests/check.py
node leetcode/887/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 887 --validate-only
```

The browser runner uses `NODE_PATH` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` supplied by the environment. Both test runners accept `EVIDENCE_DIR`; use the same directory for both because Python writes the independent oracle fixtures consumed by the browser runner. Example without altering the frozen evidence:

```bash
EVIDENCE_DIR=/tmp/egg887-review python3 -B leetcode/887/tests/check.py
EVIDENCE_DIR=/tmp/egg887-review node leetcode/887/tests/browser.cjs
```

`PREVIEW_ROOT` can override http://127.0.0.1:18770. The canonical Python callable is executed directly; the independent baseline enumerates floor choices, while the browser core's intermediate capacities are checked against binomial sums. Tests do not submit to LeetCode. Tests use a fixed seed. Browser context grants clipboard permissions, then deliberately denies automatic writes for the fallback test. A fresh verified sentinel precedes each locale's real Control+C transfer on the observed Linux host (Meta+C adapter exists for macOS). Source comparisons preserve the final newline.

Screenshots cover both locales at 320/390/736/1440, CSS zoom factors 1 and 2. This is a real Chromium layout/accessibility stress test, not proof of a physical phone or browser-chrome zoom setting. The runner records the mechanism explicitly. Reduced motion makes repeated screenshots deterministic; forced colors and keyboard focus are exercised separately. Native selector measurements use the actual computed font, 20px arrow allowance, and selected text plus padding. Exact resolved font identity is not inferred from the CSS font stack.

`evidence/SELF-CHECK.md` identifies inspected screenshots and evidence limits. `evidence/candidate-sha256.json` freezes runtime, source, metadata, brief, tests and official capture hashes, and binds shared policy/assets by their hashes without changing them. Neither test execution nor an independent mathematical oracle is an independent lesson review.

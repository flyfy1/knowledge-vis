# Reproduce author checks

Run from the repository root with Python 3 and Node. Browser dependencies resolve
through the supplied NODE_PATH; Chromium uses PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
when present. Use the already-running preview; no server is started by these tests.

```bash
OUTPUT_DIR=/tmp/lesson829-check python3 -B leetcode/829/tests/test_solution.py
OUTPUT_DIR=/tmp/lesson829-check node leetcode/829/tests/test_core.cjs
OUTPUT_DIR=/tmp/lesson829-check node leetcode/829/tests/browser.cjs
OUTPUT_DIR=/tmp/lesson829-check node leetcode/829/tests/state-audit.cjs
python3 -B scripts/register_leetcode_lesson.py 829 --validate-only
```

PREVIEW_ROOT optionally overrides http://127.0.0.1:18770. All result-producing tests
honor OUTPUT_DIR. `build_html.py` is a lesson-local authoring helper, not a check;
it rewrites this lesson's index.html only and is unnecessary for verification.

- Python: exact official Solution method executed against start-and-grow oracle
  for all n=1..1000, independently factored odd-divisor counts for 290 large /
  boundary cases, intermediate invariants, exact displayed baseline for n=1..100.
- Core: every frame for n=1..1000; independently enumerate sums, check the count
  boundary, candidate/start identity, stop guard, snapshot isolation, mirror
  bytes and localization AST duplicate keys, pair shape and placeholders.
- Browser: every preset in both locales, all frames and backward/replay/end/reset,
  independent small oracle, formulas, labels, all prediction choices, changing an
  answer after reveal, cross-locale state preservation, separate experiments,
  source render/download/copy equality, clipboard-denied fallback (two attempts
  per locale, distinct fresh sentinel and native Linux Control+C readback),
  keyboard focus/Tab, forced colors, reduced motion, blocked storage, offline
  source/trace, local requests, links and actual related anchor navigation.
  Layouts at 320/390/736/1440, plus CSS 200% zoom at 320/390/1440 in both locales.
- Supplemental state audit: contrast of actual disabled initial/terminal primary
  controls and correct/incorrect feedback; every navigation active state in both
  locales; stable screenshot captures after scrolling to the header.

`evidence/official-graphql.json` is raw public official statement/interface
verification. It is review material, never loaded by the page. `candidate.json`
binds runtime and metadata bytes; `SELF-CHECK.md` records the author's visual
inspection and limits. Historical browser initial/second failures remain named
as failures; final browser-results.json belongs to candidate 829-r5.

These checks are author evidence, not independent review, actual learner results,
LeetCode acceptance, or deployment evidence. CSS zoom is tested; native browser
chrome zoom and real devices are not claimed. To preserve the frozen candidate,
reviewers should redirect output into a separate directory as above.

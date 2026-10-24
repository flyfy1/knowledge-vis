# Author self-check evidence

- Official capture: `tests/evidence/official-page.txt` and `official-interface.txt` (2026-10-24).
- Canonical Python: `tests/test_solution.py` checks fixed examples, leading-zero boundaries, empty-result case, and seeded random strings against an independently written enumerating oracle. Result: passed (8 fixed + 400 random cases).
- Source parity: `tests/test_parity.py` confirms `python-code.js` JSON source equals `solution.py`. Result: passed.
- Metadata preflight: `python3 -B scripts/register_leetcode_lesson.py 282 --validate-only` exited 0.
- Browser evidence: `tests/evidence/browser-390.png` captured from the already-running preview URL with Chromium headless at 390×900 and visually inspected. The page renders the bilingual header and horizontal step navigation without console output from the load command.
- The repository lacked a resolvable Playwright Node package, so the scripted Playwright interaction was not runnable in this environment; this is an author-environment limitation, not an independent review. No LeetCode submission or acceptance is claimed.

## Revision self-check — L282-DERIVATION-001

- Fix mapping: added `s1derivation` in `copy.js` and rendered it immediately after the step-02 backtracking explanation in `index.html`. Both locales now hand-count `105`: 4² = 16 raw join/operator paths, three `05` leading-zero paths pruned, 13 legal paths; they then connect repeated prefix parsing to the maintained `index`, `value`, and signed `last` fields.
- Cost correction: `lesson-entry.json`, the header badge, BRIEF, and step-05 copy now consistently state `O(n·4^n) time; O(n) recursion auxiliary space, plus output space`, matching the four choices per gap and the expression-building work.
- Feedback loop before the fix: a deterministic Python content assertion reported `{'baseline_count': False, 'avoided_reparse': False, 'complexity_bridge': False}`. After the fix, the derivation assertion passed and `node --check leetcode/282/copy.js` passed.
- Regression: `python3 leetcode/282/tests/test_solution.py` → `282 canonical/oracle checks passed: 8 fixed + random cases`; `python3 leetcode/282/tests/test_parity.py` → `embedded/download source parity passed`.
- Required metadata gate: from repository root, `python3 -B scripts/register_leetcode_lesson.py 282 --validate-only` → exit 0 with no output.
- Browser evidence with Chromium at the preview URL: both `zh` and `en` passed at 320, 390, and 1280 CSS px for locale-specific derivation text, no horizontal overflow, step navigation/reset/operator interactions, and screenshots in `tests/evidence/browser-{zh,en}-{320,390,1280}.png`. At 200% zoom, both locales kept the derivation visible and remained scrollable (`scrollWidth 466` at 390 px); no page errors occurred. The repository-provided browser script also reports a preview 404 resource error (favicon) in this environment, so the focused harness filtered that unrelated resource warning while asserting the lesson page and interactions.
- Status: `L282-DERIVATION-001` is **fixed awaiting independent re-review**; this self-check does not independently accept the lesson.

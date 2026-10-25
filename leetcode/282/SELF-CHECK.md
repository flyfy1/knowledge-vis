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

## Revision self-check — L282-COST-001

- Fix mapping: corrected `lesson-entry.json`, the step-02 derivation, the step-05 complexity paragraph, and `BRIEF.md` to state `O(n·4ⁿ)` time and `O(n²)` recursion auxiliary space for the canonical Python implementation. The explanation now ties the quadratic bound to immutable `expression + operator + token` strings retained by a deep active call chain; result-list output space remains separate.
- Failing feedback loop before the fix: a deterministic source/content assertion found `expression + ` in the canonical source while both metadata and rendered copy claimed `O(n)` auxiliary space; it exited with `AssertionError: expected pre-fix mismatch`.
- Passing content loop after the fix: the same assertion now confirms the canonical immutable concatenation is paired with `O(n²)` in `lesson-entry.json`, `copy.js`, and `BRIEF.md`; `node --check leetcode/282/copy.js` passes.
- Regression: `python3 leetcode/282/tests/test_solution.py` and `python3 leetcode/282/tests/test_parity.py` pass unchanged, confirming algorithm behavior and exact source parity.
- Required metadata gate: from repository root, `python3 -B scripts/register_leetcode_lesson.py 282 --validate-only` exits 0 with no output.
- Browser evidence: a CommonJS Playwright harness against `http://127.0.0.1:18770/leetcode/282/` checked both `zh` and `en` at 320, 390, and 1280 CSS px, asserted visible `O(n²)` cost text, exercised frame reset, operator selection, and quiz reveal, and found no page errors or horizontal overflow. Captures are in `tests/evidence/browser-{zh,en}-{320,390,1280}-cost.png`.
- Status: `L282-COST-001` is **fixed awaiting independent re-review**; this self-check does not independently accept the lesson.

## Review-4 fixes — author self-check, 2026-10-25

This is a new uncommitted candidate on base `f4ebe24d46837496b208b56197828b5eeaaf130e`.
Its exact file identity is frozen in `tests/evidence/review5/candidate-manifest.json`.
The historical report `specs/reviews/282-review-4-e7ac0d6f.md` is unchanged.
All three required findings below are **fixed awaiting independent re-review**;
this record does not close them or independently accept the lesson.

| Stable finding | Correction | Regression evidence |
| --- | --- | --- |
| L282-FORMULA-001 | `renderState` selects the +, −, or × recurrence, including actual substituted arithmetic and new signed last. | `review-browser.cjs`: in EN and zh, + gives 5+2=7,last=2; − gives 5−2=3,last=−2; × gives 5−3+3×2=8,last=6. All three formulas survive locale-after-interaction with matching before/after readouts. |
| L282-STATE-001 | Ten selected frames expose `dfs(index,expression,value,last)`, the actual slice/current token, saved parent, return/restoration, rejection and emission. Highlight follows next-slice index, with none at the end. Skipped subtrees and the incomplete answer list are explicitly labeled. Fresh `122/-3` quiz probes signed last and terminal append/return. | `test_trace.py` executes actual solution.py with `sys.settrace`, matches the snapshots in chronological order, verifies returns, legal tokens and the fresh signed-last result. Browser independently asserts hand-calculated frame tuples in both locales, both endpoints, ledger count (teaching frames only), highlight identity, keyboard replay/reset, locale preservation, all eight quiz combinations, and stale-feedback clearing. |
| L282-COPY-FALLBACK-001 | Clipboard rejection reveals and selects a labeled read-only textarea whose value is exactly the canonical source, including LF. | In both locales, actual native Ctrl+A / Ctrl+C followed by clipboard readback equals all 1,036 source bytes including final LF. Normal automatic copy, rendered textContent, served bytes, embedded/offline mirror, local-file offline display and real download bytes also equal source, without trimming. |

Feedback loop: before edits, `node leetcode/282/tests/review-regressions.cjs`
exited 1, reporting each of the three finding IDs in both locales: missing active
subtraction, missing rendered recursive state, and missing exact selectable value.
After the changes it exits 0: `required finding smoke passed`. The broader browser
regression covers actual interaction semantics rather than presence alone.

Ranked falsifiable causes used for the correction: (1) static formula binding
would persist across operator clicks, so operator-dependent formula rendering
should remove the contradiction; (2) frame data not rendered, plus ordinal-based
highlighting, would omit state even when core arithmetic is correct, so rendering
explicit call/slice/parent snapshots should restore the bridge; (3) native code
selection drops final LF, so selecting an LF-preserving textarea value should
produce exact native clipboard bytes. The browser feedback confirms these causes
and predictions. No debug instrumentation remains. An initial additional trace-test
assertion incorrectly rejected the legal whole token `105` because it searched for
the substring `05`; that test was corrected to examine individual operand tokens.

Minor review observations also addressed: mapping headings are true locale pairs
(Quantity/Python/Role or 量/Python/作用); step 01 is labeled a worked example;
maximum literal expression length is 2n−1; primary foreground/background is
`rgb(234,245,251)` on `rgb(11,82,107)`, measured **7.788:1**. Localization AST audit
checks duplicate keys before object evaluation and requires two-string pairs.
Lesson-local CSS is 3,982 characters. The canonical Python and mirror are unchanged;
no regeneration was needed. The registration script's exact pair is
`solution.py / python-code.js / PYTHON_SOURCE`. Python is the preferred faithful
interface, evidenced by existing provenance's Python3 template and menu (including
Python and TypeScript); no non-Python language exception or supportedLanguages
omission applies.

Commands run from repository root, final results:

- `python3 -B leetcode/282/tests/test_solution.py` → exit 0, eight fixed plus 400 seeded oracle cases.
- `python3 -B leetcode/282/tests/test_trace.py` → exit 0, ten real Python call/return snapshots plus fresh case.
- `python3 -B leetcode/282/tests/test_parity.py` → exit 0, exact canonical/offline mirror parity; its message now correctly scopes this test.
- `node leetcode/282/tests/review-regressions.cjs` → exit 0.
- `node leetcode/282/tests/review-browser.cjs` → exit 0. Chromium honors `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; packages resolve via NODE_PATH.
- `node --check` for app.js, copy.js and core.js → exit 0.
- **Required preflight:** `python3 -B scripts/register_leetcode_lesson.py 282 --validate-only` → **exit 0, no output**. Metadata complexity remains exactly one nonempty time-and-space string; no registration ran and no metadata repair was necessary.
- `git diff --check` → exit 0.

Browser receipts/screenshots are in `tests/evidence/review5/`. Both locales were
checked at 320, 390, 736 and 1440 CSS pixels without document overflow; trace and
formula captures were saved. Visually inspected EN 320/1440 trace, zh 320 trace,
and zh 390 formula captures: state values and expressions wrap and remain readable.
The full history at frame 10 is deliberately scrollable with the document.
Primary-action contrast, blocked storage, native keyboard controls, offline local
file display and zero page errors are recorded in `browser-results.json`.
CSS zoom at 200%/1440 passed; native browser zoom, narrow 200% reflow, physical
devices, novice comprehension and LeetCode submission remain unverified. These
checks establish author readiness for re-review, not acceptance or deployment.
No shared files, registry, reports, services, Git configuration, schedules or
credentials were changed. No child agents, commits, push or deployment were used.
Next action: independently review this frozen candidate and the affected teaching
steps against the unchanged rubric, then decide closure of the three IDs.

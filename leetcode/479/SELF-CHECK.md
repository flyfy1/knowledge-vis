# Author self-check — candidate 479-v1

Status: complete author candidate, ready for a separate independent review. This is not independent acceptance, novice teach-back, a LeetCode submission result, registration or deployment. Work is restricted to leetcode/479/. The approved shared lesson design is retained; no agents were spawned.

Official evidence: [public GraphQL capture](provenance/official.json), accessed 2026-10-25 Asia/Singapore (2026-10-24 UTC). It records the full statement, both examples, 1≤n≤8, modulo 1337, free access flag, metadata and actual language-selector templates. Python3 supplies `class Solution: def largestPalindrome(self, n: int) -> int`; Python is the preferred canonical language. Runtime assets contain none of the official capture.

Reproduce from repository root, using the existing preview:

```sh
python3 -B leetcode/479/tests/test_solution.py
node leetcode/479/tests/test_core.cjs
node leetcode/479/tests/test_browser.cjs
node leetcode/479/tests/test_reading.cjs
python3 -B scripts/register_leetcode_lesson.py 479 --validate-only
```

The Python test requires GNU coreutils `factor` (available at /usr/bin/factor). Browser tests use Playwright from the supplied NODE_PATH and honor PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. All test emitters honor LESSON_OUTPUT_DIR to keep the candidate unchanged during review. PREVIEW_ROOT optionally selects the already-running preview; default http://127.0.0.1:18770. No test starts a web service or writes outside this lesson unless an output directory is explicitly provided.

Observed results:

- `tests/evidence/numerical.json`: canonical Python executed for all n=1…8; residues 9,987,123,597,677,1218,877,475. Exhaustive unordered product-pair enumeration independently verifies n=1,2,3. For every n, GNU factorization supplies factor witnesses, and independently enumerated larger palindromes are rejected by enumerating all divisors. For n=8, witness 99990001×99999999=9999000000009999 and 9997 larger candidates rejected. Shorter digit lengths are explicitly below each tested expected maximum. This does not reuse the canonical descending-divisor search as its oracle.
- `tests/evidence/core.json`: 1000 seeded restricted-range cases against brute factor-pair enumeration, 8880 intermediate checks, mirror ordering/length/palindrome properties for lengths 1…6, the square-equality boundary, snapshot replay and all three presets. Full n=2 trace has 24 checks and eight candidates; its first success is 9009.
- `tests/evidence/browser.json`: actual Chromium at the preview, both locales, every preset, every forward/back frame, endpoints/reset/end, native slider keyboard, all prediction choices and reveal/change/locale paths, independent experiment state, copy success and denied-clipboard manual fallback, display/clipboard/download exact source equality, blocked storage, offline source mirror, all step/deep links, keyboard Enter/Tab and 3px focus, forced colors, reduced motion and long CJK/Latin wrapping. No console/page/asset failures or external runtime requests.
- Layout checked in both locales at 320/390/736/1440 CSS pixels and 200% CSS layout zoom at 1440. State label/value geometry checks pass; narrow history tables deliberately scroll horizontally. Combined shared and local shipped CSS is 11933 bytes. Measured text contrast minimum 6.449:1 (muted text on panel2); core state values 13.397:1; focus 8.937:1. The shared palette is reused exactly.
- `tests/evidence/reading.json`: bilingual visible text was checked for initial, division failure, square cutoff and final factorization; every revealed prediction option explains the bound. The fresh p=1331 premise is independently validated: x=99…37 all fail, then x=36 stops at 1296<1331. Hidden feedback clears on answer changes. Locale preserves selection, reveal and trace state.
- Forty retained screenshots were opened and visually inspected in this author run: both headers, prediction/reveal, final ledger and actual final viewport; populated cutoff traces, separate state panels and table scroll endpoints at all tested widths; both 200% zoom states; both manual-copy fallbacks. Long element captures can include a sticky navigation strip at the capture scroll position; separate state and actual viewport captures establish readable geometry without relying on that artifact. No label/value collision or page overflow observed; horizontal table clipping is deliberate and keyboard-accessible.
- `tests/evidence/preflight.json`: from the repository root, `python3 -B scripts/register_leetcode_lesson.py 479 --validate-only` exits 0, stdout/stderr empty. Metadata complexity is one nonempty time-and-space string; concept anchors exist. No registration performed.

Source mirror contains only window.PYTHON_SOURCE assigned the exact JSON string of solution.py. Mathematical baseline, canonical execution and browser simulation are explicitly distinguished. Canonical memory O(n) counts strings; teaching snapshots are additional history. The worst-case integer-operation bound is exponential, and Python big-integer costs are disclosed.

Limits: headless Chromium and CSS layout zoom are observed; physical phones, browser-chrome zoom, screen-reader user testing, production delivery and actual novice outcomes were not tested. Independent lesson review remains pending. Candidate hashes in tests/evidence/candidate.json identify the files for that review; metadata fixes require a new frozen candidate.

## Review R1 repair — candidate 479-r1-fix (2026-10-25)

Status: **fixed awaiting independent re-review**. This author check does not close the independent finding or supersede the historical report `specs/reviews/479-review-1-0c35ad0a.md` (candidate `423e8dba47ab18341b4dc5a984e863cd899129bd`). New candidate manifest: [candidate-r1-fix.json](tests/evidence/r1-fix/candidate-r1-fix.json). Original candidate manifest and evidence are retained.

| Finding | Cause and repair | Regression evidence | Reviewer status |
| --- | --- | --- | --- |
| 479-R1-01 | The `related0` anchor advertised #440 but had a #479 href. Corrected `index.html` to `../440/#step2`. Replaced the browser suite's hard-coded URL probes with rendered label/href checks; added `tests/test_related.cjs` to click both related links in each locale and verify actual URL, lesson H1, target existence and settled target position. | [Before](tests/evidence/r1-fix/before/related.json): test exits 1, #440 leads to #479 in EN and zh. [After](tests/evidence/r1-fix/after/related.json): exits 0, both advertised lessons and step2 destinations agree in both locales. Before/after screenshots accompany each JSON. | Fixed awaiting review; separate reviewer must close. |

Product-fit verdict: reuse the approved lesson shell and existing Related ideas section. The supplied independent finding authorizes this bounded navigation repair; no new feature or layout. P0/highest-return slice: truthful label/destination binding and regression; complete. P1/P2: no additional changes. Deferred: independent closure belongs to the next review run. Algorithm, teaching sequence, canonical source, metadata and styles retain their reviewed behavior.

Commands run from the repository root, all exit 0 after repair. For the five lesson tests, set `LESSON_OUTPUT_DIR="$PWD/leetcode/479/tests/evidence/r1-fix/after"` to preserve previous evidence:

```sh
node leetcode/479/tests/test_related.cjs
python3 -B leetcode/479/tests/test_solution.py
node leetcode/479/tests/test_core.cjs
node leetcode/479/tests/test_browser.cjs
node leetcode/479/tests/test_reading.cjs
python3 -B scripts/register_leetcode_lesson.py 479 --validate-only
```

Observed: actual Python interface executed for every n=1…8; exhaustive pair oracle n≤3 and larger-candidate factor certificates pass. Core passes 8880 intermediate checks. Browser passes both locales, all trace/prediction controls, copy/download/fallback parity, offline mirror and storage denial, keyboard/focus, 320/390/736/1440 widths and 200% CSS layout zoom; no recorded browser errors or external runtime requests. Reading paths pass. New related-link test passes four actual navigations (two destinations × two locales), with target top between 70 and 140 CSS pixels after scrolling settles.

Visually inspected repaired EN/zh related-link viewports and settled #440 step2 destinations at 1280×900, plus EN/zh 320px state-panel captures: labels and values remain distinct and the link leads to the intended skip/descend explanation. Other responsive/zoom states have automated regression evidence, without a new claim of exhaustive screenshot inspection. Headless Chromium only; physical devices, native browser-menu zoom, novice outcomes and LeetCode acceptance remain unverified.

[Source contract evidence](tests/evidence/r1-fix/after/source-contract.json): the retained official capture includes faithful Python3 and TypeScript interfaces. Preferred Python is selected, so no non-Python language contract or supportedLanguages exception is needed. Inspected exact registration pair `solution.py` / `python-code.js` / `PYTHON_SOURCE`; offline mirror, browser display, clipboard and download equal the canonical source. No regeneration needed.

[Preflight](tests/evidence/r1-fix/after/preflight.json): `python3 -B scripts/register_leetcode_lesson.py 479 --validate-only` exits **0**, stdout/stderr empty. `lesson-entry.json` complexity remains one nonempty string covering time and space. No registration, report/rubric edits, acceptance changes, shared-asset edits, services, commits or deployment.

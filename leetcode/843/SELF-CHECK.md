# Author self-check — #843, candidate r1

Status: self-checked, ready for independent review. Reviewer/run: pending.
Author: Codex, exact model identifier unavailable. This is not independent
acceptance, public release verification, novice evidence or LeetCode acceptance.
Only leetcode/843/ was authored; shared assets and registry were not modified.

## Observed checks

- Official public statement and Python3 interface captured in
  tests/evidence/official-graphql.json; source/date/interface explanation in
  official-verification.md. Canonical implementation uses the provided Master
  object and returns None. No budget/secret parameter is fabricated.
- `python3 -B leetcode/843/tests/test_solution.py`: PASS, 1,211 cases. Exhaustive
  nonempty subsets of an eight-word dictionary, every secret; seeded dictionaries
  up to n=100; all secrets of the two official examples; true-secret conservation,
  exact history consistency, legal nonrepeating probes, independent group-based
  minimax ranking, no input mutation, <=10 calls. An intentional 26-disjoint-word
  stress case does not find the last word in ten calls, matching the visible
  limitation. It is not counted as success at finding that secret.
- `node leetcode/843/tests/test_core.cjs`: PASS, 3,068 checked frames; independent
  positional oracle, exact candidate history and every bucket. All 80 copy pairs
  are two nonempty strings; duplicate serialized keys are checked before parsing.
  Offline mirror equals solution.py, including its final newline.
- `node leetcode/843/tests/browser.cjs`: PASS, actual Chromium. Both locales,
  all five presets and every frame; both endpoints; back/forward parity; reset/end;
  all three prediction selections with reveal/change/locale preservation;
  formula operands and candidate/readout values; source display, embedding,
  download, successful clipboard transfer, and native manual fallback copy.
  Each fallback used a distinct verified non-source sentinel before disabling
  automatic writes, checked focus/full selection, pressed Linux Control+C and
  read back the exact source. No newline normalization.
- Browser widths 320/390/736/1440; CSS zoom 2 at 320/390/1440 in both languages;
  no page overflow; intentional keyboard-focusable horizontal table scrolling.
  Keyboard Enter/Tab, 3px focus, forced-color outline, sticky anchors, unavailable
  localStorage, offline file opening, local asset/link checks, long text wrapping.
  Zero console, asset or external-runtime-request errors. CSS: 10,883 bytes total.
- Measured rendered sRGB contrast: sampled text 7.08–16.09:1; active language
  13.10:1; focus on panel2 8.94:1. Ancestor background alpha composition is used
  for selected-row text (12.30:1); calculations calibrated on black/white.
- `node leetcode/843/tests/focused.cjs`: PASS. Touch controls >=48×48px,
  actual horizontal scroll, hand/prediction/terminal screenshots in both locales.
- `python3 -B scripts/register_leetcode_lesson.py 843 --validate-only`: PASS,
  exit 0, no stdout/stderr. See tests/evidence/preflight.json. No registration.

## Visual inspection

The author opened and inspected en-1440-trace.png, zh-320-trace.png,
en-390-top.png, zh-hand.png, en-prediction.png, zh-table-right.png,
en-terminal.png, en/zh-320-zoom200.png and zh-1440-zoom200.png using the image
viewer. Desktop buckets align with their headings; mobile candidate chips wrap;
right-scroll exposes worst-bucket/state columns; hand marks exactly positions
2,5,6; prediction feedback names the two consistent survivors; terminal state
retains both calls and has no spurious next-round table. At the narrowest 200%
CSS zoom, English long words may wrap internally; text remains full-size and
uncropped. The table intentionally requires horizontal scrolling at narrow widths.
See author-fix-log.md for caught pre-freeze overflow and its repair.

## Evidence limits

This is an author self-check only. No fresh independent reviewer or actual novice
has walked the lesson. No LeetCode submission, production publishing, real mobile
hardware, screen-reader session or browser-chrome zoom was performed. CSS zoom
is the recorded 200% browser-content stress method. Minimax is one-step lookahead,
not a proof that every dictionary is solvable within ten calls. The UI explicitly
separates the JavaScript teaching simulation from Python execution.

Reproduction commands and OUTPUT_DIR behavior: tests/README.md. Canonical candidate
hashes are in candidate.json. Independent review remains the next required gate.

## Budget repair r2 — 843-BUDGET-R1 (2026-10-26)

The r1 entries above describe the historical candidate, including its defective
cap. They are not current acceptance evidence. This append records author
self-checks for **843-budget-r2**; fresh independent review/closure is pending.
Canonical solution SHA-256:
`51f9e29c91ca3ffe6238f13dfa0f0b632081274be4747ac67cfbf627b986dc05`.
`candidate.json` freezes the new metadata, source, UI, tests and evidence hashes.
Prior candidate manifest and exact source are retained in
`tests/evidence/budget-r2/prior-candidate.json` and `before.py`.

### Fix mapping to the required finding

| Finding / request part | Change | Observed evidence |
| --- | --- | --- |
| 843-BUDGET-R1 §1: premature return | Replace arbitrary ten-round cap with `while candidates`; retain official Python `(words, master) -> None` and identical deterministic minimax ranking | `red.json`: 20/22 and 20/24 found, exit 1. `diagnostic11.json`: 22/22, but 22/24, exit 1 overall. `diagnostic30.json`: all fixtures pass, exit 0. `green.json`: canonical all 73 secrets pass, maxima 10/11/12 for 20/22/24 words under budgets 10/11/30 |
| 843-BUDGET-R1 §2: actual-success semantics and source parity | Continue through a known singleton; only reply 6 means found. JavaScript simulation uses same strategy, with separately disclosed simulation budgets. Exhaustion has its own unsuccessful state | `test_budget.py` uses a slots-only closure-backed Master: strict budgets, no exposed budget/secret fields, independent positional replies and minimax choice, exact history survivors at the actual API seam, strict shrinkage on failure, no calls after success, legal/nonrepeated guesses, −1 on illegal guesses, no input mutation and None return. `test_core.cjs` compares every paired-family frame with actual Python call traces |
| 843-BUDGET-R1 §3: bilingual teaching and costs | Update `limit`, `progress`, `map3`, `cost`, core loop, metadata, source mirror and asset versions. Keep explicit heuristic/budget limitation; prove G≤n termination. Existing selector adds paired controls | Both locale browser runs show known singleton after 10, actual success at 11, and unsuccessful budget-10 exhaustion. New budget example hand-calculates first 22-word buckets as 10/10/1/1. Complexity is one time-and-space string with G≤n |
| 843-BUDGET-R1 §4: real callable regressions before fix | New `test_budget.py` executed red before canonical edits; exact red source and one-variable diagnostic variants retained. Existing small/exhaustive/seeded and official fixtures preserved | `red.json`, `diagnostic11.json`, `diagnostic30.json`, `green.json`; reproduction commands in tests/README.md. Diagnostic bounds are not canonical fixes |

Confirmed causal hypothesis: the cap stopped a correctly filtering, correctly
ranked strategy before the actual successful call. Raising just the bound fixed
the 22-word family at 11 and the 24-word family at 12. The unchanged strategy
continues to satisfy the tested ten-call controls; this is finite evidence,
not a theorem that extra rounds are safe on every ten-call dictionary.

The final stop is justified by progress, not by guessing the hidden allowance:
a current-candidate probe has worst failed bucket ≤c−1, so minimax also strictly
shrinks C on each failure. Failed used probes are not candidates. A singleton
wins the candidate tie rule and is guessed. Hence truthful listed inputs finish
in at most n actual calls. This does **not** prove G≤allowedGuesses on every
generated case. No hidden-test membership, universal minimax optimality, full
hidden-judge pass, or actual LeetCode submission is claimed. The simulator's
known budget is never passed to the Python submission.

### Commands actually run and results

All new output is in `tests/evidence/budget-r2/`, preserving older evidence.
The red/diagnostic commands and their expected exits are in tests/README.md.
The following were executed from the repository root:

- `python3 -B leetcode/843/tests/test_budget.py --output leetcode/843/tests/evidence/budget-r2/green.json`: exit 0; all 73 secrets across six fixtures, strict budgets.
- `OUTPUT_DIR=leetcode/843/tests/evidence/budget-r2 python3 -B leetcode/843/tests/test_solution.py`: exit 0; 1,211 cases, n=1..100, exhaustive small dictionaries, seed 843, both official lists. The separate 26-disjoint-word stress succeeds in 26 with budget 30; no false ten-call success claim.
- `OUTPUT_DIR=leetcode/843/tests/evidence/budget-r2 node leetcode/843/tests/test_core.cjs`: exit 0; 3,068 small-oracle frames plus paired-family Python/JS trace parity, exhaustion control, 87 bilingual pairs, duplicate-key and exact source-mirror checks.
- `OUTPUT_DIR=leetcode/843/tests/evidence/budget-r2 node leetcode/843/tests/browser.cjs`: exit 0; all nine presets/every frame in EN and zh-CN, cumulative calls versus ledger length, next-probe identity/buckets, rewind/replay, reset/end, locale-after-interaction, hidden/revealed/changed prediction scope and complete formula operands. Exact embedded/displayed/downloaded source and automatic/native manual clipboard transfers, including final newline. Each locale fallback resets and verifies a distinct non-source sentinel; actual Linux Control+C and exact clipboard readback pass.
- `OUTPUT_DIR=leetcode/843/tests/evidence/budget-r2 node leetcode/843/tests/focused.cjs`: exit 0; touch targets, horizontal scrolling and focused screenshots in both locales.
- `OUTPUT_DIR=leetcode/843/tests/evidence/budget-r2 node leetcode/843/tests/budget_browser.cjs`: exit 0; independent expected first bucket, known at 10 / success at 11 / exhausted at 10, cumulative counts and next-probe identity, locale preservation and replay at 320/1440 in both locales. `budget-browser-results.json` retains expected and observed readouts.
- `node --check leetcode/843/app.js` and `node --check leetcode/843/core.js`: exit 0. `git diff --check`: exit 0.
- **`python3 -B scripts/register_leetcode_lesson.py 843 --validate-only`: exit 0; stdout/stderr empty.** Full command, cwd, timestamp and result in `preflight.json`. No registration was run.

Browser checks use the supplied preview and Chromium executable. Main layout
checks cover 320/390/736/1440px and CSS zoom 2, both languages; no page overflow,
console/asset errors or external runtime requests. Sampled text contrast ≥7.07:1,
focus contrast 8.94:1; CSS remains 10,883 bytes. Keyboard, source fallback,
blocked storage and local file/offline loading pass. New runtime assets are
cache-versioned as 843-budget-r2. No CSS, shared files or services changed.

Author visually inspected r2 images `en-1440-known10.png`,
`zh-320-known10.png`, `en-320-found11.png`, `zh-320-found11.png`,
`en-320-exhausted10.png`, and `zh-1440-exhausted10.png`: status/readout and
candidate labels are readable and wrap; success/exhaustion are visibly distinct;
cumulative ledger remains, and terminal next-round tables are hidden.

Official statement reopened at the official URL; archived official Python3 and
TypeScript snippets were re-read and asserted in `official-recheck.json`.
Python is faithful and preferred. No non-Python language-contract.json exists
or is needed; neither preferred interface is omitted from the retained official
language evidence. The source/mirror/export table in
`scripts/register_leetcode_lesson.py` was read; exact Python pair verified.

No child agents, commits, registration, acceptance changes, publishing or service
changes occurred. Independent closure of 843-BUDGET-R1 on this new frozen
candidate remains the next action. Real devices, screen readers, browser-chrome
zoom, actual novice learning and production/LeetCode acceptance remain unverified.

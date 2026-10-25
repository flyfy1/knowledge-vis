# #488 author self-check — candidate 488-author-v1

Status: complete author candidate, ready for a separate independent review.
No independent acceptance, online judge acceptance, learner study, registration,
publication or deployment is claimed. Only `leetcode/488/` was authored.

Official verification: public official URL and GraphQL selector/interface capture
in `../provenance/official.json`, accessed 2026-10-25. Python3's actual interface
is `Solution.findMinStep(self, board: str, hand: str) -> int`. The original source
is `../solution.py`; no non-Python fallback or language contract is needed.

## Executed checks

- `python3 -B leetcode/488/tests/test_solution.py`: PASS, 656 cases, including
  532 exhaustive legal two-color board/hand combinations, 96 seeded legal
  five-color cases, official examples and boundary fixtures. Independent BFS
  oracle retains original hand positions and has no production color/gap pruning.
  Maximum board length 16 and maximum hand length 5 are tested. The regression
  RRWWRRBBRR / WB returns 2 and is also checked by the independent oracle.
- Python runtime observation: 172 actual solve entries checked for stable board,
  sorted remaining hand, and strictly decreasing hand length; 280 collapse
  returns compared with independent regex normalization. See python-results.json.
- `python3 -B leetcode/488/tests/test_contract.py`: PASS, 95 unique bilingual
  pairs, valid static localization bindings, no duplicate IDs, exact canonical
  mirror parity, official Python selector, visible baseline executed on 5 cases.
  The baseline in the page exactly matches `tests/baseline.py`.
- `node leetcode/488/tests/test_core.cjs`: PASS, 19 teaching frames checked for
  stable/unstable meaning, prior/current board association, used-ball/remaining-
  hand conservation, removal cost zero, replay determinism, and source parity.
  Exhaustive legal small insertion outcomes are independently normalized.
- `node leetcode/488/tests/browser.cjs`: PASS, real headless Chromium on the
  existing preview origin. Both locales; every preset and event at 320, 390,
  736 and 1440px; before/after strings, progress, stable/unstable feedback,
  forward/back/forward equality, initial/end disabled controls, full rewind,
  reset and direct endpoint. Preset switching explicitly restarts only its trace.
  All quiz options, explicit reveal, answer-change invalidation and locale
  preservation pass. Complete recurrence operands remain visible in both locales.
  Baseline disclosure survives locale changes. Header language buttons, select
  labels, native radios and live feedback are localized.
- Keyboard Enter/Tab, 3px focus with 4px offset, forced colors, reduced motion,
  48px button/select targets, keyboard horizontal row scrolling, blocked storage,
  offline file source and local links/anchor targets pass. Zero console/page/HTTP
  errors; runtime requests stay local. Native clipboard write/read, denied-copy
  fallback with full selection and actual keyboard copy, displayed source and
  downloaded bytes all equal canonical source including its final newline.
- `node leetcode/488/tests/zoom.cjs`: PASS, **actual Chromium tab zoom at 200%**,
  using a test-only extension and `chrome.tabs.setZoom` / `getZoom`. At physical
  viewport 1440 and 780, effective CSS widths are 720 and 390 with DPR 2. Both
  locales retain state, full labels and original ball dimensions. This is in
  addition to the browser suite's CSS zoom checks. Actual-zoom screenshots use
  direct CDP surface capture because normal Playwright viewport capture was
  blank at tab zoom in this browser build; see README for the reproducible method.
- From repository root, `python3 -B scripts/register_leetcode_lesson.py 488
  --validate-only`: PASS, exit 0, no stdout/stderr. Exact command, cwd and time
  recorded in `evidence/preflight.json`. This is validation only, no registration.

## Visual and contrast inspection

Opened and visually inspected actual screenshots, including EN/zh intro,
320/390 populated trace, 736/1440 before/after/history, 320 prediction feedback,
and both locales at actual 200% tab zoom (780 and 1440 physical widths).
At the official success trace event 4/5, before = WWBBBWW, after = WWWW,
remaining hand = RWW, balls spent = 2; the pending-removal caption agrees.
At insertion event 1/5 under actual zoom, before = WWRRBBWW, after = WWRRRBBWW,
remaining hand = BRWW, balls spent = 1. No state-label/value text collisions
were observed in the inspected screenshots. Long rows deliberately scroll
horizontally; a full string stays printed immediately below each board. Keyboard
scrolling was executed, rather than inferred from CSS overflow alone.
Prediction feedback at 320px shows BR/RB equivalence, the exact two-ball route,
and why the one-ball distractor fails. Text and controls wrap without page overflow.

Rendered contrast measurements (browser-results.json): body 16.09:1, ball text
13.40:1, muted on panel 7.08:1, disabled on panel2 6.45:1, primary 13.10:1,
focus on panel 9.81:1. Essential normal text exceeds AA; disabled text remains
legible. Ball letters, full strings, event verbs and phase captions carry meaning
without color. Combined shared plus local shipped CSS = **11,827 bytes**.
No external fonts, images, dependencies, API calls or animation timers ship.

## Limits and freeze

Computational independence of the oracle is not independent reviewer judgment.
Real phones, assistive-technology user testing, actual novice teach-back,
LeetCode online submission and public delivery remain unverified. This run did
not spawn reviewers or agents. The independent reviewer should start with only
the preview URL and frozen identity, before reading this report or the brief.
`evidence/candidate.json` identifies the final source, tests, evidence and shared
asset hashes. Any later source or metadata correction creates a new candidate.

## Revision 2 — 488-R1 fixed awaiting independent review

This appends author evidence to the original self-check. Historical review
`specs/reviews/488-review-1-a9cfefd1.md` remains unchanged. New candidate:
`488-repair-v2`, identified by `evidence/revision-2/candidate.json`; no commit,
registration, acceptance update or release is claimed.

**Fix mapping:** 488-R1 → section 5, `returnTitle`, `returnFailure`,
`returnSibling`, `returnMinimum` in `copy.js` and their visible HTML bindings.
The bilingual worked sequence follows parent `(RBBR,BR)` → failed child
`(BRBBR,R)` returning 6 → unchanged parent best `min(6,1+6)=6` → next B gap 1
collapsing RBBBR to RR → child `(RR,R)` → empty child returning 0 → child
returning 1 → parent best `min(6,1+1)=2`. It explains immutable string arguments,
no undo, the remaining enumeration, the lower bound, sentinel meaning, and
future cost versus previously spent balls. Sampled branches are explicitly
labeled; no complete search trace is implied. Existing layout and tokens reused.

The focused regression initially failed for the missing rendered bridge
(`returnTitle`); after the repair it passes. `test_returns.py` observes the actual
canonical Python calls/returns and parent local variables, including both best
updates and final return 2. This is author runtime evidence, not independent
acceptance. See `revision-2/initial-regression.json` and `return-results.json`.

All commands ran from the repository root, with
`OUTPUT_DIR=leetcode/488/tests/evidence/revision-2` for emitting test suites:

- `python3 -B leetcode/488/tests/test_returns.py`: PASS, concrete returns and
  immutable parent arguments across the two sibling branches.
- `python3 -B leetcode/488/tests/test_solution.py`: PASS, 656 cases / 532
  exhaustive cases, 172 actual solve entries and 280 collapse returns.
- `python3 -B leetcode/488/tests/test_contract.py`: PASS, 99 unique bilingual
  pairs, exact canonical/mirror parity and 5 visible baseline executions.
- `node leetcode/488/tests/test_core.cjs`: PASS, 19 frames and stable-state,
  remaining-hand/spent-ball accounting and source parity checks.
- `node leetcode/488/tests/browser.cjs`: PASS, existing controls and presets,
  both locales at 320/390/736/1440, locale changes after interaction, complete
  recurrence, prediction scope/change invalidation, rewind/replay, clipboard
  success and actual fallback keyboard copy, exact display/download/mirror,
  offline source and blocked storage. New bridge text checked in both locales
  and captured at 320/390/1440. Zero page/console/HTTP errors. Full rendered
  bridge text is recorded under finding 488-R1 in `browser-results.json`.
- `node leetcode/488/tests/zoom.cjs`: PASS, actual tab zoom read back as 2,
  both locales at physical widths 1440/780 (effective 720/390). New paragraphs
  additionally captured at effective 390 with no page overflow.
- `python3 -B scripts/register_leetcode_lesson.py 488 --validate-only`: PASS,
  exit 0, empty stdout/stderr; exact cwd/command/time in
  `revision-2/preflight.json`. Metadata already has one nonempty time-and-space
  complexity string, so no metadata repair was needed. Registration never ran.

Visually opened EN/zh 320 sibling paragraphs and EN/zh effective-390 actual
200% zoom minimum paragraphs. Board/hand strings, return values and formulas
wrap readably; no text collisions observed. Each paragraph is ordinary page
content, so viewport screenshots may show adjoining paragraphs partially above
or below the scroll position. Browser records all paragraph text separately.
Existing ball diagrams, stable/pending phase labels and path/answer accounting
retain their regression coverage. Contrast remains the existing measured pairs;
CSS is unchanged at 11,827 combined bytes.

Canonical Python and its mirror are unchanged; regeneration was unnecessary.
Read registration policy's exact Python triple `solution.py`, `python-code.js`,
`PYTHON_SOURCE`. Existing official selector evidence includes faithful Python3
and TypeScript; Python remains the preferred selected interface. There is no
non-Python language contract or supportedLanguages list that omits them.
`revision-2/served-parity.json` verifies all seven lesson runtime/source assets
served by the supplied preview match local bytes exactly. New source/test hashes
freeze this candidate for separate review.

Independent reviewer next action: fresh walkthrough of the recursive bridge and
its prerequisites in both locales; compare the concrete returns with canonical
Python and decide closure of 488-R1. No finding is marked independently closed.
Real devices, novice teach-back, online judging and production delivery remain
unverified. Only `leetcode/488/` changed; no child agents were used.

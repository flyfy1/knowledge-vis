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

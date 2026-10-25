# Author self-check — #773

Status: complete author candidate, independent review pending. No registration,
commit, deployment, campaign-state change, or independent acceptance occurred.
Scope is exclusively leetcode/773/. Final runtime and test identities are in
candidate.json. Design authority is the existing all-Hard design review and its
dispatcher adjudication; this is not a new independent design or teaching review.

## Observed checks

- Official contract/interface: public official GraphQL response captured in
  tests/evidence/official.json on 2026-10-25, including Python3 selector snippet.
- Python executes the official callable against all 720 permutations, compared
  with coordinate-based reverse Dijkstra. All match; 360 reachable, 360
  unreachable, maximum distance 21. Input mutation checked for all cases.
- Seven full-graph repeated-relaxation baseline checks independently agree.
  Official examples produce 1, -1, 5; fresh exercise board 013425 takes 3 moves.
- JS core: all 720 starts, 13,184 frames checked against independently generated
  coordinate neighbors, complete layers, discovery counts, history and admission
  decisions. Source mirror and all 88 bilingual keys checked for parity/uniqueness.
- Real Chromium: both locales, all five presets, every frame forward/back/replay,
  initial/terminal endpoints, reset/end, selected/revealed/changed predictions,
  locale preservation and independent experiment state. Focused semantic records
  verify rejection of seen 412503 and admission of new neighbors in both locales.
- Exact source parity: file, mirror, textContent, browser clipboard, downloaded
  bytes and manual fallback. Native Linux Control+C transfers the selected source
  after a non-source clipboard sentinel; actual clipboard readback matches.
  Success/fallback messages checked in both locales.
- 320/390/736/1440px and CSS 200% zoom in both locales. Local zoom defects found
  during author testing were corrected: frontier grid minimum and fieldset
  min-content width. Combined 320px/200% retains 48px board cells with contained
  scrolling and localized instructions. Keyboard horizontal scrolling verified.
- Keyboard move/undo-ready focus, Enter, Tab, sticky anchors, forced-colors focus,
  denied localStorage, offline file opening, and local link targets checked.
- No console/page errors, failed local assets, or external runtime requests.
- Shared + local CSS: 11,530 bytes. Text contrast measured 6.449:1 minimum among
  sampled active/disabled/readout roles; normal body 16.087:1, explanatory body
  12.616:1; focus against panel2 8.937:1. Borders 6.449:1. See browser-results.json.

## Visual inspection

Author opened headless screenshots, including desktop first view, narrow English
and Chinese frontiers, 736px multi-board grids, 200% desktop and extreme narrow
boards, keyboard scrolling/focus, admission/rejection text, prediction reveal,
and selected source fallback. Three columns remain visible at ordinary phone
widths; extreme zoom uses the documented horizontal scroller. No tile text
collisions were observed. Large-element screenshots may start mid-element and
sticky navigation may appear over content at the capture position; anchor tests
and settled control captures separately check actual navigation geometry.

## Metadata gate

Executed from repository root:
`python3 -B scripts/register_leetcode_lesson.py 773 --validate-only`
Result: exit 0 (no output). complexity is one string covering time and space.
This safe command did not register or alter shared metadata. Final preflight
receipt is tests/evidence/preflight.json.

## Limits and next step

This is author evidence only. No actual learner study, independent cold review,
LeetCode acceptance, physical device/browser-chrome zoom, or public deployment is
claimed. Next: separate reviewer cold-walks the frozen candidate, then audits the
source, evidence, and six-dimension rubric. All prior campaign reviews remain
untouched.

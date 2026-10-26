# #1036 author self-check — candidate 1036-v1

Author: Codex; precise model identifier unavailable. Independent reviewer/run:
pending. No independent acceptance, actual learner results, LeetCode submission
result or public deployment claimed. This author run only owns leetcode/1036/.

## Observed results
- Public official URL and GraphQL checked on 2026-10-26. Full response and
  Python3 selector/interface saved as official.json. Python is canonical.
- `python3 -B leetcode/1036/tests/test_solution.py`: PASS, 2,761 canonical
  solution cases with coordinate-compressed full-reachability oracle or explicit
  independently calculated expected values. Exhaustive <=3 blockers in a 3×3
  coordinate patch with all endpoint pairs, 450 seeded cases (seed 1036), both
  official examples, maximum 200 blockers, remote corners, one blocker, duplicate
  entries and unchanged inputs. Separate full finite-grid enumeration validates
  the clear-line component theorem on 2,626 five-by-five grids.
- `node leetcode/1036/tests/test_core.cjs`: PASS, six preset results and all 32
  snapshots. Independently reconstructs connectivity within each seen set;
  verifies seen uniqueness, legal cells, queue order, new neighbors, expansion
  accounting, reach/escape/trap conditions, exact source mirror and unique copy keys.
- `node leetcode/1036/tests/browser.cjs`: PASS on real Chromium, Linux host.
  Twelve localized preset walks, every event with backward/forward equality,
  reset/end and disabled endpoints. Formula and actual localized heading identity
  checked. Predict/reveal/change and locale roundtrip preserve relevant state.
  Real keyboard Enter, focus outline and current/seen marker overlap exercised.
  Source textContent, native automatic clipboard and both downloaded files equal
  solution.py exactly, including terminal newline. Four manual fallback transfers
  (two per locale), each preceded by a distinct verified clipboard sentinel,
  focus/full selection and host Control+C, then native clipboard readback.
- Sixteen layouts: zh/en × 320/390/736/1440 × CSS zoom 1/2. Core diagram uses
  contained horizontal scrolling; equal cells, no cell overflow, no document
  overflow. No external runtime requests, asset errors, console or page errors.
  Storage-denied context still switches locale and operates the trace.
- `node leetcode/1036/tests/browser_extra.cjs`: PASS for bilingual 320px at
  zoom 1/2. Closed native selector text fits with 20px arrow reserve; actual font
  stack recorded (not an assertion about resolved native fonts). Far-corner
  coordinate geometry and keyboard ArrowRight scrolling preserve search state.
- Actual computed foreground/background contrast: body 16.09, muted/disabled
  7.08, current 8.94, blocked marker 6.35, selected language/navigation 13.10.
  Focus/panel 9.81. Contrast helper calibrated with black/white=21 and same=1.
  Exact colors use shared tokens. Total shared + local CSS: 11,458 bytes.
- From repository root:
  `python3 -B scripts/register_leetcode_lesson.py 1036 --validate-only`
  PASS, exit 0, no stdout/stderr. Metadata complexity is one nonempty string.
  Receipt: preflight.json. No registration performed.

## Visual inspection and pre-freeze fixes
Author visually opened desktop-overview.png, en-1440-zoom1.png,
en-390-zoom1.png, zh-320-zoom1.png, en-320-zoom2.png, overlap-zh.png,
header-en-zoom2.png, header-zh-zoom1.png, far-zh-zoom1.png,
far-scrolled-zh-zoom1.png and far-scrolled-en-zoom2.png. These show header wrapping,
readable actual values, cropped/scrollable grid, selected/seen/current marker
combination and bilingual readouts. Final far-corner captures were inspected
again after the coordinate formatting fix. The finite window's edge is explicitly
not a wall; full sets and queue remain visible below it.

Pre-freeze author checks caught header overflow at 320px/200%: fixed with wrapping.
Long native preset labels were replaced by A–F plus a full localized description.
Six-digit coordinates originally wrapped across digits: changed to separate x/y
lines and a 520px minimum board in a keyboard-scrollable region. A test used an
arbitrary >20-character event threshold that rejected valid concise Chinese;
replaced with the appropriate expected localized event prefix. The extra browser
harness originally used End, scrolling the document; it now uses ArrowRight to
exercise horizontal diagram scrolling and captures the actual resulting diagram.
These are author corrections, not findings closed by an independent reviewer.

## Evidence limits and next action
The 200% test is browser CSS zoom emulation, not physical-device browser chrome
zoom. Only the available Chromium/Linux environment was measured; no actual
phone, other OS font environment, screen reader or novice learner trial was run.
Forced-colors rules are supplied but no real high-contrast device is claimed.
Numerical oracle independence is algorithmic, not independent human/agent review.
Next: separate reviewer cold-walks the frozen candidate and applies the six
review dimensions before any acceptance, registration or publication.

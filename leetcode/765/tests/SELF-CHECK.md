# #765 author self-check — 2026-10-25

Status: complete author candidate; independent review pending. No registration,
commit, deployment, schedules or subagents. All changes are in leetcode/765/.
Official public statement and actual Python3 snippet captured in
../provenance/official.json. Exact canonical source: ../solution.py.

## Observed results

- `python3 -B leetcode/765/tests/test_solution.py`: pass. 41,064 exhaustive
  permutations against multi-source all-swap BFS, 1,000 seeded cases up to
  30 couples, official examples, two independent-cycle transfer case, maximal
  long cycle n−1, already paired rows, mutation and valid final arrangement.
- `node leetcode/765/tests/test_core.cjs`: pass. 224 independent BFS fixtures;
  every frame checks fixed prefix, person conservation, exact position map,
  before-state continuity, additive swaps and swaps+(n−c)=initial optimum.
  Exact mirror/source parity; acorn checks all 87 unique two-string copy keys.
- `node leetcode/765/tests/test_browser.cjs`: pass on Chromium 156.0.8078.4,
  Linux. Both locales, all five presets and both endpoints, reset, full
  forward/back/forward restoration, independent hand swap, every prediction
  choice/reveal/change/reset, locale after interaction, source disclosure,
  copy success, clipboard denial fallback, actual Control+C then clipboard
  readback with a non-source sentinel, exact displayed/copied/downloaded bytes.
  Offline file source works; denied storage, reduced motion and forced colors
  work. Keyboard Enter activates controls and all section links; 3px focus
  outline and target geometry checked. Related #41 link keyboard-activated.
- Both locales at 320, 390, 736, 1440 CSS pixels; document overflow and selected
  preset text width checked in the actual system font environment. System
  stack is PingFang SC, Microsoft YaHei, system-ui, sans-serif; no exact installed
  font identity inferred from that stack. 200% native browser zoom reports
  factor 2, DPR 2, innerWidth 720 in a physical 1440-wide window.
- All 23 generated PNGs were visually inspected (headers, populated traces,
  revealed answers, both zoom locales and forced colors). Seat blocks retain
  two distinct labeled seats; labels/map entries/feedback wrap clearly.
  The narrow sticky nav intentionally scrolls horizontally; its pills no
  longer shrink or overlap. Screenshot top clipping from ordinary scroll
  positions is viewport cropping, not lost content; target anchor geometry is
  separately checked with actual keyboard navigation.
- Combined shipped CSS: 11,822 bytes. Tested solid-color text pairs have minimum
  unrounded contrast 6.449407898769069, above AA 4.5. Focus accent pairs exceed
  3. Test helper calibrated against black/white, all three primaries and
  #747474 on black (4.492948073111701, correctly below 4.5). Disabled primary
  uses muted text on panel2 at opacity 1; computed styles asserted. No gradient
  or transparency measurements are claimed.
- No console, script, network or asset errors on the #765 route; all runtime
  requests local. Following related #41/#step2 produces an existing 404 for
  /favicon.ico, recorded separately in browser-results.json. #41 page, scripts
  and semantic destination load; no unowned favicon/shared file was edited.
- Related label/destination: #41 step2 actually teaches x → x−1 in-place
  placement and rechecking the displaced value. Local links lead to the fixed
  prefix and component proof. Destination is served in this preview; public
  release inclusion remains the dispatcher's duty.

## Corrections during authoring

Initial visual inspection found shrinking sticky pills and a disabled cyan
button with muted text. Local CSS fixes keep pills intact and use the shared
panel2 disabled background. Keyboard testing reproduced a smooth-scroll/focus
race on the first deep link; immediate section jumps resolved it. These are
self-check corrections before candidate freeze, with final screenshots/checks.

Harness corrections: compare localized snapshots after returning to the same
locale; quote numeric CSS attribute values; explicitly reset the preset before
keyboard assertions; wait for anchor geometry instead of assuming 250ms.
Opening chrome://settings crashed the environment's browser, and startup zoom
preferences were ignored. A test-only native zoom extension with viewport:null
verified actual zoom. The ordinary screenshot helper yielded a blank zoomed
capture; direct CDP capture produced inspected populated images. These failed
attempts do not imply product defects or count as verification passes.

## Boundary of evidence

Author-run checks only. Real devices, other OS/font installations, public
production delivery, actual novices and independent acceptance are unverified.
There is no LeetCode submission result. Separate fresh review of the frozen
candidate is the next gate; hashes are in evidence/candidate.json. No previous
review outcome or campaign state was changed. Preflight command/result are
recorded in evidence/preflight.json.

## 2026-10-25 repair self-check — 765-MAC-MARGIN-01

New candidate: `evidence/margin-repair-20261025/candidate.json` records SHA-256
hashes of runtime, source, metadata, tests and read-only shared dependencies.
Finding status: implementation complete, **Mac verification pending**; this
self-check does not close the independent finding or accept the candidate.
The prior accepted revision and reports remain historical evidence.

Fix mapping: `copy.js` changes only English `pre3` from
`8 people · counterexample` to `8 people: counterexample`. `index.html` bumps
only that asset's cache version. All five preset identities, Chinese text,
algorithm, Python source/mirror, trace state, CSS and 24px reserve are retained.
The original full browser suite is byte-identical to accepted candidate
`7ec592bddf5642212cdcb3363510982354da780e`, SHA-256
`addc2e5f5c8f97a2fd31bcdd854caaf425dbf745f4e014ca0af877c777fb0e48`.
No causal/algorithm repair was called for by this label-only dispatch.

### Feedback loop, ranked hypotheses and cause

Read the website-design and diagnosing-bugs skills and adopted repair report.
The original Mac red log, measurements and ranked hypotheses are preserved
unchanged under `evidence/margin-repair-20261025/original-mac-red/`, with origin
hashes in the receipt; original reports were not edited. Mac Chromium
151.0.7922.34 measured 209.440px against a 206px conservative budget. The old
label and arrow were visibly complete; this is not proof of visible clipping.
The independent label-only probe measured 200.016px, but was not a full-suite run.

Before this repair's interventions, hypotheses were ranked in the task log:
(1) text exceeds the conservative font-dependent budget, so label-only shortening
should pass; (2) wrong canvas font predicts disagreement with a same-style DOM
span; (3) stale locale predicts changed measurements after EN→ZH→EN. Archived
Mac probes support (1), show canvas/DOM agreement, and reject (2)/(3).
This host is Linux ARM64 with Chromium 156.0.8078.4, not Mac. Its baseline
full suite passed (exit 0, `baseline/full-suite.log`), with old-label native
text width 199.776px, so it cannot reproduce or close the native Mac failure.

Supplemental actual-browser loop: a test-only 17px select font made the old label
red at 212.261px versus 206px (`baseline/stress.log`, exit 1). The repaired label
also fails at 17px, 207.842px (`stress17/`, exit 1). Preserve this limitation.
At 16.7px, replaying just the old label makes the unchanged width predicate red
at 208.358px (`baseline/stress16-7.log`, exit 1); the repair makes it green at
204.020px (`stress.log`, exit 0). This is explicitly synthetic sensitivity,
not native Mac evidence or a replacement for the original full suite.
An initial replay attempt changed COPY after the locale helper had already
snapshotted it, so it did not exercise the old label. The final harness replays
the copy.js response before initialization and records the actual measured label.
No runtime debug instrumentation or CSS changes remain.

### Commands and observed results

Run from repository root, with
`OUTPUT_DIR=leetcode/765/tests/evidence/margin-repair-20261025` and the supplied
NODE_PATH and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Existing earlier evidence is
retained; this repair's results are in that new directory.

| Command | Result |
| --- | --- |
| `python3 -B leetcode/765/tests/test_solution.py` | Exit 0; actual official Python interface, 41,064 exhaustive BFS permutations, 1,000 seeded larger cases, n=30 boundaries |
| `node leetcode/765/tests/test_core.cjs` | Exit 0; 224 independent fixtures, intermediate prefix/map/components, exact mirror, 87 unique bilingual keys |
| `node leetcode/765/tests/test_browser.cjs` | Exit 0; unchanged **full** suite, both locales, including checks beyond original Mac failure; `full-suite.log` and `browser-results.json` |
| `node leetcode/765/tests/test_margin.cjs` | Exit 0; 30 preset × locale × width combinations after roundtrip, unchanged 24px reserve; `margin-results.json` |
| `node leetcode/765/tests/test_rendered_contract.cjs` | Exit 0; hand-computed complete cycle frames, formulas, cumulative count, rewind/replay, prediction scope; `rendered-contract.json` |
| `node leetcode/765/tests/test_margin.cjs --stress` | Exit 0; 16.7px synthetic sensitivity, `stress-results.json` |
| `node leetcode/765/tests/test_margin.cjs --stress --legacy-label` | Expected exit 1 with separate OUTPUT_DIR ending `baseline/stress16-7`; old-label-only response replay |
| `python3 -B scripts/register_leetcode_lesson.py 765 --validate-only` | Exit 0, empty stdout/stderr; `preflight.json`; complexity remains one nonempty time-and-space string |

Native Linux repaired-label width at 320px is 195.616px against 206px, leaving
10.384px. Both locale meanings retain eight-person scope and counterexample
purpose. Viewed all 30 selected-control screenshots via three native-size contact
sheets (`select-sheet-320/390/1440.png`): all five labels and arrows complete in
both locales after roundtrip. Also inspected populated 320px trace and native
200% zoom screenshots in both locales: seat IDs, pair labels and position-map
entries remain legible and associated. Ordinary viewport cropping is not content
loss. Desktop contact sheet was regenerated at full control width to retain arrows.

Rendered-state checks use the hand calculation
`[0,2,3,4,5,6,7,1] → [0,1,3,4,5,6,7,2] → [0,1,3,2,5,6,7,4] →
[0,1,3,2,5,4,7,6]`, followed by a skip. Cumulative swaps are 0,1,2,3,3;
remaining minimum n−c is 3,2,1,0,0. Every row/map/progress snapshot and replay
agrees in both languages. The independent exercise remains about
`[4,1,2,7,0,5,6,3]`, answer 2, after changing simulation preset or locale;
changing its selected answer clears revealed feedback. Recursion and candidate
argmax identity checks are inapplicable to this greedy scan.

Exact-source checks passed for canonical `solution.py` and `python-code.js`,
rendered `textContent`, successful clipboard, denied-copy fallback with sentinel,
actual Linux Control+C and readback, download bytes and offline display, including
the final newline. Stored official evidence offers faithful Python3 and TypeScript;
Python is already selected, so there is no non-Python language contract or omitted
supportedLanguages list to repair. No source regeneration is needed.

### Remaining evidence and next action

The dispatch explicitly requires the unchanged original full suite on native Mac
against this frozen repair. No Mac browser is available in this session. Linux
passes and synthetic font checks cannot satisfy that platform-specific condition.
Next: transfer the receipt-matching candidate to Mac, run the unchanged
`node leetcode/765/tests/test_browser.cjs` with separate OUTPUT_DIR, inspect all
presets in both languages at 320/390/desktop after roundtrip, and attach results,
host/browser details, screenshot inspection and candidate hashes. Then a separate
reviewer must assess the complete lesson and finding normally. No registration,
acceptance-state change, commit, publication or deployment was performed.

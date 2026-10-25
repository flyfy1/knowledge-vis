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

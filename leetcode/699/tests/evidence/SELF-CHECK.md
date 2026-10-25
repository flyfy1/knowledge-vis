# #699 author self-check — candidate v2

Date: 2026-10-25. Status: complete author candidate, independent lesson review
pending. No commit, registration, push, deployment or service change performed.
Scope is only leetcode/699/. This report is not a separate reviewer verdict.
Candidate identity: candidate-manifest.json (source/metadata/test SHA-256s).

## Official contract

provenance/official.json records an actual HTTP 200 public GraphQL response,
request, access timestamp and exact catalog official URL. Statement, both official
examples, bounds, side-contact exception and all observed starter interfaces are
retained. Python3 callable exactly matches the canonical solution. Python is the
preferred faithful language, so a non-Python exception contract is not needed.
No paywall or authenticated access used. No actual LeetCode submission was made.

## Commands and observed results

Commands ran from the repository root. Reproduction instructions: ../README.md.
All result-emitting tests accept LESSON_OUTPUT_DIR to preserve this evidence.

|Command|Observed result|
|---|---|
|`python3 -B leetcode/699/tests/test_solution.py`|23,226 cases passed; no mutation; both official examples; all lengths 1–4 over left 1–4 / side 1–3; 600 seed-699 cases; three n=1000 cases including identical maximum-size squares reaching 10⁹|
|`node leetcode/699/tests/test_core.cjs`|600 independent oracle cases; 264,602 intermediate frames; frozen tops, support tests, candidate identity, base before/after, global prefix output, deep snapshots and exact source mirror passed|
|`node leetcode/699/tests/browser.cjs`|Both locales, six presets, every event, back/forward replay, reset/end endpoints, hand-left 2/3/4, all three prediction choices then reveal/change, locale preservation, independent quiz state, exact source display/copy/download, forced manual-copy fallback, blocked storage, actual keyboard operations, all five sticky nav links and both related deep targets passed|
|`node leetcode/699/tests/accessibility.cjs`|Both locales at 320/390, every closed preset label measured with actual computed font; keyboard horizontal scroll; candidate #3 testing #1/top3 with base0→3; focused control retained across locale repaint; 15 control/link/choice targets at least 48×48 CSS px|
|`python3 -B scripts/register_leetcode_lesson.py 699 --validate-only`|Exit 0, no stdout/stderr. See preflight.txt. No registration performed.|

Canonical oracle is a compressed skyline with range assignment, not a second
copy of the pair-overlap recurrence. Every output prefix is compared. Maximum
coordinates and sides, single square, disjoint/touching/contained/repeated
footprints and a bridge over a gap are covered. Browser model does not execute
Python; original Python execution is separately documented in python-results.json.

Initial findings are preserved in initial-findings.json. Two test-harness errors
(one-square alias test and smooth-scroll sampling) were corrected without changing
runtime behavior. A real 46px control-height issue was repaired in local CSS for
candidate v2; affected checks then passed. No prior independent review exists or
has been rewritten.

## Rendered and source evidence

browser-results.json contains actual bilingual readouts/feedback, viewport
coverage, computed color pairs, network/error arrays and transfer evidence.
Every native and fallback clipboard readback matched solution.py, including its
final newline. Each fallback began with a distinct non-source sentinel; actual
host shortcut was Control+C on Linux. Download bytes, code textContent and decoded
mirror match the canonical file exactly. Copy feedback remains distinct from
algorithm feedback in both locales; changing prediction clears old explanation.

At 320/390/736/1440 widths, the document had no horizontal overflow. A fixed
minimum SVG width and 490px data tables intentionally scroll within labeled,
keyboard-focusable regions; labels remain at legible size. 200% CSS zoom was
exercised on a 1440px desktop viewport in both locales, with screenshots. This is
a controlled headless reflow check, not a claim about physical device/browser chrome.
Forced-colors and reduced-motion modes retain a 3px focus outline.

Measured text contrast: body 16.09:1, panel 14.70:1, readout 13.40:1, hint 7.74:1,
table header 7.08:1, disabled text 6.45:1, selected locale 13.10:1. All exceed
normal-text AA; primary reading text exceeds 7:1. Focus is shared --accent2 on
the dark surfaces with 3px width / 4px offset; no opacity is applied. CSS shipped:
9425 shared + 1658 local = 11083 bytes (<25000). No fonts, images, trackers or
assets are loaded from external origins. No console/page errors, failed local
asset requests or external runtime requests observed.

The author visually opened and inspected header-en-320.png, plot-en-320.png,
checks-zh-320.png, zoom200-zh.png, selected-en-320.png, selected-zh-320.png,
table-right-en-320.png, plot-zh-1440.png and right-scroll plot captures. Checked
readable square IDs, true square proportions, bridge gap, cumulative geometry,
full native selected label, table base-before/after values, narrow wrapping and
zoomed labels. initial-v1-stage-en-320.png preserves the earlier 46px button
candidate; its sticky-navigation stripe is a tall-element screenshot artifact,
not a final viewport claim. Final sticky-target geometry is tested by navigation.

## Evidence boundary

All checks are author self-checks in headless Chromium on Linux. No independent
acceptance, measured novice teach-back, native Mac/phone testing, public delivery,
capacity testing or accepted online submission is claimed. Next action is a
fresh separate reviewer cold walkthrough of this frozen candidate, followed by
source/oracle/device audit under the existing six-dimension rubric. Shared
registry, concept map and acceptance/campaign reports remain untouched.

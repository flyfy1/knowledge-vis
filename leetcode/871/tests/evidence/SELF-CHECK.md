# #871 author self-check — 871-author-v1

Author: Codex; exact model identifier unavailable. Date: 2026-10-26.
Status: self-checked author candidate, ready for separate review. Independent
review: pending, no independent score or acceptance. No LeetCode submission,
publication, actual learner trial, real-device test or release claim.

## Official contract and execution
Public official GraphQL capture is provenance/official-graphql.json; URL, date,
Python3 selector/interface and direct HTML challenge are documented in
provenance/verification.md. This is the original supported Python submission,
not a conceptual fallback. Raw captures are never runtime dependencies.

Commands (repository root):
- `python3 -B leetcode/871/tests/test_solution.py`: PASS, 12,140 exhaustive/seeded
  cases against stop-count DP, independent physical-tank subset oracle and the
  baseline extracted and executed from actual lesson HTML. Eight fixed/maximum
  cases include all official examples, 500 stations and target/startFuel 10^9.
  Input preservation checked.
- `node leetcode/871/tests/test_core.cjs`: PASS, same independently derived cases;
  intermediate reach equations, admission counts, unique station identities,
  pool eligibility, largest choice, legal physical reconstruction, repeatability,
  deep snapshot independence; exact source mirror and AST duplicate-key/shape checks.
- `node leetcode/871/tests/browser.cjs`: PASS, real Chromium 156.0.8078.4, Linux.
  See browser-result.json for actual localized feedback/endpoint text and metrics.
- `python3 -B scripts/register_leetcode_lesson.py 871 --validate-only`: PASS,
  exit 0, no stdout/stderr; final command receipt in preflight.json.

All artifact-producing tests accept OUTPUT_DIR. Reproduction instructions are in
../README.md; external output directories preserve this frozen candidate.

## Author reading and visual inspection
This is an author walkthrough, not an independent cold review or novice result.
0: The 25/10/[10,15] arithmetic separates tank fuel from farthest reachable mile.
1: Both subsets are enumerated; the earliest-stop mistake needs 2 stops vs 1.
2: Admission leaves reach/stops unchanged; selection grows reach. Every state
retains a station table and cumulative ledger. Conceptual supply planning is
explicitly distinguished from road-order driving. The proof states why larger
unreachable supplies are excluded and why unlimited capacity permits exchange.
3: All three choices were tried before reveal, and changed answers clear feedback.
The fresh 75/25 case first extends to 55, then admits the station at 50, then 75.
4: Negative heap entries map admission and selection to exact Python operations;
space separates tutorial snapshots from submission auxiliary storage.

Visually opened the generated screenshots using the image viewer: both languages
at 320/390/736/1440 widths and 200% CSS page magnification. Final 320/390 captures
were reinspected after widening the mobile selector. Text wraps within its table
cell; station 3's candidate status and orange ★ operation marker remain distinct;
no value/status collisions or clipped essential diagram labels were observed.
The native closed selector budget uses actual computed font, 20px arrow reserve,
and measured text width; mobile final spare budget >=68.69px. Wider Chinese
intrinsic selector has 0.69px beyond that conservative reserve; screenshot shows
its complete label. CSS stack is shared PingFang SC/Microsoft YaHei/system-ui;
resolved font identity is not inferred. Viewport and control widths are separate
in the final fit records.

Controls: all six presets in both locales, every forward/back replay, reset/end,
range endpoints, disabled boundaries, prediction/reveal/change, locale preservation,
exact displayed/copied/downloaded source and focused selected fallback. Native
fallback transfer used Linux Control+C after a fresh verified distinct clipboard
sentinel for each locale; exact final newline/indentation retained. Keyboard Enter
operated controls and related links; focus outline measured 3px. Denied storage,
forced-colors, reduced motion and offline file:// source/interaction were exercised.
Source disclosure stays native. No automatic playback or asynchronous simulation.

Contrast: actual shared solid role colors evaluated with sRGB luminance formula.
Minimum measured tested text pair 6.449:1 (muted / panel2); core text / panel
14.705:1; focus orange / panel2 8.937:1. See browser-result.json for all pairs.
Shipped CSS: shared 9,425 bytes + local 1,693 bytes = 11,118 bytes (<25,000).
No fonts, trackers or external runtime assets added. Lesson asset failures: zero.
A pre-existing /favicon.ico 404 appears only after visiting related #23, retained
in diagnostics and explicitly excluded from #871 asset failures.

Related links were keyboard-followed in both languages on the existing preview:
#23 step1 describes min-heap parent order, root replacement and one-path sifting;
#42 step1 derives a safe decision from known left/right boundary maxima. Their
actual excerpts and URLs in browser-result.json support these precise link labels.
Public deployed target identity remains a later publisher verification duty.

## Limits and retained diagnostics
Harness corrections/failures are retained in harness-notes.md and the related
navigation diagnostic. No failed run is labeled a pass. Final complete run is
browser-result.json. 200% uses real browser CSS zoom=2, not native browser chrome
zoom; physical devices and native browser chrome zoom remain unverified. Offline
file opening is supported; offline uncached HTTP navigation is not a PWA feature.
Independent review, public delivery verification and actual learner comprehension
remain separate future gates. Author tests do not establish those outcomes.

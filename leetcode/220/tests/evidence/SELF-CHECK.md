# #220 author self-check — candidate 220-author-1

Status: complete author candidate; independent lesson review pending.
Date: 2026-10-18. No independent acceptance, actual novice result, LeetCode
submission result, deployment, registration or publication is claimed.

The problem-local BRIEF preceded implementation. The existing product/design
review and dispatcher adjudication were reused as authorized. Official public
GraphQL evidence verifies the statement, constraints, both official examples
and the actual Python3 method selector. Canonical code is solution.py; the
browser trace is explicitly a separate JavaScript teaching simulation.

## Observed checks

- test_solution.py: 77,013 calls of the canonical Python method matched the
  independent all-position-pairs oracle/closed-form expected cases; no input
  mutation. 1,997 actual-method probe-entry invariants checked with sys.settrace.
  Includes exhaustive n=2..5 over values -2..2, all k and t=0..3, seeded random
  cases, official examples, negative bucket boundaries, inclusive expiry/value
  boundaries and four n=100000 cases.
- test_core.cjs: 5,422 model inputs, 42,032 frames; independent pair oracle,
  live-window membership, bucket identity, exact probe differences, snapshot
  independence and terminal truth. 112 bilingual keys with matching placeholders.
  Exact canonical/offline mirror equality.
- browser.cjs: Chromium 156.0.8078.4, both locales, all eight presets and every
  forward action with backward/forward identity, disabled endpoints, reset/end,
  slider, all three prediction choices/reveal/change, locale preservation of
  trace/choice/reveal, independent quiz versus trace reset. Native clipboard
  write/read and rejected API manual selection; displayed, copied and actual
  downloaded Python all exactly match solution.py.
- Widths 320/390/736/1440 in both languages, official example 2 probe action 17;
  no page overflow or essential component text clipping. Deep-link target lands
  below the sticky nav after smooth scrolling settles. 200% CSS zoom at 1280
  in both locales reflows the populated diagram.
- browser-extra.cjs: all 8 preset final states at 320/390 in both languages
  (32 checks), 48px button/select/nav minimums, Home/End on range control,
  file:// offline source and live interaction. Storage denied/fetch blocked,
  forced colors, reduced motion, native Space/Tab focus checks also pass.
- Zero observed runtime console/page/asset errors; runtime requests remain local.
  All related targets exist. No external fonts/assets.
- Measured text contrast: body 16.09:1, muted on panel 7.08:1, disabled/muted on
  panel2 6.45:1, primary/link 13.10:1, selected hand button 10.73:1.
  Focus orange versus panel2 8.94:1. Exact shared palette retained.
  Combined shipped shared+local CSS is 12,153 bytes.
- Required preflight executed from repository root:
  python3 -B scripts/register_leetcode_lesson.py 220 --validate-only
  Exit 0, empty stdout/stderr. Full command/result/time in metadata-preflight.json.
  No registration or shared metadata writes occurred.

## Visual inspection and repairs

The author visually opened the ten populated trace/zoom screenshots plus narrow
headers and extreme-value screenshots. Input value/position association, stored
bucket ranges, current/witness text and probe detail remain readable. Horizontal
step navigation deliberately scrolls at narrow widths; data cards and bucket
panels reflow. The hand-calculation table is a focusable contained horizontal
scroll region.

Early self-checks found (1) a measurement before smooth scrolling finished,
(2) inherited flex shrink causing nav labels to overlap, (3) a missing favicon
request, and (4) inherited selected-primary styling making the hand button text
too dark. The harness now waits for settled anchor geometry; local CSS prevents
nav shrink and uses shared orange/bg for the selected hand button; the page uses
an empty inline favicon. The final full browser rerun passed, including the
new selected-state contrast measurement; final screenshots replace development
captures. These were author fixes, not independent-review findings or closures.

The English/Chinese walkthrough supports the same reasoning: manually separate
the two distances; discard expired positions; derive width t+1; prove own and
adjacent buckets cover every possible match; reject adjacency without a value
check; use the expiry invariant on the unseen prediction; map one default hit
to the second Python if. This is the author's explanation audit, not evidence
of actual learner comprehension.

## Boundaries and next gate

Only desktop headless Chromium device emulation and CSS zoom were exercised;
physical devices, screen readers, native browser-menu zoom and production
delivery are unverified. No human learner study occurred. Separate independent
cold teaching review of the hashes in candidate-sha256.json is required next.
No campaigns, acceptance records, shared assets, registries or other lessons
were edited. Reproducible commands and output-directory overrides are in
../README.md. Raw test reports and screenshots are review material, not runtime
assets.

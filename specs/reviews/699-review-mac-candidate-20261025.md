# Dispatcher Mac verification — #699

Frozen candidate: `f7c327b4cd6cf3ba04779e034952c7e22d912ba6`.
Date: 2026-10-25. Supplemental verification; independent acceptance pending.
All 158 selected exported tracked files match immutable Git bytes before and
after original tests and supplemental diagnostics. Candidate files and original
assertions remain unchanged. Outputs are separate from the frozen archive.

## Correctness and source checks

Canonical Python passed 23,226 cases against a separate coordinate-compressed
skyline oracle, including exhaustive small positions, 600 seeded cases, official
examples and three n=1000 boundaries. Input nonmutation and nondecreasing prefix
maxima passed. The core checked 264,602 frames over the 600 oracle fixtures:
prefix answers, landed bottoms/tops, positive-width overlaps, ordered checks,
running support maximum, highest output and snapshot independence. Exact source
mirror, 94 nonduplicate copy keys and local CSS budget passed (11,083 bytes).

## Original browser failure and isolated native reproduction

The original browser command exits 1 at its native `#handLeft` keyboard test:
starting at value4, Home → ArrowDown → Enter expects value3 but observes value4.
All earlier assertions completed: both locales' hand cases, full preset traces,
rewind/replay/reset, prediction feedback/state preservation, exact source display,
clipboard/download and sentinel-seeded actual Meta+C fallback. No final browser
JSON was emitted. This execution boundary is not a claim that the whole browser
suite passed; its later viewport/zoom, anchors, contrast, forced-colors and
storage-denial sections were not reached on Mac.

Ranked hypotheses before diagnostic testing were native host key behavior versus
Linux assumptions, application interception, or focus loss after clipboard use.
A fresh focused probe applies the same sequence to both the actual lesson select
and a plain native select copied into a document with no handlers. On Mac
Chromium151.0.7922.34 both remain value4 after each key; focus stays on the select
throughout. The application-interception and focus-loss explanations do not
account for this reproduction. Underlying native/automation behavior remains
unresolved. No product fix or native keyboard success is claimed. The original
red command/log is retained, with no selectOption substitute used to turn its
assertion green.

## Independent accessibility command

The original `accessibility.cjs` was then run separately, unchanged. It passes
28 measurements (24 preset/locale/width labels plus four event bindings), native
focus preservation across locale repaint, actual keyboard horizontal plot
scrolling, table overflow access and 15 visible controls/links with both
dimensions at least48px. Its 16px arrow reserve is a documented Linux diagnostic,
not a universal Mac metric. Inspected the English320 closed selection: full
“Official example 2: touch” and arrow are visible. Inspected the right-scrolled
English support table and Chinese touching-square plot: the selected end of
these intentionally horizontal regions remains accessible. These captures do
not claim that the entire table/plot is simultaneously visible at320px.

At event6, both languages identify square3 testing square1/top3, endpoints3/4,
positive overlap and base0→3; output stays [3,3] with later answers pending.
No uncomputed support or final answer is presented as complete at this step.

Evidence: `699-evidence/mac-candidate-f7c327b-20261025/`, including unchanged
original runner/log/receipt, separate diagnostic runner, native control fixture,
results and inspected screenshots. The full Mac browser result remains failed
at the native key assertion; this report preserves that platform coverage gap.
No physical-device, public-delivery or judge-acceptance claim follows. The
separate lesson reviewer must independently assess the actual candidate.

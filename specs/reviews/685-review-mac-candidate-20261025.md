# Dispatcher Mac verification — #685

Frozen candidate: `cfba14ba99348ea5d37d88f770b9ae595e3b7c4c`.
Date: 2026-10-25. Supplemental platform verification, not independent lesson
acceptance. All 138 selected tracked files in the frozen archive matched their
recorded immutable Git bytes before and after testing. Outputs stayed outside
the candidate. The original tests ran without adapters or source changes.

Python passed 9,049 cases: exhaustive n=3/4, 1,000 seeded trees, three maximum
n=1000 cases and six named cases. Canonical input nonmutation, duplicate copy
keys and exact offline mirror parity were checked. The core passed 9,046
fixtures and 127,788 frames, checking independent connectivity partitions,
before/after snapshots, incoming-edge indices, union-find representatives and
sizes, rejection/merge preconditions and an independent final oracle.

The browser suite passed 26 semantic observations and 10 layout observations.
Both locales cover every frame of five presets, rewind/replay/endpoints, hand
removals, all prediction choices and locale preservation. Root ambiguity is
explicitly reported as reachability not tested. The final removal is separate
from the edge that detects the cycle. Exact displayed/embedded/copied/downloaded
source parity includes the final newline. Manual-copy fallback seeds a distinct
non-source sentinel separately for each locale, denies programmatic copying,
checks focused full selection, dispatches native Meta+C and reads the clipboard
back. The result's historical prose says Linux Control+C; its hostPlatform is
darwin and the unchanged test chooses Meta+C using os.platform(). That prose
is not evidence of a Linux run or a different shortcut.

Native Tab/Enter and 3px focus, forced colors, reduced motion, related links,
anchor positions, denied storage and local-file opening passed. Minimum sampled
contrast was 7.07885:1. Combined shared/local CSS measured 11,778 bytes.

Visually inspected English 320px and Chinese 390px intermediate traces. At
operation 7/9 the 4→2 merge changes {1,2}·{3}·{4} to {1,2,4}·{3}; the next edge
remains pending and the later parent edge is explicitly skipped. The enlarged
English final frame shows removal of earlier row 1, 2→1, while row 4, 1→4 is
marked as the rejected cycle closure. The caption explicitly says this remains
the detection graph before deletion. Labels, table states and history remain
readable in these inspected captures.

Zoom evidence is CSS zoom:2, not browser-chrome zoom or a physical-device test.
The long stage screenshots hide the sticky navigation only during capture;
normal navigation is checked separately by the original suite. No public
release, online judge submission or learning outcome is claimed. The separate
reviewer remains responsible for lesson acceptance.

Evidence and original runner: `685-evidence/mac-candidate-cfba14b-20261025/`.
Original JSON labels say author self-check; these are dispatcher reruns on the
Mac against the frozen candidate, not a substitute for independent review.

## Required native-selector finding after the broad suite

Independent review `685-review-1-6f12f2a6.md` rejected this candidate at 88.75/100
with required finding 685-R1-001. Its longest English preset hides the word
“row” at 320px. This supersedes any inference of complete device readiness from
the passing broad checks above; those checks did not inspect that closed value.

A dispatcher probe against the unchanged frozen candidate reproduces the same
failure on Mac Chromium: 20 preset × locale × width records, one necessary
text-fit failure. English preset 3 at 320px measures 230.12794494628906px of text
against 230px of content width even before reserving arrow space. The inspected
ordinary element screenshot visibly reads “Answer precedes the last”; at 390px
it reads the complete “Answer precedes the last row”. The probe exits 1; the
wrapper's CalledProcessError represents this expected red assertion. The saved
computed font stack is not a claim about the exact resolved font.

Ranked predictions before further testing: (1) label width exceeds native space,
so changing only its length should restore the complete selected value; (2)
locale switching changes the actual label, which would produce different text
before/after a roundtrip; (3) capture obstruction hides the end, which an isolated
ordinary control capture would remove. The current 320/390 comparison and
isolated captures support the first explanation. The independent review also
reproduced the failure after EN→ZH→EN. Repair and unchanged regression rerun are
pending; this record does not close the finding.

Original probe, results and inspected screenshots:
`685-evidence/mac-native-clipping-20261025/`. The zero-arrow width check only
proves definite overflow for this single-line original. Passing this necessary
check alone would not prove arrow clearance or support a wrapping repair.

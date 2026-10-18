# Author self-check — #126

Status: complete candidate for a separate independent review; no independent
acceptance, deployment, actual learner outcome or LeetCode submission is claimed.
Only `leetcode/126/` was authored. Shared registry, assets, scripts, workflow and
services were untouched.

Official contract: `provenance/official.json` and `provenance/README.md`. The public
GraphQL Python3 selector confirms the exact submission interface. The problem
brief was written before implementation and carries forward the approved design.

Computational evidence: `tests/evidence/numerical.json`. The real Python solution
matches an independently derived simple-path oracle on 499 cases: all 255
nonempty subsets of the 3-letter binary dictionary, 240 seeded two-letter cases,
and four explicit examples/boundaries. Every browser-model snapshot has correct
shortest distances, legal increasing parent edges, no duplicate parents and
monotonic parent retention. Terminal parent sets are complete. The 500-word,
5-character boundary and 120-route cube pass. The displayed baseline is executed
against oracle cases as well. Canonical source/mirror parity is exact.

Browser evidence: `tests/evidence/browser.json` and matching screenshots. Chromium
covers both locales and every preset, trace controls, all prediction options,
feedback clearing and language-after-interaction, source display/copy/download,
clipboard denial fallback, keyboard Enter/Tab, visible focus, offline interactions,
storage denial, forced colors/reduced motion, local links/anchors and asset errors.
Widths are 320/390/736/1440px. Zoom checks use 200% CSS zoom plus 720px desktop
reflow; these are emulations, not physical-device or browser-UI zoom evidence.

Visual inspection: inspected full-page English 390px capture and focused parent
layers at English 320px and Chinese 1440px, plus the Chinese reflow capture. The
layer groups stay in order, word labels remain readable, the two parents of cog
are visible, and cards stack on narrow screens. Inspected the final enlarged
parent-layer captures in both languages and the 320px headers. A capture-only
style hides sticky navigation in the tall zoom element screenshots, avoiding
a stitching overlay; normal navigation/anchor geometry is tested separately. The horizontal navigation is deliberately
scrollable. Long source code has its own keyboard-focusable scroll area.

Accessibility measurements are in the browser JSON. Shared text is ≥13.39:1 on
all three surfaces; muted disabled/control text has a lowest palette contrast of
6.44:1, above AA. Rendered explanatory text and active states are measured, rather
than inferred solely from tokens. Focus is a 3px orange outline with offset;
controls/locale buttons meet the 48px target minimum. Total shared+local CSS stays
below 25,000 bytes. No external fonts/assets or runtime data fetches are used.

Evidence limits: this is an author self-check. Separate cold teaching review,
physical mobile devices, true browser-toolbar zoom, novice teach-back, accepted
LeetCode submission and public delivery remain unverified. Registry/concept-map
integration belongs to the dispatcher after independent acceptance.

Harness notes: the first anchor-position assertion sampled smooth scrolling too
early; the reproducible suite uses reduced motion and checks actual anchor
geometry. One later browser run closed while an extra Chromium screenshot run
was active; the full suite was rerun sequentially. These interrupted runs are
not used as passing evidence. The completed report is `browser.json`.

Final inspection also confirmed both 320px headers fit without truncation and
both 200% enlarged parent-layer captures retain readable labels and complete
parent lists. The terminal next-step label distinguishes reconstruction from
word expansion; absent-end verification has its own localized action label.

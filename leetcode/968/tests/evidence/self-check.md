# #968 author self-check

Candidate: 968-author-20261026-v1. Author: Codex in the author run; exact model identifier unavailable. Review status: independent review pending. This report records author checks, not learner outcomes, independent acceptance, LeetCode submission acceptance or public delivery.

## Executed checks

From repository root, all final commands exited 0:

- `python3 -B leetcode/968/tests/test_solution.py`: 2056 ordered shapes (n=0..8), 160 seeded cases (seed 968), official examples 1/2, unmodified input objects/links/values, defensive empty, both 1000-node chain orientations → 334. Details: python-results.json.
- `node leetcode/968/tests/test_core.cjs`: 630 trees, 4931 frames. Independent edge/subset oracle, all descendant demands covered at each return, current N obligation, saved return semantics, camera counts/identities, child operands and root repair; exact source mirror and unique two-string bilingual keys. Details: core-results.json.
- `node leetcode/968/tests/browser.cjs`: actual headless Chromium at provided preview. Both languages × all five presets, first/middle/end/reset/back/replay, independent hand toggle, every prediction choice/reveal/change, language state, code/disclosure, downloads, Clipboard API and native Linux Control+C fallback with newly verified sentinel before each locale attempt. 320/390/736/1440 CSS px, 200% CSS zoom with navigation target visible, focus/Tab/Enter, forced colors/reduced motion, storage denial, related anchor existence. Zero console/page/HTTP asset errors; runtime requests stayed on preview origin. Details and bilingual rendered trace/feedback strings: browser-results.json.
- `node leetcode/968/tests/offline.cjs`: file:// source parity in both locales, local interaction, complete preset label widths at 320px. Details: offline-results.json.
- `node leetcode/968/tests/capture_focus.cjs`: focused screenshots with reduced motion to avoid capturing a scrolling transition; actual ArrowRight horizontal keyboard scroll verified.
- `python3 -B scripts/register_leetcode_lesson.py 968 --validate-only`: exit 0, empty output, no registration. Exact final result in metadata-preflight.json.

All result/screenshot-producing tests support LESSON_EVIDENCE_DIR; rerun instructions are in ../README.md. Default evidence is in this folder; reviewers should use a separate output directory.

## Visual inspection and accessibility

Author visually opened focused EN intro at 390, ZH exercise at 390, ZH desktop trace, EN diagram right edge at 390, both 320 trace views and both 200% zoom exercise views; reopened EN 390 end-state diagram/ledger to inspect disabled controls and historical N states. Final 320 selector and settled ZH zoom were reinspected after fixes. Text wraps in both locales, labels stay legible, tree identities and letters do not overlap, old N return states are explained beside the diagram, final disabled controls use opaque muted text, and the offscreen tree region is explicitly scrollable with a text ledger. Zoom screenshots use 200% browser CSS zoom, not OS scaling. Full-page stage captures can include a sticky nav overlay at a capture-dependent location; focused screenshots and live anchor geometry establish actual navigation behavior.

Measured contrast in browser-results.json: main text/panel 14.70:1, muted/panel 7.08:1, minimum muted/panel2 6.45:1 (above AA, below the 7:1 aspirational target). Accent2 focus against panel2 8.94:1; actual keyboard focus is solid 3px. Primary dark text/cyan uses the same 13.10:1 pair in reverse. Disabled controls retain full-opacity muted/panel2. Shared plus local CSS is under 12000 bytes, below the 25000-byte cap. No external runtime fonts, imagery, trackers or assets.

## Author corrections before freeze

Initial core assertion treated every saved N as a current uncovered flag; a later parent camera legitimately covers an old N. Corrected the check to the return-time obligation and added bilingual diagram-local explanation; core/runtime rule was unchanged. An early navigation assertion sampled smooth scroll before settling; it now waits for target geometry. Initial screenshots exposed an active-looking inherited primary disabled button and a clipped long native select label at 320px. Local disabled styling, shorter labels and full-width selector were applied and rerun. A conservative selector width check first rejected the intrinsic-width selector; it passes on the final full-width field. These are author corrections, not independent-review finding closures. Focused final captures use reduced motion to keep screenshots stable.

## Evidence limits

No independent reviewer, cold learner walkthrough, novice teach-back, LeetCode submission, real-device observation, OS zoom control, deployment or public-origin verification occurred. Mobile widths, CSS zoom and clipboard behavior were checked in local headless Chromium on Linux. Python is executed in local tests; lesson trace is a separate JavaScript simulation. Official statement and interface are sourced from the captured successful public GraphQL response; direct HTML challenge capture is retained as a failed access attempt. Candidate runtime and tests are bound by SHA-256 manifest. Separate review must assess this candidate rather than inherit author confidence.

# #60 author self-check — 2026-10-18

Status: complete author candidate, ready for a separate independent lesson review. This report is written by the implementing run. It is not independent acceptance, actual novice evidence, a LeetCode acceptance result, or a deployment record. No agents were spawned; no registry/shared assets were edited; no commit/push/deployment was performed.

Preview: http://127.0.0.1:18770/leetcode/60/

Contract: public [official statement](https://leetcode.com/problems/permutation-sequence/) and public GraphQL verified on 2026-10-18. The captured response is [tests/official-contract.json](tests/official-contract.json), including the Python3 interface. Chinese prose/title are authored translations. Input is valid integers n=1..9, k=1..n!, with one-based ordering and a string result.

## Computational evidence

- Python: all 5,913 ranks through n=7 independently enumerated by itertools; 1,004 n=8/9 endpoint/seeded cases checked by inversion ranking; endpoints for every n=1..9; all three official examples; exact embedded-source equality. [Report](tests/evidence/python-results.json).
- JavaScript visual model: 6,989 cases, 56,322 frames checked against separate recursive enumeration and inversion ranking. Every frame checks prefix/unused digit conservation, sorted unused digits, 0≤r<m!, exact before-state snapshots, q·block+remainder=old rank, removed digit, factorial size, deterministic replay and full target prefix. Exact factorial boundaries and invalid simulation inputs are included. [Report](tests/evidence/core-results.json).
- Python remains canonical; JavaScript generates visual state only. Tutorial snapshots use O(n²) memory; the Python submission uses O(n) auxiliary space. Its list removal accounts for O(n²) time.

## Rendered browser evidence

Actual headless Chromium used the already-running preview; launch honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. [Browser report](tests/evidence/browser-results.json) records actual requests, zero console/page/asset errors, measured color pairs and pass status.

Both locales exercised all six presets, each forward/back/forward transition, start/end/reset, maximum custom input, invalid rank and noninteger inputs, keyboard Enter/Space and range Home/End/arrows, keyboard horizontal ledger scrolling, every prediction choice, explicit reveal, changed-choice clearing and language-after-reveal state preservation. Preset and trace controls preserve the separate prediction. Language also preserves custom field edits, disclosure, frame position and useful focus.

Native browser clipboard write/read was checked, then captured-argument and denied-clipboard paths. The fallback focuses/selects a readonly textarea. Displayed, copied, fallback and downloaded Python equal solution.py exactly. Source and experiment also worked through file:// in an offline browser context. Denied localStorage fell back to memory without losing the active state.

Screenshots: EN/ZH at 320, 390, 736 and 1440 CSS-pixel widths; EN/ZH 200% CSS content zoom in a 640px viewport (320px equivalent content width); EN/ZH 736×414 landscape; separate header, unrevealed/revealed retrieval states and forced-colors focus. Content zoom is explicitly browser CSS zoom, not physical-device or OS scaling. The 19 saved PNGs were opened and visually inspected by the author; block ranges, chosen labels, retrieval visibility, responsive text and focus were checked. No document overflow; narrow two-dimensional ledger scroll stays contained and keyboard-accessible. Core blocks reflow instead of shrinking labels.

Rapid viewport/zoom/media changes initially produced intermittent Chromium screenshot raster artifacts (missing pieces of radio labels/borders); source geometry and a fresh browser capture showed intact controls. The interaction test waits for paint and disables GPU rasterization. The final [capture report](tests/evidence/capture-results.json) comes from tests/capture.cjs, which starts a fresh Chromium process per screenshot to avoid retained cross-capture raster artifacts. Run it after browser.cjs. This is a screenshot-capture qualification, not a claim of testing a physical browser toolbar or phone.

Computed contrast: main prose 12.62:1, block data 13.40:1, chosen block label 10.91:1, primary action 13.10:1, disabled text 6.45:1, incorrect feedback 6.35:1, correct feedback 10.00:1. All measured text pairs exceed AA 4.5:1; core prose/data exceed the 7:1 target. The reused muted/error roles are explicitly below that target where reported. Focus against panel2 is 8.94:1, with a 3px separated outline. Buttons, select, numeric/range controls and choice-label targets measured at least 48×48px. Forced-colors and reduced-motion branches were exercised.

Shared+local shipped CSS: 11,941 bytes, below 25,000. Fonts and assets remain local; no external assets are requested. Related targets #4/step1 and #51/step1 exist and return successfully. All five sticky section links were actually clicked and checked against target geometry.

## Author reconstruction of the learning path

These are author observations, not novice teach-back or independent scores.

1. The six n=3 strings make k=4 → 231 hand-checkable, and distinguish the last item of a block from the first of the next.
2. Fixing a next digit leaves (m−1)! completions. For n=4, k=6 stays in the first block while k=7 enters the second. Subtracting one exactly once makes both boundaries correct.
3. A digit moves from sorted unused to prefix; rank becomes the remainder. The selected interval, before/after state and cumulative ledger show the same completed operation. Rewinding restores all of them.
4. Fresh n=5,k=49 prediction stays unrevealed until a choice and explicit check. Both distractors explain concrete rank errors; changing the answer clears feedback.
5. divmod chooses a unique block; pop preserves remaining order and removes one digit. The decreasing unused count proves termination. The matching Python lines, independent oracle and endpoints support implementation transfer without claiming actual learner success.

## Reproduction and review boundary

Use [tests/README.md](tests/README.md). All result/screenshot-producing test scripts accept OUTPUT_DIR, so a reviewer can rerun into a separate folder without modifying the candidate. Python bytecode writing is disabled. [Candidate hashes](tests/candidate-sha256.json) identify lesson sources, tests and the reused shared assets; no commit is created for this author run.

Next action belongs to the dispatcher: freeze this candidate and commission a fresh, separate cold walkthrough under the six-dimension rubric. Registry/concept-map integration is outside this author's ownership. Independent acceptance, physical devices/virtual keyboards, actual novice transfer, accepted submission and public delivery remain unverified.

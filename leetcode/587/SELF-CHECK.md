# #587 author self-check — candidate C1

Status: ready for a separate independent review. This is the author run only. No independent acceptance, actual learner outcome, real-device result, deployment, or LeetCode submission acceptance is claimed. Only `leetcode/587/` was authored; shared assets, registry, campaign records and services were not changed.

## Verified contract and implemented learning path

Official statement and public GraphQL were accessed on 2026-10-25. `provenance/official.json` preserves the actual content, access timestamp, complete returned language snippets, and Python3 callable. Python is the preferred, faithful submission language. The statement includes all straight-edge trees and permits arbitrary result order. Official examples, unique positions, nonempty n≤3000, coordinates 0..100, and line/singleton degeneracies were checked. There is no required input mutation.

The approved collection design is reused, as authorized by the owner and documented in BRIEF.md. The local diagram uses ordinary coordinate points and two chains, with a complete operation history. It is explicitly a JavaScript simulation, separate from Python execution. Shared tokens are imported exactly. The first tiny garden has five perimeter trees, including (1,0), and one enclosed interior tree (1,1). The signed-turn experiment exposes +2,0,−2 before the strict removal rule. The trace derives repeated end repair and both oriented boundary chains. The fresh exercise starts from the valid lower chain [(0,0),(1,1),(2,3)] (initial cross=+1), tests −5 then −3, removes two points, and preserves the first endpoint. The exact canonical code and costs follow.

## Reproduction and observed results

Commands were run from the repository root; tests/README.md documents environment and output overrides.

- `python3 -B leetcode/587/tests/check_algorithm.py` — passed 920 canonical Python cases: 511 nonempty exhaustive 3x3 subsets, 400 seeded cases, 6 presets, 2 explicit extremes, and a 3000-tree grid with independently specified rim. Inputs preserved, result coordinates unique. The independent oracle checks supporting-line equations rather than building chains.
- That command also ran `tests/check_core.cjs` on 919 cases and 34,955 intermediate snapshots. Observed 14,520 appends, 7,682 pops and 9,077 keep comparisons. Every append has supported edges and no right turns; straight-edge points remain. Every removal matches its own triple/value/removed point. Snapshots reproduce exactly. Canonical/offline strings match; 95 localization keys are unique before parsing and all pairs contain both strings.
- `node leetcode/587/tests/browser.cjs` — passed real Chromium tests on the existing preview. `tests/evidence/browser.json` retains 96 representative localized state records, including actual operands, labels and feedback. Both locales traversed every preset and operation, endpoints, reset/jump and rewind/replay. All turn controls, overlay states, three prediction choices, reveal/change/reset, independent experiment state, and locale-after-reveal paths passed.
- Full Python source matched rendered textContent, clipboard contents, manually selected/copied fallback contents, and downloaded bytes, including the final newline, in both languages. Clipboard denial and blocked storage were exercised. Offline file:// source display and Chinese switching passed. Native keyboard Enter/Space, useful focus and 3px focus outline passed. All local links and target anchors resolved. Console, request and local-asset error lists were empty.
- Widths 320,390,736,1440 were exercised in each locale, with no document overflow. Every preset's advertised result matches its independent expected result. The 500px plot is intentionally scrollable on phones, with left/right extremes tested and separately captured. CSS zoom=2 at a 720x500 viewport was used as a 200% layout stress test; this is an emulation, not physical-device or browser-toolbar zoom evidence.
- Measured rendered text pairs have minimum contrast 6.449:1 (disabled muted text on panel2), main text 16.087:1, correct feedback 10.005:1, selected primary text 13.101:1. Focus orange against panel2 is 8.937:1. Disabled controls have opacity 1. Shared plus local CSS totals 11,683 uncompressed bytes, below 25,000. Reduced motion and forced-colors styling are present; reduced-motion browser preference was used. No external runtime assets are requested.
- `python3 -B scripts/register_leetcode_lesson.py 587 --validate-only` — exit code 0, no stdout/stderr. `tests/evidence/preflight.json` records this root command, timestamp and result. This was validation only, with no registration or shared metadata changes.

## Visual inspection and self-walkthrough

The author opened and visually inspected the headless evidence: both locales at 320/390/736/1440, zoom stress screenshots, full desktop plots and phone left/right plot crops. Readouts wrap, A/B/C stay attached to the displayed cross value, controls reflow, and the plot has readable 16px minimum coordinate labels with an explicit horizontal-scroll instruction. The focused repeated-pop state shows B=(2,5) disconnected from the lower chain, C=(3,0) pending, and the surviving line ending at (1,2). The right phone crop shows C's coordinate and x=3 tick; the left crop shows the surviving prefix. These are views of a partial chain, not a falsely completed fence. Sticky navigation explains why viewport screenshots can omit earlier content; focused plot captures include the complete graph.

Author walkthrough observations (not a learner study): step0 distinguishes enclosing from touching; step1 explains why zero must survive; step2 ties each comparison/removal/append to the retained prefix and cumulative history; step3 needs a second test rather than a single pop; step4 maps the strict while loop, reverse scan and unique union to the actual submission. The visible determinant is complete in both languages. Related anchors lead to integer line normalization (#149) and stack repair (#84).

An early browser run found a too-wide English preset selector at 320px; labels were shortened and its width constrained before the passing run. A later test-harness assertion assumed ASCII parentheses in Chinese output; it was corrected to honor full-width Chinese punctuation. `resolved-harness-failure.txt` preserves that resolved harness failure, not an open product failure. The final `browser.json` has no errors.

## Frozen candidate and remaining gate

CANDIDATE.json hashes the final lesson, tests, brief, metadata, this self-check and official evidence, plus the read-only shared assets used. Output evidence is kept separate so reviewers can rerun into EVIDENCE_DIR without modifying candidate sources. The metadata has no review-time repairs or earlier accepted revision in this run. Independent reviewer cold walkthrough, six-dimension rubric and finding closure remain the next dispatcher-owned gate. No agents were spawned, no registry registration was performed, and no deployment was attempted.

## R1 revision self-check — 587-R1-F1 (2026-10-25)

This append supersedes C1's readiness claim for the current files. The historical independent report `specs/reviews/587-review-1-da1b547a.md` remains unchanged: candidate `3dcdc9d79d62799195aafc8de4f0fc1131d4826c` required changes. Current finding status: **fixed awaiting independent review**, not closed or accepted. `CANDIDATE.json` freezes the new C2 source hashes. No commit or publication was performed.

Fix mapping: **587-R1-F1 → copy.js preset0…preset5; index.html copy asset version; tests/preset-scope.cjs.** Every English count now explicitly says “boundary tree(s).” Thus Garden's five boundary trees are distinguished from its six input coordinates; Official 1 likewise has six inputs/five boundary trees; the repeated-pop example has four inputs/three boundary trees. English names “Garden” and “Two pops” keep the entire selected text visible at 320px. Chinese wording, algorithms, source, state ownership, layout and shared assets are unchanged. The report identified a copy accounting-scope error; no algorithm repair was warranted. This is a narrow correction under the existing design contract, with no new feature/layout requiring design adjudication.

The failing feedback loop was run before editing: `EVIDENCE_DIR=leetcode/587/tests/evidence/r1-fix-before node leetcode/587/tests/preset-scope.cjs` exited 1 on the real rendered selector: `587-R1-F1: preset 0, en, 1365, event 0: Tiny garden · 5 trees`. Failure evidence and the previous C1 manifest are retained in that directory. The cause was the English dictionary omitting the boundary qualifier already present in Chinese. This was a direct copy defect, not a hard algorithm bug; speculative hypothesis ranking/instrumentation was unnecessary.

Final passing commands, from the repository root:

- `EVIDENCE_DIR=leetcode/587/tests/evidence/r1-fix node leetcode/587/tests/preset-scope.cjs` — exit 0; 72 records across EN/zh, six presets, widths 1365/320/390, initial/event-4 states, locale-switch preservation and final boundary counts. Independently hand-calculated input counts [6,6,3,1,4,4] and boundary counts [5,5,3,1,4,3] are asserted separately. Selected label text fits beside the native arrow. `preset-scope.json` records expected counts, actual labels, full input readouts and progress; twelve final selector screenshots cover Garden and Two pops in both locales at each width.
- `EVIDENCE_DIR=leetcode/587/tests/evidence/r1-fix PYTHONDONTWRITEBYTECODE=1 python3 -B leetcode/587/tests/check_algorithm.py` — exit 0; actual canonical Python, 920 cases including the 3000-point limit, supporting-line oracle, preserved inputs, and 34,955 trace frames. All 95 bilingual keys remain unique and complete; canonical/offline source equality includes the final newline. Only label strings changed after this run; the final browser rerun and scope regression verify those strings.
- `EVIDENCE_DIR=leetcode/587/tests/evidence/r1-fix node leetcode/587/tests/browser.cjs` — final rerun exit 0; 96 semantic state records, 16 screenshots, zero errors. Both locales exercise all presets/operations, strict-negative pop decisions and pending-C frames, formula signs +2/0/−2, cumulative operation history, rewind/replay, isolated prediction scope, changed-choice feedback invalidation, locale preservation, keyboard, storage denial and offline rendering. Exact untrimmed source matches displayed textContent, successful clipboard, selected manual fallback copied with Control+C, and downloaded bytes. Widths 320/390/736/1440 and emulated 200% zoom pass; CSS remains 11,683 bytes and sampled contrast remains ≥4.5:1.
- `python3 -B scripts/register_leetcode_lesson.py 587 --validate-only` — exit 0 with empty stdout/stderr; `preflight.json` records command, root directory and timestamp. Metadata complexity remains exactly the nonempty string `O(n log n) time; O(n) auxiliary space`. No metadata repair or registration was needed.

`served-source.json` records byte-exact preview/local matches for all seven runtime lesson files. Python remains the faithful preferred interface: saved official evidence contains Python3 `Solution.outerTrees(self, trees: list[list[int]]) -> list[list[int]]` and TypeScript `outerTrees(trees: number[][]): number[][]`. There is no non-Python language contract or supportedLanguages omission. The exact registration-policy pair was read: solution.py / python-code.js / PYTHON_SOURCE. Both remain unchanged and need no mirror regeneration.

Visual self-check inspected final `en-preset0-320.png`, `en-preset5-320.png`, `zh-preset5-390.png`, the desktop selector and EN/zh intermediate trace screenshots. Full count text is visible, the six/four coordinates wrap below their corresponding five/three boundary labels, and controls/readouts remain legible. An intermediate attempt with longer English names clipped the longest option on phones; it is retained under `r1-fix-intermediate/` and superseded by the final shorter names and fit assertions. The new harness initially had a block-scope variable error and a later smooth-scroll run ended with browser closure; both were corrected before the final passing run (test-only instant scrolling). These are not unresolved product findings.

Evidence limits: all results here are author self-checks on local headless Chromium, not independent closure, real-device testing, native toolbar zoom, learner outcomes or LeetCode submission acceptance. Next action: a separate reviewer checks C2 against 587-R1-F1 and records closure. The original report, rubric, campaign state, registry, services and other lessons were not edited.

## Mac integration revision self-check — 587-MAC-001 (2026-10-25)

This append supersedes C2's readiness claim for current files. New candidate C3 is ready for **separate re-review**, with the native Mac regression/visual inspection still dispatcher-owned and pending. No independent acceptance or native Mac fix verification is claimed. Historical reports, including R2's acceptance of `f5816b88f3e7e280e4c89878a0e6490d1a3522e6` and the subsequent integration reopening, remain unchanged.

Fix mapping: **587-MAC-001 → copy.js preset0…preset5, local.css #preset, index.html asset versions, tests/width-budget.cjs**. The confirmed cause is inadequate text room with platform-dependent font metrics. All six English identities remain clear: Garden, Official 1, Official 2, Point, Vertical, 2 pops; counts still explicitly say boundary tree(s). Chinese labels, input coordinates, trace state, teaching arithmetic, prediction and canonical algorithm are preserved. The selector keeps its existing 16px text and 48px minimum height, uses 6px horizontal padding and the available width capped at 30rem. Reserving width matters: with automatic sizing, the selector can shrink when padding shrinks. Shared fonts/assets are unchanged.

Before editing, ranked falsifiable hypotheses were stated in commentary: (1) greater text width at the same viewport exposes the defect; (2) padding reduction restores space; (3) a locale roundtrip changes the failing result. The actual original Mac measurements/hypothesis results were copied into `tests/evidence/mac-fix-before/original-mac-*.json`. On this Linux Chromium 156.0.8078.4 environment, the unchanged original `preset-scope.cjs` passed, consistent with the report's platform distinction. The new real-browser width test then ran red before the patch:

`PREVIEW_URL=http://127.0.0.1:18770 EVIDENCE_DIR=leetcode/587/tests/evidence/mac-fix-before node leetcode/587/tests/width-budget.cjs` — exit 1, “selected text exceeds native-arrow width budget”.

Its synthetic +10% font-size sensitivity check (17.6px, explicitly not native Mac emulation) made six English options exceed the reserved text budget, worst margin −19.95px. Padding-only 8px still failed the repeated-pop option (−5.95px); locale roundtrip retained the failures. These results support the width-budget cause rather than stale locale state. The unmodified native baseline's smallest spare margin was only 1.25px. A first copy/padding attempt fit but did not meet the additional 8px stress margin; its failure is retained in `mac-fix-intermediate/`. No diagnostic style overrides are shipped.

Final commands ran from the repository root. Browser commands used `PREVIEW_URL=http://127.0.0.1:18770`, `EVIDENCE_DIR=leetcode/587/tests/evidence/mac-fix`, installed `NODE_PATH`, and the provided Chromium executable path.

- `node leetcode/587/tests/width-budget.cjs` — exit 0; 48 measurements, both locales and six options under normal, +10% font-size, padding variation and locale-roundtrip conditions. Final normal minimum spare text width: 29.57px. Final +10% font-size minimum: 9.40px, beyond the separately reserved 16px native-arrow allowance. Original fit assertion is untouched.
- `node leetcode/587/tests/preset-scope.cjs` — final rerun exit 0; 72 records, both locales, every preset at 320/390/1365, initial/event-4 state, completed boundary counts, locale switches preserving preset/progress/label. Input counts [6,6,3,1,4,4] and boundary counts [5,5,3,1,4,3] remain independently specified.
- `python3 -B leetcode/587/tests/check_algorithm.py` — exit 0; actual canonical Python official callable, 920 cases including 3000 trees; independent supporting-line oracle, input preservation and unique outputs. Core checks cover 919 cases and 34,955 frames, exact triple/value/pop identity, append invariants, snapshots, 95 unique bilingual keys and exact canonical/offline source parity.
- `node leetcode/587/tests/browser.cjs` — final rerun after the final CSS exit 0; 96 semantic records, 16 screenshots, zero errors. Both locales cover rendered full determinant and +2/0/−2 substitutions, pending-C frame labels, cumulative operation/history scope, endpoints, rewind/replay, all presets, prediction selection/reveal/change/reset, locale preservation, keyboard, blocked storage, offline display, source clipboard success/manual fallback (actual selected Control+C), textContent and byte-exact download. Source comparisons preserve final newline. Responsive checks cover 320/390/736/1440 and CSS-zoom stress; CSS totals 11,818 bytes, contrast checks pass.
- Original dispatcher probe, unchanged: `PREVIEW_URL=http://127.0.0.1:18770 OUTPUT_DIR=leetcode/587/tests/evidence/mac-fix/original-probe node specs/reviews/587-evidence/mac-integration-20261025/leetcode-587-mac-probe.cjs` — exit 0, no failures, Chromium 156.0.8078.4. This is Linux evidence only.
- **`python3 -B scripts/register_leetcode_lesson.py 587 --validate-only` — exit 0, empty stdout/stderr.** `mac-fix/preflight.json` records the exact command, root and timestamp. Complexity remains the single string `O(n log n) time; O(n) auxiliary space`; metadata did not need repair or registration.

`served-source.json` records exact preview/local byte equality for all seven runtime files. Read the registration policy's exact Python pair `solution.py` / `python-code.js` / `PYTHON_SOURCE`; these remain unchanged, so no mirror regeneration was needed. Saved official evidence includes faithful Python3 and TypeScript callable interfaces; Python remains selected per preference, with no non-Python contract or supportedLanguages omission.

Visual author inspection: `en-320-width-stress.png` shows complete “Official 1: 5 boundary trees” at enlarged test font with visible arrow room. `en-preset5-320.png` shows complete “2 pops: 3 boundary trees” and its four sorted input points; `zh-preset5-320.png` shows the unchanged Chinese count and associated state/turn labels. `en-preset0-1365.png` shows the desktop selector and garden event 4/25: remove B=(0,2), cross=−2, C=(1,0) pending. Readouts and controls remain readable; no new layout or teaching mechanism was introduced.

Only lesson-local files/evidence were changed. No commits, agents, shared assets, registry, review reports/rubric, campaign state, services or deployment changes. No debug instrumentation was added to runtime files. CANDIDATE.json freezes C3 with source hashes. **Finding status: repair implemented awaiting independent review/native Mac confirmation; not closed.** Next action: dispatcher reruns the original Mac regression and visually inspects the frozen candidate, then an independent reviewer records the affected-path conclusion. Pi/Linux success alone does not establish the integration finding fixed.


## Review 3 follow-up — 587-MAC-001 (2026-10-25)

Disposition: **blocked on required native Mac evidence**. This append supersedes
previous author readiness wording for this follow-up. Read the complete previous
report `specs/reviews/587-review-3-09d91a86.md`, current candidate, BRIEF, teaching,
trace, review and rendered-state contracts, and the website-design and
diagnosing-bugs skills. The review found no additional implementation defect;
its only required open ID is 587-MAC-001. Runtime sources, teaching copy, tests,
metadata and embedded source remain unchanged. No speculative replacement fix
was made. This is an evidence/documentation follow-up, not independent closure.

Finding mapping:

- **587-MAC-001** → existing `local.css` full-width 6px-padding selector and
  `copy.js` shorter explicit boundary labels retained; fresh Linux regression in
  `tests/evidence/review3-followup/`. Repair remains awaiting native Mac recheck.
- **587-R1-F1** → existing explicit boundary-count scope preserved and checked
  against independent input/boundary counts [6/5,6/5,3/3,1/1,4/4,4/3]. This run
  does not alter the historical review's closure of that ID.

P0/highest-return work: establish the exact outstanding requirement and recheck
existing count scope and selected text fit. P1/P2: none. Deferred: further UI or
algorithm edits without a failing current implementation case; native Mac
verification requires the designated environment. No new layout or feature.
The diagnosing-bugs feedback-loop/hypothesis phases were not repeated because
this run makes no bug fix: the preserved original red evidence and confirmed
platform-font width cause remain in `tests/evidence/mac-fix-before/`. Linux
success and synthetic font stress cannot falsify a Mac-only rendering failure.

All commands below ran from the repository root with
`PREVIEW_URL=http://127.0.0.1:18770` and
`EVIDENCE_DIR=leetcode/587/tests/evidence/review3-followup` for output-producing
tests; Python additionally used `PYTHONDONTWRITEBYTECODE=1`:

- `python3 -B leetcode/587/tests/check_algorithm.py` — exit 0; 920 actual
  canonical Python cases, including exhaustive 3×3 subsets, seeded cases and
  n=3000; 34,955 independently checked trace snapshots; 95 unique bilingual
  pairs; exact offline mirror parity. See `algorithm.json`.
- `node leetcode/587/tests/browser.cjs` — exit 0; 96 localized semantic states,
  16 screenshots, no browser errors. Both locales, every preset/transition,
  rewind/replay, endpoints, prediction selection/reveal/change/reset and locale
  preservation, formula arithmetic, successful/manual-fallback clipboard,
  byte-exact source/download, keyboard, denied storage, offline source,
  320/390/736/1440 widths, contrast and CSS 200% zoom stress passed.
- `node leetcode/587/tests/preset-scope.cjs` — exit 0; 72 initial/event-4 states
  across both locales and 1365/320/390px, all six labels, locale roundtrip,
  independent input/boundary counts, final union and selected-text fit passed.
- `node leetcode/587/tests/width-budget.cjs` — exit 0; 48 width measurements;
  minimum spare margin 5.4026px across all modes. The +10% font-size mode
  separately retains the required ≥8px margin. This is Linux Chromium and
  synthetic sensitivity evidence, **not native Mac evidence**.
- `python3 -B scripts/register_leetcode_lesson.py 587 --validate-only` — exit 0,
  empty stdout/stderr; safe validation only. See `preflight.json`. Complexity
  remains one string: `O(n log n) time; O(n) auxiliary space`.

A separate read-only served-byte check matched index.html, app.js, copy.js,
core.js, local.css, solution.py and python-code.js to checkout bytes; see
`served-source.json`. Read the exact `LANGUAGE_FILES` mapping in
`scripts/register_leetcode_lesson.py`: Python uses solution.py / python-code.js /
PYTHON_SOURCE. The saved official snippets include the faithful Python3 callable
(and TypeScript); canonical Python already has preference. No non-Python
language-contract or supportedLanguages list is present or needed. Exact
663-byte source is retained, including the final newline; no regeneration needed.

Visually inspected fresh `en-preset5-320.png`, `zh-preset5-320.png` and
`en-320-width-stress.png`. Complete repeated-pop labels and the stressed English
Official 1 boundary-count label remain visible beside the arrow. Chinese event
4 correctly shows cross=1≥0, retaining B before appending C; labels/readouts wrap.
These inspected results establish only this Linux rendering. The host reports
Linux and uses the provided chrome-linux-arm64 executable.

Missing evidence/next action: a dispatcher or reviewer with **native Mac
Chromium** must run the original selector regression on these exact runtime
bytes, inspect all six labels beside the arrow at 320px, also cover 390/desktop
and locale switching after interaction, and attach candidate-specific results
and screenshots. Report 3 explicitly requires that environment and cannot be
closed by these Linux checks. No native Mac environment is available in this
workspace. No child agents, services, registration, report/rubric edits, shared
assets, commits, deployment or external messages were used. The C4 manifest
freezes only this documentation/evidence follow-up and leaves the implementation
hashes equal to reviewed C3; independent acceptance remains pending.

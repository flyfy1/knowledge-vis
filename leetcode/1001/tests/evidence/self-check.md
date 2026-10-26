# #1001 author self-check — frozen candidate 1001-author-v1

Date: 2026-10-26. Author/checker: Codex (precise model identifier unavailable). Independent reviewer/run: pending. Outcome: complete author candidate, ready for separate review; not independently accepted or published. No LeetCode submission or real learner outcome is claimed. SHA256 identity: candidate-manifest.json. All changes are confined to leetcode/1001/. No registration, deployment, commits, services, credentials, or campaign-record changes.

## Official evidence

Public official URL: https://leetcode.com/problems/grid-illumination/ . Public GraphQL capture accessed 2026-10-26T05:27:00.722551+00:00, saved in official-graphql.json with the query, endpoint, full statement, examples, constraints and observed language code snippets. Python3's actual `Solution.gridIllumination(self, n: int, lamps: list[list[int]], queries: list[list[int]]) -> list[int]` interface is present. Python selected by preference; a non-Python language contract is inapplicable. Duplicates, empty lists, answer-before-shutdown, out-of-bounds neighbor exclusion and full diagonals verified.

## Commands and observed results

From repository root:

- `python3 -B leetcode/1001/tests/test_solution.py` — exit 0. 2,874 canonical Python cases, including exhaustive n=1,2 lamp subsets and query sequences up to length 3, 1,500 random cases seeded with 1001, all official examples, fresh prediction case and two maximum-length fixtures at n=10^9. 17,407 intermediate checks equate four Python Counter maps with the active set and require positive retained entries. Inputs unchanged. Direct geometric oracle scans active lamps and deletes by distance, independently of the four-key/count implementation.
- The same command executes `tests/test_core.cjs` with independently computed fixtures: 1,508 cases, 17,524 snapshots. All map counts, read-time answers, before-read lamp sets and snapshot independence pass. Exact source mirror and 94 unique nonempty bilingual pairs pass. See numeric-results.json.
- `node leetcode/1001/tests/browser.cjs` — exit 0. Real headless Chromium 156.0.8078.4 on Linux; existing http://127.0.0.1:18770 preview. 16 locale/preset combinations and 16 locale/width/zoom combinations pass. Browser honors installed NODE_PATH and supplied executablePath. Results: browser-results.json.
- `python3 -B scripts/register_leetcode_lesson.py 1001 --validate-only` — exit 0 with no stdout/stderr. Safe validation only; no registration. Repeated after final source/metadata/link changes; exact receipt in preflight.txt.

All emitting tests accept OUTPUT_DIR. Reproduction commands and boundaries are in ../README.md. Tests were not run against a submitted LeetCode instance.

## Observed teaching and state behavior (author walkthrough)

1. Hand case n=4, lamps (0,0),(0,3): the (0,1) empty lamp cell receives row light, records 1 while both L markers remain. Shutdown removes only (0,0). The remaining (0,3) lights the next query, giving [1,1]. Each hand frame rewinds to the original state.
2. Baseline visits all active lamps per query; explicit syntax explanations accompany its set/tuple/comprehension operations. n² storage is rejected using 10^18 possible cells. Boolean row deletion is refuted by the surviving lamp and count 2→1. Both diagonal identifiers are derived from coordinate changes. Baseline bound includes Q work when U=0.
3. All eight presets reach their independently computed outputs. Every operation is tested forward/back/forward and restores board, active set, maps, event, history and progress. A read frame preserves lamps; a remove frame decrements only existing coordinates. Initial and terminal buttons correctly disable, including no-query initial terminal state. Queries read and shutdowns completed are separately labeled. Sparse maps omit zero entries. Full formula operands are asserted in both locales and screenshots show the actual formula.
4. Fresh query case records [1,1,0]: row 1 survives the first shutdown with count 1, then becomes empty after the second. Every prediction option is selected/revealed; changing the answer hides feedback; switching locale preserves selection and revealed truth, input, trace state and disclosure state. Derived feedback is absent before explicit reveal.
5. The actual Python callable, exact JSON mirror, DOM textContent, automatic clipboard copy, native manual fallback copy and downloaded source all agree including the final newline. Each locale uses a distinct verified clipboard sentinel before disabling automatic writes, then actual Linux Control+C and native clipboard readback; no test-written source is substituted. Full focus and selection are checked. Code display also works from file://. Source/disclosure, title, official URL and localized H1 are asserted.

## Browser/accessibility evidence

Both languages tested at 320,390,736,1440 CSS px and 100/200% CSS layout zoom. Controls/links ≥48px high, equal diagram cell widths ≥36px, no page-level horizontal overflow, state contents fit, grid and ledger have keyboard-focusable contained scrolling. At 200%, grid scroll with ArrowRight is tested; sticky row labels retain row identities. Keyboard Enter advances and activates a real deep navigation link; 3px focus outline is measured. Storage-denied initialization/switch, forced colors, reduced motion and offline source rendering pass. No console/page errors, failed local assets or external requests were observed. All fragments exist.

Actual related destinations were loaded and read in both languages: #51 step1 explains equal r−c/r+c keys and conflict sets; #2916 step3 derives whole-segment sum/square-sum updates. These support the precise labels “diagonal identifiers” and “maintaining aggregates: interval updates.” Availability is verified on this preview, not on a new public deployment. Target revision is the preview checkout; no acceptance of those lessons is inferred.

Measured solid-color foreground/background pairs range from 7.078851579:1 upward (including disabled text, muted hint, normal prose, active locale, lamps, lit cells and navigation). The actual helper is calibrated against black/white=21, primary luminances .2126/.7152/.0722 and #747474 on black=4.492948073 (fails 4.5 without rounding). Focus colors exceed 3:1 against both adjacent dark surfaces. No gradients or opacity complicate these measured surfaces. Shared+local shipped CSS = 12,122 bytes. Exact palette values are inherited; local CSS uses shared variables.

Author visually inspected trace screenshots in both languages at 320px/100%, 320px/200% and desktop, both source views, both formulas, bilingual narrow headers, L+Q overlap, horizontal grid scroll, corrected individual count cards and forced-colors state. Cells and markers remain distinct. At extreme zoom, long words wrap; horizontal grid/ledger scrolling is deliberate. No labels overlap their values in the corrected individual-card views.

## Failures encountered before freeze

- An early snapshot-independence assertion mutated the sole frame of an empty-query trace and incorrectly compared that frame with itself. Harness corrected to test independence only where two frames exist; no runtime defect was found.
- Early 320px/200% layout failed page width 367>320: first the header language group and then the long English H1 needed wrapping. Local header flex-wrap and title overflow-wrap fixed it. overflow-before.png and overflow-source.png are diagnostic captures from before the complete fix. Later full-suite geometry passes all 16 combinations.
- Extending touch-target checks to links found inherited official-link specificity kept its minimum at 44px. A lesson-local `.site-head .official-link` override raises it to 48px; the unchanged expanded assertion then passes.
- Tall element screenshots state-en/zh-320-z2.png and prediction-en/zh.png contain a capture-position sticky-navigation overlay. They are retained diagnostic artifacts, not evidence of missing content. Individual state-card-*.png captures use explicit settled scroll positions and were visually inspected; all label/value content is intact. The normal viewport trace captures also remain available. No assertions were weakened to hide a runtime failure.

## Limits / next gate

These are author self-checks plus independent computational oracles, not a separate agent review or observed novice teach-back. Physical devices, other operating systems/browser font installations, native browser/OS zoom, production delivery and LeetCode acceptance remain unverified. CSS zoom is explicitly only layout stress. A separate fresh-context reviewer must cold-walk this manifest-bound candidate, independently compute fresh cases and apply the six-dimension rubric before acceptance. Review/publication workflow status exists only in this record and BRIEF, never in learner UI. No open author-discovered runtime or numerical issue remains.

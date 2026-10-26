# #1125 author self-check — frozen candidate

Outcome: complete author candidate, ready for a separate independent cold review. Independent reviewer/run: pending. Acceptance score: not assigned. LeetCode submission and public deployment: not performed. These checks are author self-checks; a separate mathematical oracle is not an independent reviewer.

Candidate identity: manifest.json binds the runtime, metadata, BRIEF, official capture, test scripts and evidence by SHA-256. The final metadata passed the non-mutating preflight; a future relevant edit creates a new candidate requiring review. Only leetcode/1125/ was created/edited. Shared locale/style and related lesson copies were read and hashed, never edited. No registration, git commit/push, service start, agent spawning, credential or campaign-state changes.

## Executed checks

| Actual command from repository root | Result |
|---|---|
| `python3 -B leetcode/1125/tests/test_solution.py` | Pass: 4,296 feasible oracle cases; 2 maximum m=16,n=60 expected-value cases; displayed baseline executed; valid unique indices, minimum cardinality, coverage and no input mutation |
| `node leetcode/1125/tests/test_core.cjs` | Pass: 4,304 cases; 21,617 processed-prefix frames; 44,834 candidate comparisons; every exact-coverage state independently enumerated; source mirror exact; no duplicate localization keys |
| `node leetcode/1125/tests/browser.cjs` | Pass: actual Chromium/Linux; 42 recorded coverage rows, 32 screenshots; all 8 presets at both locales and 320/390/736/1440 with CSS zoom 1/2; 0 console/page/HTTP errors and local runtime requests only |
| `node leetcode/1125/tests/header.cjs` | Pass: 320px zh→en→zh at zoom 1 and 2; exact localized H1/document title, final team [2], selection/reveal and trace state preserved |
| `python3 -B scripts/register_leetcode_lesson.py 1125 --validate-only` | Exit 0, empty stdout/stderr; actual timestamp/cwd in preflight.json; no registration requested |

Numerical evidence: python-results.json, core-results.json, oracle-fixtures.json. Canonical Python and simulation use different implementations; the oracle enumerates person subsets with set union, without using mask DP as its expected result. Both official examples are executed from provenance/official.json. Exhaustive m≤3,n≤4 feasible inputs and seeded n≤10,m≤6 are covered. The maximum singleton-skills case has known optimum 16; another maximum case has only the final full-skilled person and optimum 1.

Browser semantic paths are retained in browser-results.json. Both languages show final minima [2,2,2,1,2,2,1,1] in preset order. The tiny final round displays source 001 → merged 111 candidate [0,2] and source 011 → merged 111 candidate [0,1,2], rejecting the larger team. A later full-skilled person replaces [0,1] with [2] while retaining the before/after identity. Formula retains `len(team)+1 < len(dp[merged])` in both languages. Fresh prediction [0]+[2] covers all four skills; [1]+[2] misses b; all choices reveal matching feedback and changing choice hides it. Locale switches preserve these meanings and state. Exact candidate, stored incumbent and accepted/rejected decisions are checked in the core.

Source parity: displayed textContent, decoded offline mirror, copied text (successful browser clipboard API), native manual-copy readback, and downloaded bytes equal solution.py, including final newline. Each locale's denied-write attempt first wrote and read a new distinct non-source sentinel, then clicked Copy, verified full textarea selection/focus, dispatched Linux Control+C, and read the actual clipboard. No solution text was test-injected to create fallback success. Storage denied mode keeps in-memory locale working; source stays available offline. Host is Linux; other OS clipboard behaviors are unverified.

## Visual inspection and accessibility

The author inspected coverage and prediction screenshots for both languages across the complete width/zoom matrix using inspection-sheet-1..4.jpg, and directly inspected narrow English and Chinese coverage, dense official-example cards, prediction feedback, and final endpoint images. The 320px CSS-zoom-2 layout reflows into one column: mask, actual skills and before/after team remain paired and legible without overlap. Long English text wraps and the page scrolls vertically. At 390px, the official six-skill cards preserve distinct mask/skill headings and before/after lists. The later-singleton endpoint clearly associates [0,1] → [2] with the same full mask; Next and End are visibly disabled with readable labels. Prediction screenshots preserve selected-but-wrong and revealed truth together. Sticky navigation scrolls horizontally within its own container, independently of page width.

Heading screenshots from header.cjs (`*-header-confirmed.png`) were directly inspected after explicitly scrolling to the top. Both localized problem number/title and the right-aligned language control are visible and wrap at 320px/200%. These supplement the earlier scrollIntoView captures, which can frame only part of a tall heading. No missing H1 content was inferred from a viewport crop. Early diagnostic overflow-before.png is retained as author iteration evidence; screenshot-contact-sheet.jpg is an earlier iteration montage, not the final visual authority. Final browser-results.json lists the checked matrix images; inspection sheets summarize those unchanged runtime layouts. Diagnostic heading crops are supplementary only.

Keyboard: actual radio ArrowRight/Space, Tab to Reveal and Enter, focused related links activated with Enter, and native copy shortcut. Visible 3px focus is checked in ordinary and forced-color modes; reduced-motion preference is enabled. Related links are followed on the preview in both locales: #691 step2 genuinely explains missing-count memoization for repeatable stickers; #1092 step3 explains suffix-length DP/reconstruction. Source target hashes and excerpts are recorded. The local collection already lists both targets. Public-release navigation remains a separate release check.

Measured rendered contrast (browser-results.json): main text 16.09:1, explanatory text 16.09:1, muted hint 7.08:1, coverage title 10.91:1, card body 13.40:1, disabled control 6.45:1, primary/selected/link text 13.10:1, focus on panel2 8.94:1. Disabled controls exceed AA; the primary body text exceeds the 7:1 target. Contrast helper was independently bounded with black/white=21:1 and identical pairs=1:1. Shared+local shipped CSS totals 11,423 bytes (<25,000). Native select closed-value budgets include a conservative 24px arrow allowance; every option passes in this browser/font environment. Longer full preset descriptions appear separately below the short selector labels.

## Limits and next action

No physical phone, native browser-menu zoom, other OS/font environment, screen-reader session, novice learner test, LeetCode judge submission or production deployment was performed. CSS zoom 2 is the recorded headless layout test, not a claim of physical-device testing. All traces are labeled JavaScript simulations of small inputs, not executions of the Python submission. Trace snapshots and candidate ledgers have extra memory costs, disclosed beside the trace. The next required action is a separate reviewer run with fresh context and the frozen candidate; keep the BRIEF/source/self-check hidden until its cold learner walkthrough is recorded. No independent score or acceptance is implied.


## 1125-R1 follow-up self-check — 2026-10-27 local

Finding mapping: **1125-R1 → fixed awaiting independent review**. The original
review specs/reviews/1125-review-1-b4279a73.md remains unchanged and its historical
changes-required decision is not superseded by these author checks. The repair
changes only step 2's baseCost translations and the local copy.js query version.
Both paragraphs distinguish the official bounds m≤16 and n≤60 from actual input
counts, quantify 2^16=65,536 coverage states, and explicitly include the m=6,n=3
and m=16,n=1 counterexamples. No numerical or interaction defect was found that
required an algorithm change. Canonical Python and its mirror remain unchanged;
regeneration was unnecessary. Official saved snippets include faithful Python3
and TypeScript, and the preferred Python interface is selected.

All commands below ran from the repository root. For repaired test runs,
`OUTPUT_DIR="$PWD/leetcode/1125/tests/evidence/review-r1/after"` was set; the
initial failing run used the corresponding `before` directory.

| Command | Observed result |
|---|---|
| `node leetcode/1125/tests/review_r1.cjs` before correction | Exit 1: “1125-R1: explain the distinct official bounds”; before/r1-results.json preserves the old rendered Chinese sentence and assertion failure; before/zh-bounds.png preserves the screenshot |
| `node leetcode/1125/tests/review_r1.cjs` after correction | Exit 0; exact rendered paragraph read in zh/en, 1280px and 320px CSS zoom 1/2; trap m=6,n=3 finishes [1,2]; actual solution.py execution and JS trace at m=16,n=1 return [0] |
| `python3 -B leetcode/1125/tests/test_solution.py` | Exit 0; 4,296 feasible oracle cases, 2 maximum cases, displayed baseline executed |
| `node leetcode/1125/tests/test_core.cjs` | Exit 0; 4,304 cases, 21,617 prefix frames, 44,834 candidate events; duplicate-key and exact mirror checks pass |
| `node leetcode/1125/tests/browser.cjs` | Exit 0; 42 check groups and 32 screenshots, both locales/all presets, replay, prediction, source transfer, keyboard, layout, related links, offline and storage-denied paths |
| `node leetcode/1125/tests/header.cjs` | Exit 0; narrow bilingual title/state roundtrips |
| `python3 -B scripts/register_leetcode_lesson.py 1125 --validate-only` | Exit 0, empty stdout/stderr; after/preflight.json records cwd/time and the frozen metadata hash. Complexity is exactly one nonempty time-and-space string; no metadata repair or registration occurred |
| `git diff --check` | Exit 0 |

Rendered-state contract coverage: existing core oracles independently check every
prefix and candidate/incumbent pair; browser checks cover the tiny final round's
accepted [0,2] and rejected [0,1,2], before/after full-team replacement in Later,
formula operands, all round endpoints and rewind/replay. No cumulative-work total
is advertised; processed-person progress describes completed rounds. Prediction
is the fixed independent four-skill exercise; choice changes invalidate feedback
and locale changes preserve its selected meaning. Exact source parity includes
decoded mirror, textContent, clipboard success, each native Linux fallback using
a fresh verified sentinel, and downloaded bytes, including final newline.

Visual self-check: directly inspected after/zh-bounds.png, en-bounds.png,
zh-320-zoom2-bounds.png and en-320-zoom2-bounds.png. The corrected sentences and
numbers wrap and remain readable in both languages, with no page-wide overflow.
Tall element captures include a sticky-nav overlay over part of the earlier
baseline prose; the changed bound/counterexample text is below it and readable.
This capture artifact is not treated as evidence of collision. Also inspected
fresh en-390-dense.png (coverage heading and before/after teams stay paired) and
zh-320-zoom2-prediction.png (selected wrong choice and corrective feedback remain
distinct). CSS and contrast colors were unchanged; the full browser suite
rechecks rendered pairs. CSS zoom is a synthetic layout test, not native device
zoom evidence. Physical devices, other platforms, screen readers, actual novice
comprehension, LeetCode judge acceptance and public delivery remain unverified.

New candidate: review-r1/manifest.json hashes the current runtime, BRIEF, metadata,
provenance, tests and appended self-check. The original manifest and old receipts
are retained. No shared assets, registry, campaign state, services, Git config,
review report or rubric were changed; no child agents, commit, push, deploy,
schedules or credentials were used. Next action: a separate reviewer reads the
changed bilingual causal paragraph with both counterexamples against this frozen
candidate and decides whether to close 1125-R1. No independent acceptance claimed.

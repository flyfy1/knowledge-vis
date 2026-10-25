# #668 · Kth Smallest Number in Multiplication Table

Author candidate, independent review pending. Category computing / algorithms; stage university.

## Product and design boundary
Reuse the approved `/leetcode/<id>/` lesson pattern and its five-part reading path.
References: `specs/reviews/leetcode-all-hard-design-review.md` (product/design review and dispatcher adjudication), WORKFLOW, UI-I18N-SPEC, explainers, Hard traces, review gates, rendered-state contract, and website-design SKILL.md. No new platform, registry changes, services or deployment. Target reader knows Python loops and integer division; immediate job is reconstructing selection by counting without generating the table. Validation is a separate cold walkthrough, not this author self-check.

Highest-return slice: connect actual highlighted cells → row counts → safe interval removal. P0: bilingual hand example, causal count derivation, reversible complete trace/history, proof, fresh prediction, executable Python, oracle/browser/source/accessibility evidence. P1: endpoint presets and deep links. P2: none. Deferred: custom huge grids (bounded presets keep all cells readable), animation (no learning need), browser Python runtime (offline simulation suffices), learner-effectiveness claims (no actual learners), registration/release (outside author ownership).

## Official contract, observed 2026-10-25
Exact URL: https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/
Public GraphQL `question` capture: provenance/official-graphql.json; query and dated observation recorded in provenance/README.md. Official description also opened using web tool. Direct Python GET of problem page returned HTTP 403; public GraphQL GET and POST returned HTTP 200 without credentials.
`mat[i][j]=i*j`, indices start at 1. Return kth smallest **cell**, including equal values at different positions. `1 <= m,n <= 30000`, `1 <= k <= m*n`; no empty or invalid input in contract. Official examples (3,3,5)→3 and (2,3,6)→6. Python3 code snippet explicitly provides `class Solution: def findKthNumber(self, m: int, n: int, k: int) -> int`. Integers in, integer out; no required mutations, modulus or special exceptions. Python is the preferred faithful language.

## Exact reused tokens and composition
Use shared style.css and common.js unchanged. Palette: bg #0d1117, panel #161b22, panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93. Local CSS uses those variables only; no new colors. System font stack inherited. Shared title clamp 28/5vw/46, heading 23/3.5vw/32, line-height 1.75, content 952px, gutters 24/16, stage radius 14, control radius 8. Local controls min 48px; disabled opacity 1 with muted text; explicit dashed boundary. Focus 3px accent2 + 4px offset. Quantitative cells use text `≤` as well as accent background. Static updates, no ambient motion. Native tables with headers, scroll containers focusable, no fabricated loading/reconnect lifecycle.

## Steps (five fields each)
|Step|Already known|Single question|Input → quantity|Action → observation|Conditions|
|---|---|---|---|---|---|
|0 Hand calculation|multiplication|What is the fifth cell in sorted order?|3×3, k=5 → 3|Inspect table and sorted cells; duplicates retained|1-based rank, each cell counted|
|1 Count a threshold|row products from step 0|How many cells are at most x?|same 3×3, x=3 → 3+1+1=5|Move threshold slider 1…9; compare cell marks, row counts, full count ledger|positive integer rows; min clips at n|
|2 Remove impossible values|count C(x) from step 1|Which half can contain the first sufficient value?|m,n,k → closed interval containing answer|Next applies one full count and interval update; back/reset/end/scrub restores; retained history shows nested intervals|C nondecreasing; C(lo−1)<k≤C(hi); midpoint not removed when enough|
|3 Transfer|search invariant defined again locally|What happens at an equality with duplicates?|fresh 3×4, k=7, lo=1 hi=12 mid=6|Choose and reveal; C=4+3+2=9, hi=6; change clears explanation, locale retains choice/reveal|need C≥k, not C=k; prompt independent of lab|
|4 Code and boundaries|row count + interval invariant restated|How does the proof become Python?|official callable → integer answer|Inspect/copy/download exact source; map a completed decision|valid official positive bounds; cost uses shorter dimension|

## First-use dependencies (also restated near each relevant step)
- Cell and 1-based rank: step0, each position is one item, kth means k−1 cells precede it after sorting.
- Threshold x, floor division, C(x): step1, x is a tested integer value, x//i is complete multiples of row i; C counts positions ≤x.
- Monotone: step2, raising x cannot unmark a counted cell. lo/hi are inclusive answer bounds, mid their floored average.
- Invariant: step2, property kept after each update: C(lo−1)<k≤C(hi).
- Auxiliary space: step4, working storage apart from inputs/output; simulation snapshots are additional teaching storage.

## Concrete reasoning and counterexamples
Keep 3×3,k=5 through hand, count and optimized trace. Sorted cells 1,2,2,3,3,4,6,6,9. Deduplicating gives fifth=6 (wrong); taking row-major fifth=4 (wrong). Baseline materializes all mn cells and sorts, O(mn log(mn)) time/O(mn) space; 900 million cells at maximum. Derive row prefix: ij≤x iff j≤floor(x/i), clipped by n. Count duplicates naturally by positions. x=5 need not be present: C(5)=6 is still meaningful. Counts increase but can skip k: for default, C(2)=3 and C(3)=5; for k=4 no C equals 4. Thus first C≥k, not equality. Enough at mid retains mid, too few removes mid and every smaller value. Initialization C(0)=0 and C(mn)=mn; shrink preserves both bounds; equal bounds force answer. Symmetry permits swapping dimensions to scan min(m,n).

## Simulation/state and evidence plan
Browser JavaScript simulates the Python rule; it does not execute the submission. Frames: initial interval, then one completed count+update per frame. Explicit before interval / just-tested threshold / after interval labels. Grid marks last tested mid, not new bounds. Final frame retains last test and separately labels final answer. No omitted rounds. Presets (3,3,5), (2,3,6), (3,3,4), (1,7,4), (1,1,1), (4,5,1). Changed preset restarts lab only; count slider and quiz independent. All trace histories kept; tutorial memory is outside O(1) submission space.

Self-checks: exhaustive small sorted-product oracle for canonical Python and JS frames; seeded rectangular cases; large closed-form endpoint/rank cases; intermediate exact counts/boundaries and strict shrink. Real Chromium both languages/all presets/endpoints/replay/prediction options/state changes/copy success and denial/storage denial/offline sources; desktop 1440,736,390,320, actual browser 200% zoom; keyboard/focus, forced colors/reduced motion, local network failures, exact displayed/copied/downloaded source, measured contrast, visually inspect screenshots. Tests accept OUTPUT_DIR. No claim of independent acceptance, actual learner results, LeetCode submission acceptance, physical-device or production validation.

# #1074 — author brief, candidate 1

Status: author implementation; independent review pending. No independent acceptance,
LeetCode submission, publication, or real learner result is claimed. Author: Codex;
exact model identifier unavailable. Only this lesson directory is owned.

## Product and approved contract
Reuse the bilingual static lesson pattern approved in
`specs/reviews/leetcode-all-hard-design-review.md` and dispatcher adjudication.
Website-design skill read at `/home/songyy/Documents/agent-skills/website-design/SKILL.md`.
Verdict: reuse, one problem-local page in the existing LeetCode collection.
Category computing / collection leetcode; stage university. Reader knows arrays,
loops, addition, and basic Python dictionaries, but not prefix-frequency counting.
Job: count rectangles, reconstruct the row-band reduction and explain its invariant.
Loop: calculate five rectangles → compress one row band → inspect prefix matches →
predict a new band → connect to executable Python.

## Verified original contract
Public unauthenticated official GraphQL, accessed 2026-10-26; full raw response,
query, date and observed selectors in `tests/evidence/official.json`. Exact catalog
URL: https://leetcode.com/problems/number-of-submatrices-that-sum-to-target/ .
Frontend ID 1074 (internal questionId 1145), Hard, free. Nonempty contiguous,
axis-aligned submatrices; different coordinates count separately even with equal
values. Matrix has 1…100 rows and columns; elements −1000…1000; target −10^8…10^8.
No empty-input contract or modulus. Examples: cross of ones with four zero
corners → 4; [[1,-1],[-1,1]], target 0 → 5; [[904]], target 0 → 0.
Observed Python3 signature `Solution.numSubmatrixSumTarget(self, matrix:
list[list[int]], target: int) -> int`; also Python, TypeScript, JavaScript and
native selectors observed (all preserved raw). Prefer canonical Python; don't
mutate matrix. No non-Python exception applies. Browser trace is a JS simulation,
not Python execution. Actual Python executed offline against a direct-cell oracle.

## Exact shared tokens and lifecycle
Reuse `../style.css` and `../common.js`. Palette: bg #0d1117, panel #161b22,
panel2 #1c2330, line #2b3547, text #e8edf4, muted #9aa7b8,
accent #6ee7ff, accent2 #ffb454, good #7ee2a8, bad #ff7a93.
Inherited alternate section #0a0e14 and prose #c9d4e2. System font stack,
1000px header / 952px content, 8px controls / 14px stage radii, inherited spacing.
Local controls raise minimum size to 48px; disabled opacity restored to 1 with
muted text on panel2. 3px accent2 focus outline, 4px offset. No ambient animation.
Grid cells are data; explicit row and column labels show the active band and scan.
Full snapshots restore every count; a persistent ledger records all contributions.
Language updates text only where possible and preserves preset, position, selection,
reveal and keyboard focus. Preset changes explicitly restart only the trace.

## Sections (five fields per section)
| Step | Already knows | Single question | Input → output | Action → visible observation | Conditions |
|---|---|---|---|---|---|
|1 Hand count|Addition, matrix cells|Which rectangles sum to zero?|2×2 cancellation matrix → five coordinate-distinct rectangles|Previous/next rectangle → outlined cells, explicit sum, retained five-item ledger|Nonempty contiguous rectangle, zero-based inclusive boundaries|
|2 Reduce dimensions|Four rectangle boundaries|What can we reuse for fixed top and bottom?|Same matrix → per-column sums [0,0]|Read arithmetic and compare [1,-1] band against [0,0] band; baseline disclosure|Each rectangle belongs to exactly one row band; all column intervals still needed|
|3 Prefix experiment|Column intervals and cumulative addition|How many earlier boundaries produce target here?|Preset matrix and target → per-column contributions and total|Advance/rewind/reset/end and presets → matrix band, compressed columns, query-before-insert maps, matched positions, ledger|Map counts earlier prefixes only, seed zero once per band, reset per band, average dictionary cost|
|4 Transfer|Prefix difference rule|How many intervals end at the last column in fresh [2,-2,2,-2]?|Unseen one-row array target 0 → choice then explicit reveal|Choose → no answer yet; reveal → explanation; change → feedback clears; locale retains|Count current endpoint, not whole-array total; multiplicity and empty-prefix seed matter|
|5 Implement|Invariant and band reduction|How do the loops implement the proof and what do they cost?|Canonical Python → exact source/copy/download and costs|Open source/copy/download/manual fallback; related deep links|m rows n cols; O(m²n) expected time O(n) auxiliary space; tutorial history excluded|

## Term dependencies and first use
- Step1: submatrix = contiguous row/column rectangle; coordinates zero-based inclusive.
- Step2: row band = fixed inclusive top/bottom; compressed column = sum inside band.
- Step2/3: prefix = sum of columns before boundary p, P[0]=0; interval sum is
  P[right+1]−P[left]. Step3 repeats these definitions for jump readers.
- Step3: `seen` = multiplicity dictionary of earlier prefix values; `s` current
  prefix; `need=s−target`; seed represents boundary before column zero.
- Step4 repeats boundary-prefix and multiplicity definitions. Step5 repeats
  dictionary scope, dimensions and indexing when mapping code.

## Causal proof and tempting mistakes
Direct-cell baseline enumerates O(m²n²) rectangles and O(mn) cells each,
O(m³n³) time, O(1) auxiliary. Even 2D prefix rectangle queries leave O(m²n²)
rectangles (25,502,500 at 100×100). Fixed rows turn rectangle sums into interval
sums without losing or duplicating coordinates. Increment bottom adds just one
row to each compressed column. Negative entries defeat monotone window shrinking:
[2,-2] target 0 would lose the valid pair if 2 were discarded as too large.
Prefix subtraction derives the wanted earlier value; repeated equal prefixes
mean distinct left boundaries, so a set loses matches ([0,0] → 3, not 2).
Insert after query, or target zero incorrectly counts an empty interval. Reset
seen for each band or unrelated rectangles mix. Every nonempty rectangle is
counted exactly once by its top/bottom/right and unique matching left boundary.

## State and evidence plan
All trace frames included for small presets; each frame is after band initialization
or after one column query and insertion. Old map, queried value, matching boundary
positions and new map remain visible. All prior processed-column ledger entries
persist. Browser history is extra teaching memory, not solution space.
Presets: hand 2×2; all three official examples (hand doubles as example 2);
zeros [0,0]; negative-window [2,-2]; single positive match; tall one-column band.
Prediction is independent and not reset by trace/hand controls. No custom data is
silently destroyed. Loading/network/auth states inapplicable: static assets only.
Empty input inapplicable to original constraints. Clipboard denied/storage denied,
initial/terminal/rewind, correct/incorrect/changed answers are applicable.

P0/highest-return: accurate hand arithmetic, band-to-prefix bridge, reversible
ledger, bilingual preserved state, Python and actual browser evidence, metadata.
P1: exact copy/fallback transfer, related concept links, narrow/zoom inspection.
P2: no decorative work needed. Deferred: execution service, universal renderer,
custom matrix editor, autoplay (no need; would expand state and runtime scope).

Validation: reproducible tests accept OUTPUT_DIR for emitted artifacts. Record
actual numerical, browser, contrast and preflight commands/results in local evidence.
Independent cold reviewer must review frozen candidate in a separate run; none
spawned in this author run. Release/registration remain dispatcher-owned.

## Final author handoff
Candidate 1 is self-checked on 2026-10-26. Independent review/run remains pending;
no independent acceptance or publication. See `tests/evidence/SELF-CHECK.md`, raw
reports, official response, screenshots and `candidate-manifest.json`.
11,435 canonical Python cases; 3,902 simulation cases / 45,170 invariant frames;
22 grouped real-browser checks passed. Non-mutating metadata preflight
`python3 -B scripts/register_leetcode_lesson.py 1074 --validate-only` passed
(exit 0, no output). Metadata is frozen with this candidate; any later fix is a
new review candidate. Shared registry and CONCEPT-MAP are unchanged per ownership;
lesson-entry supplies validated concepts for the dispatcher's later registration.

# #895 Maximum Frequency Stack — author brief

Status: author implementation; separate lesson review pending. No independent acceptance, submission acceptance or publication claimed. Author: Codex; exact model unavailable.

Product/design: reuse the approved collection lesson pattern from specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication. Apply website-design skill. Category computing / algorithms; stage university. Reader knows Python lists, dictionaries and classes. Smallest outcome: reconstruct frequency-level stacks and justify recency after a demotion.

Official contract verified 2026-10-26 from https://leetcode.com/problems/maximum-frequency-stack/ and public GraphQL; full capture tests/evidence/official.json includes Python3 selector snippet FreqStack.__init__, push(val: int)->None, pop()->int. 0≤val≤10^9; ≤20000 push/pop calls; pop guaranteed nonempty. Official example pushes 5,7,5,7,4,5 then pops 5,7,5,4. No input array mutation or empty-pop behavior required. Python is faithful and preferred.

Learning loop: hand-count [2,2,9] → reject ordinary stack → scan baseline → derive one history per frequency → reversible experiment → fresh prediction → source mapping.

## Step contract (five fields each)
|Step|Already known|Single question|Input → desired quantity|Action → observation|Conditions|
|0|push appends, pop removes|Why does 2 beat 9?|[2,2,9] → two pops|Hand-count 2 twice, 9 once; then tie → 9|Nonempty pop; most recent surviving occurrence|
|1|Frequency and tie rule|What repeated work can we save?|Remaining list → selected occurrence|Read reverse scan; compare 2,2,9 counterexample|Counter recomputed per pop; O(n) work|
|2|Rank and chronological ties|Why keep lower frequency entries?|Operation presets → snapshots|Forward/back/reset/end, compare before/after, frequency groups and full ledger|Every frame after one complete call; no omitted calls|
|3|Group invariant|Which values come next after a demotion?|Fresh [6,8,6,8,3], pop once → next two|Choose, reveal, change; feedback clears|Independent of preset; no answer before reveal|
|4|Invariant and transitions|How does the state become Python?|State names → exact callable source|Expand/copy/download source; follow related anchors|Expected hash cost, amortized list append; valid calls|

## First-use terminology
Frequency: surviving copies of one value (0, locally repeated 1–4). Stack: list accessed at its right end (0,2,4). Rank/level f: the f-th surviving occurrence of a value, ordered by original push time (2). Invariant: fact maintained after every valid call (2). maxfreq: largest surviving count, zero when empty (2). Snapshot: copied completed state for rewind (2). Hash dictionary: value-keyed lookup (4). Amortized: list growth cost averaged across appends (4).

Token contract: exact shared leetcode/style.css variables --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Inherit system font, 1.75 line-height, 952px content, 8/14px radii; local controls min 48px and visible focus; no animation. Local border override uses existing muted token. No external assets.

P0: bilingual causal prose, honest state histories, exact source, oracle/browser checks. Highest-return slice: distinguish frequency groups from buckets of current exact frequencies. P1: source fallback and deep links. P2: none. Deferred: custom operation editor (presets isolate one complication), autoplay (no learning need), live code execution service (static lesson scope). No new platform or layout.

Simulation: browser independently models group updates, not execution of Python. Physical remaining stack and full operation ledger retained. Full snapshots have O(q²) worst-case teaching memory vs O(q) submission storage. Preset change explicitly restarts only trace. Locale preserves trace, choice, reveal and copy state. Branches: empty/active/ended trace, push/pop, revealed correct/incorrect, changed answer, clipboard success/manual fallback. Loading/network/auth not applicable to local static runtime. Learner-facing copy excludes transient workflow status.

Related links: #32 step1 explains unmatched-index stack; #84 step1 explains settling taller bars with monotonic stack, explicitly different pop rules. Verify served targets and semantics. No shared concept map changes authorized; lesson-entry carries local concepts.

Evidence and final candidate hashes will be recorded under tests/evidence/. Author checks do not replace separate cold review or learner teach-back.

## Author self-check and candidate freeze

Final status: authored and self-checked; independent per-problem lesson review pending. No agent was spawned. Approved design reuse is not lesson acceptance. Candidate identity: tests/evidence/candidate.json (runtime, metadata, tests and shared-policy SHA-256).

Commands from repository root:
- `python3 -B leetcode/895/tests/check.py`: PASS, 79,680 operations; exhaustive valid small sequences, seeded calls, official example, 20,000-call boundaries.
- `node leetcode/895/tests/core.cjs`: PASS, 16,298 intermediate states, 76 unique bilingual keys.
- `node leetcode/895/tests/browser.cjs`: PASS, details in browser-results.json; each preset transition independently recounted, bilingual preservation, native clipboard fallback and exact source transfer.
- `python3 -B scripts/register_leetcode_lesson.py 895 --validate-only`: PASS, exit 0, no output. No registration performed. Metadata complexity is one string.

Visual inspection: focused English 320/390/1440, Chinese 390 and Chinese 320/1440 at zoom 2 show wrapping text, separate before/after states, labeled frequency levels and visible keyboard focus. At extreme 320px × CSS zoom 2, the page uses one column and long variable names wrap within their own state region; no label/value collision. Scrolling reveals the complete history. Preset A/B/C codes and the adjacent wrapping complete description replace the overlong selected label (original failed width budget retained in preset-before.json). Select measurements use actual computed font and a documented 16px native-arrow reserve on this Chromium/Linux host; not a universal platform guarantee.

The lesson itself has no console/page/network asset errors. Following the existing #32 target emits an inherited `/favicon.ico` 404; destination lesson text and anchor work. This related-page cosmetic request is recorded separately in browser-results.json, not hidden and not repaired outside ownership. #84 step1 explains a different monotonic-stack removal rule; labels promise precisely that. Both links activated with keyboard in both locales, and destination text retained in results.

Harness development corrections: initial use of unsupported locator.isFocused and range.fill APIs was replaced by DOM focus/range operations; a quadratic maximum-case oracle was replaced by closed-form maximum cases while retaining every-state small/seeded oracle checks. Early all-page console assertion exposed the unrelated #32 favicon request and now reports destination diagnostics separately from lesson errors. These are author test development, not prior independent findings or acceptance.

Limits: no actual novice teach-back, independent lesson acceptance, LeetCode submission, physical phone/Mac browser or production deployment. Browser coverage is local Chromium with CSS zoom 2. Reviewer should cold-walk the frozen lesson before consulting this brief/evidence, then check the official capture and rerun tests with OUTPUT_DIR.

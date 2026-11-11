# #818 author self-check

Status: complete author candidate; independent review pending. This record is not independent acceptance. No LeetCode submission, learner study, registration, publication or deployment was performed. Author: Codex in this run; exact model identifier unavailable. Reviewer: pending (separate run required).

## Reproduce from repository root

```sh
python3 -B leetcode/818/tests/check.py
node leetcode/818/tests/core.cjs
node leetcode/818/tests/browser.cjs
node leetcode/818/tests/visuals.cjs
python3 -B scripts/register_leetcode_lesson.py 818 --validate-only
```

Use the existing NODE_PATH and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. All runners emitting results/images accept EVIDENCE_DIR; browser runners accept PREVIEW_URL (default http://127.0.0.1:18770). No service is started. Reviewer reruns should set EVIDENCE_DIR to a fresh output directory to preserve frozen author evidence.

## Observed results

- Official public GraphQL returned the statement, constraints, examples and Python3 starter. Direct curl HTML was an anti-bot challenge; no bypass attempted. The successful GraphQL response and access note are saved under tests/evidence/.
- Python: 50 case records (including exhaustive1..25, seeded cases, target10000→45,9999→43,8192 and official3→2,6→5), plus13 closed-form targets2^k−1. Actual canonical callable executed. Raw instruction-string enumeration is independent of the visited-state BFS; a separate distance-decomposition DP checks larger cases. Full results in python-results.json.
- JS core: targets1..25; every complete layer compared against independently replayed raw command strings with first-discovery depths. Witness lengths, legal transitions, pair uniqueness, accumulated snapshots, exact result depths and duplicate localization keys/paired-string shapes pass.
- Chromium: all5 presets in EN/zh, every forward frame, rewind/replay, initial/final/reset endpoints;12-command sandbox endpoint and undo; each prediction option, reveal/change and language preservation; exact rendered witness/pair labels and final result. Records preserve bilingual proof/feedback meaning. Target2 remains an independent question, absent from default target6 answer.
- Source: exact mirror/display/copied/downloaded solution.py including final newline; automatic clipboard and native fallback in each locale. Each fallback uses a new verified non-source sentinel and Linux Control+C before reading back exact source. Offline file opening and unavailable localStorage work.
- Layout: both languages at320/390/736/1440,200% CSS zoom at1280; no page overflow, state chips wrap without internal overflow. Keyboard Enter advances a layer; focus outline3px and forced-colors retention checked. Related links815/#step2 and773/#step2 resolve. No page/console errors, no failing asset responses or external runtime requests.
- CSS total: 11117 bytes. Measured contrast: main text14.70:1, muted/disabled6.45:1, link13.10:1, orange focus/target8.94:1, primary action13.10:1. Muted text passes AA but is below the preferred7:1 target; reused exact token contract retained.
- Metadata preflight: `python3 -B scripts/register_leetcode_lesson.py 818 --validate-only` from repository root exited0 with empty stdout/stderr. Exact command/result/time saved in metadata-preflight.json. Complexity is one string with time and space. No registration occurred.

## Visual author inspection

Opened and inspected actual Chromium screenshots: en-320-layers, zh-320-layers, zh-736-layers, en-1440-layers, en-390-prediction, zh-390-prediction, both zoom200, both fallback, both320-top, en-390-terminal and zh-320-terminal. Headers, historical state pairs, dash-bordered target marker, prediction feedback and source fallback remain readable. Narrow terminal states wrap into additional rows; they do not shrink or intersect. Sticky navigation crops only offscreen scrollable nav items; content at capture boundaries may be partly offscreen, while ordinary scrolling exposes the full ledger. No visual collision found in inspected populated states.

Author teaching walk: AA changes(0,1)→(1,2)→(3,4); R changes speed only. Position-only seen would discard every R. BFS retains pair states and original rows; first arrival6 is depth5, witnessed by AAARA. Prediction target2 rejects both AA and AAR by their actual endpoint; lack of2 in layers1..3 establishes minimality4. Python candidates and enqueue-time seen match this proof. This is an author walkthrough, not a novice teach-back.

## Evidence boundaries

Harness corrections (not runtime defects) are documented in tests/evidence/harness-notes.md. The baseline exposes product() with a local bilingual explanation. No arithmetic truncation or artificial position bound is used. Conservative exponential bounds are intentional; there is no claimed polynomial optimization. Snapshot storage is explicitly extra teaching memory.

Real devices, screen-reader speech, public deployment, official judge time/memory acceptance, actual learner comprehension and independent teaching review remain unverified. Next action: a separate reviewer must cold-walk the frozen candidate and apply the six-dimension rubric before acceptance. Candidate hashes live in candidate.json. No historical acceptance record was altered.

## 2026-10-26 resource request — unfinished follow-up

**818-RESOURCE-R1 remains OPEN.** The preceding completion section describes the
prior BFS candidate only. No revised submission or learner-facing resource fix
has been frozen or independently accepted in this follow-up. The completeness
argument for the requested smaller-distance recurrence and the requested isolated
Mac resource measurements are missing. The host available here is Linux.

Preservation checks passed: original core regression, actual Python/raw-command
comparison for 1..25, and browser regression in both locales, including source
transfers and existing interactions. The safe command
`python3 -B scripts/register_leetcode_lesson.py 818 --validate-only` ran from the
repository root and exited 0 with empty stdout/stderr. No metadata was changed.
These results do not constitute validation of the unimplemented DP extension.

Full finding mapping, exploratory alternatives, command receipts and separate
preservation results: [resource-r1-investigation/README.md](tests/evidence/resource-r1-investigation/README.md).
Next action: finish and examine the optimal-path completeness proof, implement
the corresponding bilingual DP extension, collect the specified resource and
regression evidence, and freeze a new candidate for a separate reviewer.
The prior candidate manifest and all historical review evidence are preserved.

## 2026-10-26 — 818-SEARCH-R1 author revision

Status: **fixed awaiting independent review**, new candidate `818-search-r1-20261026`.
This appendix supersedes the preceding follow-up's proposed next action: the
818-RESOURCE-R1 smaller-distance DP choice has been superseded, not proved.
Original95/100 acceptance, blocked investigation33686548c3c385cdb14b5b7262e4ca58a3b8d2f4,
prior reports and original candidate receipt remain historical evidence. The old
candidate manifest is copied unchanged to tests/evidence/search-r1/prior-candidate.json.
No new acceptance, registration, publication or LeetCode submission is claimed.

### Stable finding mapping

All rows map to **818-SEARCH-R1** from the supplied request; these are its
implementation/evidence facets, not invented independently closed findings.

|Required facet|Fix|Candidate-specific self-check evidence|
|---|---|---|
|Preserve graph; improve resource use|Canonical Python is exact unbounded A*, both A/R edges, full-state best g, no geometric/time/state cap|tests/search.py executes actual Python with heap instrumentation; search-python.json records target6 BFS24 vs A*5 expansions and target100 BFS4332 vs A*692; generated entries and distinct states are separate|
|Concrete wrong approach and bound derivation|Target5 AARARAA and all positions/gaps; v=2 displacement0,2,6,14; derive maximum displacement, ceiling units and binary digits; separate toward/away/goal cases|Raw enumeration proves the sole shortest target5 word;455 independently replayed successful continuations bound-check actual Python h values; search-browser.json inspects complete rendered operands in both locales|
|Optimality, best-g and termination|Goal only on nonstale minimum-f pop; frontier-prefix argument; strict improvement, stale skip, finite-prefix termination; no DP proof claim|Exact actual-Python pop/enqueue streams match JS for3,5,6; target5 genuinely improves (2,-1) from g6 to5 at event17; pending obsolete g6 entry labeled as stale, not as a stale pop|
|Complete manual search and faithful frames|Default6, presets3/5; full current state, both children, labels including previous best g; sorted (f,-g,p,s) frontier view; retained pop history; goal generates no children|search.cjs checks both transitions, tuple order, bound operands and independently recomputed cumulative counters; search-browser.cjs walks every frame in EN/zh and checks current/children/frontier/history, rewind/replay and disabled endpoints|
|Causal source bridge and actual runtime|Local explanations of heapq, tuple order, best.get with infinity, // and bit_length; conservative heap-aware complexity and nonmutation/interface|Actual Python returns official3→2,6→5, raw-oracle1..25, seeded and power boundaries, difficult9809→56,9879→55,10000→45; distance-DP agreement is numerical corroboration only|
|Preserve old controls, locale and access|Sandbox/BFS/prediction untouched in behavior; new preset affects only its own trace; locale preserves all controls; reused tokens/48px controls and wrapping ledger|Preservation browser suite passes all old paths and new search suite checks isolation/roundtrips, keyboard Enter/focus, forced colors,320/390/736/1440 and CSS zoom=2 at1280×1000; offline-search.json adds new trace under blocked storage|
|Exact canonical bytes|Regenerated python-code.js directly from solution.py with final newline|Preservation browser compares mirror, textContent, successful copy, native fallback and download without trimming; per-locale fresh verified clipboard sentinels and Linux Control+C. Offline mirror also exact|
|Metadata and frozen identity|complexity is one nonempty time/space string, updated heap bound and description/topic; new candidate manifest|Safe preflight below exits0; candidate.json hashes source, mirror, metadata, tests, docs and evidence; source SHA receipt in source-identity.json|

### Reproduction and observed results

From repository root, using the existing NODE_PATH and
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH (Linux ARM64 Chromium):

```sh
EVIDENCE_DIR=leetcode/818/tests/evidence/search-r1 python3 -B leetcode/818/tests/check.py
python3 -B leetcode/818/tests/search.py
EVIDENCE_DIR=leetcode/818/tests/evidence/search-r1 node leetcode/818/tests/core.cjs
node leetcode/818/tests/search.cjs
EVIDENCE_DIR=leetcode/818/tests/evidence/search-r1 node leetcode/818/tests/browser.cjs
node leetcode/818/tests/search-browser.cjs
python3 -B scripts/register_leetcode_lesson.py 818 --validate-only
```

All commands passed. Preserve evidence on reruns: existing runners accept
EVIDENCE_DIR; the three new search runners use their explicitly named search-r1
folder (back it up or adapt only the output destination for a reviewer rerun).
Numerical checks:52 recorded cases plus13 closed-form power boundaries.
Instrumentation reports actual stale pops1471/1259/242 on9809/9879/10000 respectively;
small visible presets have no stale pop, so none is fabricated. Target5 has one
real better-g arrival. All difficult runs complete; no canonical caps or partial
answers. Timings in search-python.json include instrumentation overhead and are
not isolated resource benchmarks. Target9809 stores669016 distinct pairs on this
candidate, matching the count as an observation only; old survey results are not
transferred as validation of these bytes.

Failing feedback loop: tests/search.cjs initially exits1 because the required
A* trace function is absent (red.txt). Same command now passes (search-js.log).
Ranked falsifiable hypotheses were stated before the change: (1) ordering on the
same graph can reduce exploration; measured small comparisons confirm it;
(2) position-only merging could retain reversals; the bounded bad-rule test fails
to reach5 and the R transition explains why; (3) distance-only pruning could
preserve an optimum; independent raw enumeration disproves it via the sole
shortest word's3→2 step. Production retains both edges and all full states.

A browser harness initially tried to click Reset after preset selection already
reset it; native disabled semantics correctly prevented that click. Original
failure is search-browser-harness-red.log. The harness now checks disabled state
before resetting, without changing application behavior or weakening assertions.
Both search-browser.log and preservation-browser.log pass after that correction.
No DEBUG instrumentation was added to production code.

Visual inspection opened en-320-search-improved, zh-320-search-goal,
en-search-zoom200 and zh-1440-search-improved. The real g6→g5 improvement and
its prior value remain associated with the R child; goal has h0 and no children;
rows and numeric operands wrap without shrinking or overlap. Screenshots capture
an ordinary scrolled viewport, so some neighboring content is outside the image;
the full history remains scrollable. Search and preservation suites record no
page/console errors or failing asset requests. Existing local-only asset paths
remain; combined CSS remains11117 bytes. Calibrated contrast helper checks black,
white, RGB primaries,21:1 and the #747474 near-threshold failure, then measures
actual reused foreground pairs: text on panel2=13.3971, muted/disabled=6.4494,
orange=8.9372. Muted meets AA but not preferred7:1, as before.

Official interface evidence was re-read from lesson-local official-graphql.json:
Python3 class Solution / racecar(self,target:int)->int is available; TypeScript
function racecar(target:number):number is also available. Preferred faithful
Python is retained; no non-Python language contract or supportedLanguages omission.
The exact policy source/mirror pair is solution.py/python-code.js/PYTHON_SOURCE.

**Metadata gate:** from repository root,
`python3 -B scripts/register_leetcode_lesson.py 818 --validate-only` exited0 with
empty stdout and stderr. Full timestamp/cwd/command/result is recorded in
metadata-preflight.json. This was validation only, with no registration or
shared metadata/state changes. Metadata is frozen in the new candidate for
separate independent review.

### External handoff boundary

Root owns the required frozen-source Mac full-range survey and isolated resource
measurements before a fresh reviewer begins, at the prescribed
specs/reviews/818-review-search-resource-measurement-20261026.md. That file is
expected to be absent during authoring. Supply source-identity.json and the
canonical solution.py; verify SHA256 before measuring. This author candidate is
ready for that handoff and separate re-review, not independently accepted.
The separate reviewer must cold-walk the new bridge, audit the proof, bind the
external measurements to this source, and explicitly close818-SEARCH-R1.
Real devices, actual browser zoom through platform UI (the tested method is CSS
zoom), screen-reader speech, full-range candidate survey, Mac resources, official
judge limits, public delivery and learner outcomes remain unverified here.

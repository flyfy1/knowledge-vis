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

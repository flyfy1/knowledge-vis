# #630 Course Schedule III — author brief

Product-fit verdict: reuse the approved collection lesson, no new layout or service.
Authority: specs/reviews/leetcode-all-hard-design-review.md and dispatcher adjudication;
WORKFLOW.md, UI-I18N-SPEC.md and the four explainer/trace/review/rendered-state contracts.
Website-design skill applied. This is author work; independent review remains pending.
Category computing; stage university; audience: readers who know lists and loops.
Smallest useful outcome: hand-compute a replacement, justify deadline order and
longest removal, then implement the official Python submission.
Learning loop: calculate → break a tempting rule → reverse a trace → predict → map to code.

## Official contract
Verified 2026-10-25 from https://leetcode.com/problems/course-schedule-iii/ and public
https://leetcode.com/graphql/ question query. Full response: tests/evidence/official-graphql.json.
Python3 selector gives Solution.scheduleCourse(self, courses: List[List[int]]) -> int.
Courses are nonpreemptive, sequential, start day 1, finish <= lastDay. Return count,
not a sequence. 1<=n<=10000; 1<=duration,lastDay<=10000. No prerequisite graph.
Examples: [[100,200],[200,1300],[1000,1250],[2000,3200]]→3; [[1,2]]→1;
[[3,2],[4,3]]→0. Empty input is outside official constraints, tested as robustness.
Python chosen as faithful preferred interface. No premium/access exception.

## Steps (five fields each)
|Step|Already known|Single question|Input → requested quantity|Action → observation|Conditions|
|0|Addition, elapsed days|Can keeping an earlier choice lose a course?|A=(4,4), B=(2,5), C=(2,6) → maximum count|Toggle keep A / replace A; see 6>5 versus B+C=4<=6|Positive durations, inclusive deadlines|
|1|Feasible schedule|Why deadline order, then remove longest?|Tiny example; exhaustive subset baseline → safe discard|Read adjacent-swap argument and first-overload exchange proof; compare shortest-first counterexample|One machine, no prerequisites/release days|
|2|Replacement rule|What changes at one processed course?|Five fixed inputs → sorted prefix state|Forward/back/reset/end; persistent course statuses and operation ledger show candidate sum, removal, repaired sum|Completed frames only; all presets restart trace|
|3|Prefix optimum and saved days|Which course should be removed in a fresh case?|[(5,5),(4,6),(2,7),(1,7)] → final count|Choose then reveal; change answer clears result|Independent of trace; no solution visible before reveal|
|4|Greedy rule|How is longest removal implemented cheaply?|Official Python source → returned count and cost|Open source/copy/download; inspect mapping|Heap of negative durations; sorted copy preserves input|

## New terms / dependencies
Step 0: duration = uninterrupted days, deadline = last permitted finishing day,
feasible = every selected course finishes by its own deadline; elapsed total = last finishing day.
Step 1: prefix = first k in deadline order; baseline = correct small-input enumerator;
exchange = replace a choice without reducing count. Define all again near use.
Step 2: heap = tree-backed priority collection exposing largest duration via negation;
array slots are storage positions, not schedule order. Trace shows selected schedule in deadline order.
Step 3: invariant = condition maintained after each course; repeat local meaning.
Step 4: n = input count; negative-duration min-heap explained again; tutorial snapshots excluded from cost.

## Visual/state contract
DOM course cards keep original identity #0 etc., pair duration/deadline and retained/rejected/pending
text. Selected schedule shows cumulative finish days with each deadline. Ledger records every
processed candidate total and removed ID. Initial frame empty; each next frame completes one
push plus optional pop. No temporary overload is mislabeled feasible. No autoplay or execution
service. The browser is a simulation; Python is separately executed by tests.
State x locale: initial/middle/end x five presets; unanswered/selected/revealed/correct/incorrect/
changed/reset; copied/fallback selected source; source closed/open. Locale preserves everything.
Loading/reconnect/expired inapplicable to local synchronous assets. Disabled endpoints remain readable.

## Exact shared design tokens
Use ../style.css unchanged: bg #0d1117, panel #161b22, panel2 #1c2330,
line #2b3547, text #e8edf4, muted #9aa7b8, accent #6ee7ff,
accent2 #ffb454, good #7ee2a8, bad #ff7a93. Explain text #c9d4e2,
step alternate #0a0e14, code background #090e16 remain shared.
System font stack, shared 1000/952px widths, 64/24px section spacing, 14px
stage radius, 8px controls, 3px focus +4px offset. Local CSS only adjusts
48px targets, wrapping, selected identity borders, disabled opacity. No animation.

P0/highest-return 20%: causal concrete replacement, reversible accurate trace, bilingual
state and code parity. Done requires oracle/browser/contrast/preflight evidence.
P1: completed-operation ledger and multiple boundary presets, included.
P2: decoration none. Deferred: custom editor / playback (not needed for one clear loop),
new shared framework (no justified consumer), real novice study and independent acceptance
(separate reviewer), production checks (no deployment authorized).

## Verification plan
Independent subset oracle, exhaustive short arrays, seeded cases, official examples,
10k-course boundary, input immutability; prefix feasibility and optimal counts; browser both
locales/presets/endpoints/replay/predictions/copy success+fallback/source/download/blocked
storage/local assets/focus/320,390,736,1440 and 200% zoom. Evidence output path configurable.
No claim of LeetCode submission, learner outcomes or independent acceptance.

## 2026-10-25 repair contract — 630-MAC-001

Reuse the approved layout and tokens. The dispatcher finding authorizes a narrow
label repair: all five selected presets retain their identity and explicit output
course counts; their full arrays stay in inputRead. Shorten labels locally, keep
16px type, native selection, shared font, inputs and trace semantics. Bump only
the changed copy asset reference. No new feature/layout or independent acceptance.

P0/highest-return slice: readable closed labels at 320/390 and desktop, both
locales and a locale roundtrip; rendered-control regression plus exact input and
count checks. P1: synthetic 20px sensitivity check, separately labeled. P2: none.
Deferred: native Mac evidence must come from a Mac running the frozen candidate;
Linux passing cannot close this integration finding. Retain the original probe
unchanged and supply its checksum and rerun instructions for that handoff.

## 2026-10-25 follow-up repair — 630-MAC-002 / 630-MAC-003

Reuse the approved page and native selector. P0/highest-return work is an explicit
visible output scope in the selector label (`Input preset · maximum courses` /
`输入预设 · 最多可选门数`) and a manual-copy assertion that distinguishes fresh
transfer from stale clipboard contents. Option identities/counts, full inputs,
16px type and shared tokens stay as approved. No new feature or layout.
P1: retain paired scope/control crops and a bilingual clipboard negative control.
P2: none. Deferred evidence: native Mac unchanged clipping probe and fresh
independent review of this candidate; Linux cannot resolve native Mac closure.

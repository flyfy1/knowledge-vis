# 818-RESOURCE-R1 — incomplete author investigation, 2026-10-26

**Blocked; no revised submission or learner-facing candidate is proposed.**
The prior accepted BFS and its candidate.json are unchanged. These files are
investigation evidence, not independent review, a closure, or a new acceptance.

Read the resource request, its independent design/adjudication, existing BRIEF,
teaching/trace/review specs, rendered-state contract, exact registration
source/mirror mapping, and local website-design and diagnosing-bugs skills.
This is a requested resource improvement, not a newly reproduced output bug.
No old large BFS was rerun; the request explicitly forbids doing that on Pi.
No historical report, acceptance, registry, service or shared file was changed.

## Finding mapping and missing evidence

| Stable ID | Author outcome | Required next work |
| --- | --- | --- |
| 818-RESOURCE-R1 | OPEN. No claim that the proposed two-alternative recurrence covers an optimum. Existing complete-state BFS preserved. | Establish a reconstructable completeness argument, including omitted first-run lengths and negative excursions, before replacing the submission. Then implement the approved distance-DP bridge and all bilingual transition checks. |
| 818-RESOURCE-R1 / resource evidence | OPEN. Host is Linux; no Mac measurement is represented here. | Run isolated revised-candidate measurements on Mac for 9809, 9879, 10000 and compare to the archived observations. Do not rerun the old high-memory BFS on Pi. |
| 818-RESOURCE-R1 / metadata | Current unchanged lesson passes the non-mutating metadata gate. This does not validate an unfinished improvement. | Repeat on the eventual frozen revised candidate. |

The requested proof is material: f(d) with d>0 assumes unit speed **toward**
the target. Translation/reflection does not turn an away-facing unit state into
that same positive-distance subproblem. Witnesses establish upper bounds only.
Neither the old test's distance recurrence nor matching a second implementation
of it supplies the missing optimal-path argument.

## Exploratory alternative, deliberately not installed

`probe_budget_unpruned.py` explores normalized **signed** remaining distance d
and remaining command budget b, starting at unit speed +1. A run of k A commands
travels 2**k-1. If it does not terminate there, A**k R costs k+1 and leaves,
after translating and reflecting, signed distance 2**k-1-d with budget b-k-1.
Enumerating k=0..b-1 includes initial reversal, negative excursions and long
overshoots. Budget strictly decreases; no positive-distance-only normalization
or first-run exclusion is used. It is a finite search for each supplied budget.
The exploratory driver's search cap of 99 is a diagnostic limit, **not** a
proved universal upper bound or a proposed submission boundary.

Observed unpruned exploratory results on this Linux host (wall times are local
observations, not Mac resource comparisons): 9809 -> 56, 2,949,258 cache entries,
about 5.93 seconds; 9879 -> 55, 2,425,208 entries, about 4.57 seconds;
10000 -> 45, 566,269 entries, about 0.82 seconds. This still allocates substantial
state and does not supply the requested bottom-up smaller-distance argument.

`probe_budget.py` additionally experiments with a weighted signed-power lower
bound for pruning. Its local output is in `probe-budget-output.txt`. That pruning
argument has not been independently validated; those outputs are **not** claimed
as an oracle, submission validation or a completed resource fix. The prototype
is kept here so the investigation can be inspected instead of silently treating
it as production code. No UI, canonical source, mirror or metadata was changed.

## Preservation checks actually run

From repository root, with the existing NODE_PATH and Chromium executable:

- `EVIDENCE_DIR=leetcode/818/tests/evidence/resource-r1-investigation node leetcode/818/tests/core.cjs` — exit 0. Complete small BFS layers, raw-command oracle, localization key/shape checks.
- `EVIDENCE_DIR=leetcode/818/tests/evidence/resource-r1-investigation node leetcode/818/tests/browser.cjs` — exit 0. Both locales; all old presets/frames, backward/reset/end, sandbox, prediction changes and locale retention, exact source display/copy/download/offline mirror, per-locale fresh-sentinel native fallback, narrow widths and 200% CSS zoom, keyboard/focus and console/network checks. Details in browser-results.json. These are preservation checks on the old lesson; they do not test an unimplemented DP bridge.
- Actual unchanged `Solution.racecar` against independent raw-command enumeration for 1..25 — all 25 pass; records in preserved-python.json. The old large Python test runner was intentionally not run because it executes the resource-heavy BFS at large targets.
- `python3 -B scripts/register_leetcode_lesson.py 818 --validate-only` — exit 0, empty stdout/stderr; command, cwd, platform and timestamp in metadata-preflight.json. Complexity remains one nonempty string covering time and space.

The faithful official Python callable remains selected; no non-Python language
contract is necessary, and no preferred interface has been removed. No commit,
push, deployment, registration, service changes or child agents occurred.
A fresh independent review remains necessary **after** the algorithm proof,
implementation and evidence have been completed. The current investigation must
not be used to close 818-RESOURCE-R1.

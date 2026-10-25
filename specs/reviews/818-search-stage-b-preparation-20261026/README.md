# Stage B preparation: adopt measured #818 evidence and resume review

**Not dispatchable.** `REVIEWED_PINS_SHA256 = None` rejects even the correct dispatch
token before reading a pins file or runtime. No frozen recovered author candidate or actual
measurement exists yet. Root must complete the steps below, freeze exact future
pins/operator hashes, and arrange separate independent review before enabling use.
This folder contains no live pins and authorizes no production action.

The one-off operator's interface is a reviewed pins file plus explicit dispatch.
It adopts one report and one exact evidence directory, changes only saved
`expected_head`, then starts an ordinary fresh review. It does not measure, author
the lesson, rewrite previous review/acceptance, or add a campaign framework.

## Required frozen inputs

First require the successful recovery receipt
`818-search-author-startup-recovery-20261026-32c8d741.json`, status `waiting-for-Mac`,
with the exact `-author-to-mac` owned STOP still present. Bind its receipt hash,
STOP hash, stopped progress hash, release-ledger hash, candidate, full lesson tree,
canonical source SHA and original author run. Revalidate clean actual/saved HEAD,
the entire 984-ID queue, no live checkout/runner/native process, unchanged policy
and launcher, and the review_pending #818 entry. Recovered author historical state and
source identities must agree; a lesson hash alone is insufficient.

The original receipt `import968972-search818-stage-a-20261026-4b7e902d.json`
remains failed and immutable (SHA256
`723aa5cf0ddc654e05eeb091ee499f2423cffdbcdd2bf2e1893ce80466e618ad`).
The new receipt must name it in `recovery_of`, retain
`failed_stage_a_receipt_preserved: true`, and bind the recovery-owned STOP and
its transaction. The compatibility field `stage_a_complete: true` denotes the
**recovered author handoff**, not a rewrite of the original failure. For the same
reason, future pins key `stage_a_receipt_sha256` binds the new successful recovery
receipt only. The original failure hash is checked before adoption/resume and
after the fresh review starts; no prior receipt is written.

Root runs the separately reviewed Mac harness on copied immutable canonical bytes.
Only a completed successful full-range/isolated result may proceed. Root writes:

`specs/reviews/818-review-search-resource-measurement-20261026.md`

It must identify the exact frozen candidate, canonical source SHA, reviewed
harness SHA and evidence directory, distinguish empirical measurement from
algorithm proof/lesson acceptance, and describe coverage, isolated resource data,
environment and limits. This operator checks binding/identity, not prose quality;
root and the future independent reviewer still inspect that report.

Use a fresh directory matching
`specs/reviews/818-evidence/818-search-mac-20261026-<12 lowercase hex>/`.
Copy the harness's six files byte-for-byte: `canonical.py`, `environment.json`,
`survey.jsonl`, `isolated.jsonl`, `progress.json`, `summary.json`. Add `binding.json`
with exactly these keys:

| Key | Required binding |
| --- | --- |
| `candidate`, `lesson_tree`, `source_sha256` | Frozen recovered author identity |
| `harness_sha256` | `94a3d9c9567af65c32bdd72bddd3d1eaa167a8e9d901335237a89ba5880a7386` |
| `summary_sha256` | Exact measured summary bytes |
| `report_path`, `report_sha256` | Fixed report above and its exact bytes |
| `evidence_prefix` | Exact fresh directory including trailing slash |

Commit only that immutable evidence/report through root's ordinary source workflow.
The future pins must include exact `source_revision`, `files` path→SHA mapping,
`evidence_prefix`, `candidate`, `lesson_tree`, `source_sha256`,
`stage_a_receipt_sha256`, `stop_sha256`, `progress_sha256`, `ledger_sha256`,
`policy` path→SHA mapping and `launcher_sha256`. Required runtime/policy paths are
explicit in `REQUIRED_POLICY`; include other current policy pins as appropriate.
Set no guessed candidate/receipt values. Pin the actual completed evidence commit,
not moving main. Operator changes needed to set the reviewed pins digest also
require exact independent review.

## Evidence and adoption guards

Validation checks the eight-file allowlist, every pinned file hash, canonical
source, reviewed harness, Darwin/full-range environment, successful immutable
summary and its own artifact hashes. It independently parses all 10000 distinct
targets and every isolated row; failure, unobserved result, noninteger answer,
missing small-BFS comparison, numerical mismatch, invalid RSS/time or wrong source
identity refuses. Isolated coverage must include 9809/9879/10000 and the actual
maximum-call-time and maximum-RSS targets selected from survey rows. It verifies
the report binding rather than trusting a `passed` label alone. Reference DP
agreement remains numerical corroboration; no proof is manufactured.

Under existing checkout/state and release locks, fetch only the fixed evidence
commit, add exactly the new report/evidence paths, verify byte/mode/parent scope
after commit hooks and preserve all `leetcode/818` bytes/tree. Checkpoint changes
only `expected_head`; timestamps, current pointer, problem candidate, historical
reviews/runs, queue and ledger remain unchanged. Push that exact adoption head.

Before resume, actual digest eligibility must be below20, with no pending release
or same-digest pointer refresh. The first nonterminal entry must already be #818
review; an unexpected earlier registration is refused rather than simulated.
This is narrower than the original Stage A import phase, which already handled
any registration prefix before the separately recovered author launch.
Remove only the exact owned STOP, launch the existing continuous/max6/every20
runner once, and prove a new #818 reviewer ID/thread/turn/native descendant.
The ordinary runner updates #818's candidate to the evidence-adoption head before
review; only this expected candidate refresh is permitted. Historical reviews,
runs and ledger remain intact. Success means `completed-review-running`, never
accepted or published.

Failure retains actual Git/state/evidence and an inspection-required receipt;
if the validated STOP was removed, restore it only when no STOP exists. Never
replace foreign STOP content, reset acceptance, retry blindly, or launch a second
worker. SIGTERM enters this same preservation path; no agent is signaled.

## Preparation evidence and remaining gates

Fifteen local tests cover synthetic full-range artifact structure, tampering,
limited coverage, wrong harness/platform, duplicate/missing/failed targets,
isolated worst-case omission, source/report binding, exact expected-head-only
checkpoint, real runner candidate refresh at review dispatch, stale/reused review
identity and default refusal before runtime access. The 10000-row synthetic
fixture is **not** an actual candidate measurement or numerical acceptance claim.
The real runner test intercepts `run_agent` before any real agent starts.

No Pi mutation, source authoring, full-range execution, measurement report or
candidate acceptance was performed. The successful recovered handoff receipt and actual Mac evidence are
pending. After they arrive, revalidate real artifact compatibility, freeze pins,
complete independent operator review, and obtain root's separate exact dispatch.

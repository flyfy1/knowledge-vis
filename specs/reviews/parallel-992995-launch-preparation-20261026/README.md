# Disabled #992/#995 launch preparation

Prepared 2026-10-26 while the approved #982/#987 import waits for its natural
boundary. **Pending, not launch-ready.** No launcher/preflight execution, remote
file write, checkout, reservation, STOP change, worker, commit or push occurs here.
Do not execute either pending template: the unchanged launcher opens its lock
before validating eligibility, so placeholders are not an execution sandbox.

## Sources and bounded adaptation

The reviewed #982/#987 launcher is
`specs/reviews/parallel-982987-evidence-20261026/launch.py`, SHA-256
`042e95a37d31100524e862db7e354e664310df535eccd7736aa2415c16196463`.
Exactly **nine parameter substitutions** produce [launch.pending.py](launch.pending.py),
SHA-256 `774fa491b7fff4af8b6ed2c8b5384542167e1d7e4c8208e46c550a4e25aba7c5`:
six unresolved BASE/runtime pins, target ID list, pair lock and ID/port plan.
Reverse substitution restores byte-identical original source and AST. Launcher
control flow is unchanged; the rendered-state policy stays
`816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c`.

| Parameter | Pending plan |
| --- | --- |
| Targets / ports | #992 / 18797; #995 / 18798 |
| Branches | `codex/lane-992-20261026`, `codex/lane-995-20261026` |
| Checkout/state | Existing per-ID paths, fully listed in parameter-map.json |
| Six unresolved pins | BASE, central HEAD, run, problem, stage, session |
| Official dispatcher prep | `d3d2aa8eb61c17081beffdca687f9f2d15555973` |

[preflight.pending.py](preflight.pending.py), SHA-256
`3e4c86cc817899ea31b76be9f2bd8222a709995ca21b84eb23fdcb8edb3a19d7`,
adapts the reviewed preflight `ec01c22261e9150cc5c45a01754ac3179e7a69ac84c900cff2c3d36e33ec70e2`.
This separate adaptation is explicitly shown in [preflight-adaptation.diff](preflight-adaptation.diff);
it is not described as a parameter-only launcher change. It replaces the old
#843-specific completion gate with this import's actual receipt and ordinary
author/fix/review observation, retaining the exact phase-specific ownership checks.

## Required completion and final freeze

1. Require the exact external receipt
   `STATE/import982987-only-20261026-891ce2d4.json` to say `completed-resumed`.
   Set immutable BASE only to its actual `pushed_head`, also matching its
   `ordinary_resume_proof.agent_candidate`, with nonempty `fresh_agent` proof.
   Current pre-import HEAD `7fd4aa4…` is not a permissible substitute. No future
   completion, BASE or active identity is inferred here.
2. Before any runtime module import, hash-check the actual transferred file
   `/home/songyy/projects/leetcode-hard-campaign-state-20261018/import982987-only-20261026-e0e53065/pins.json`
   against `0d9dec18554ed18154ac5b4137371b08382bd217c290149fd048a46987387a01`,
   then every runtime/policy source listed in it. Root and campaign_runner
   independently confirmed this external path; the read-only observation checked
   its exact bytes. The approved operator source is
   `8f7d005b91072d953251ecb7f3188388b873351a`. These pins have no `source_revision`
   field. The static-builder dependency's fixed-source comparison uses their
   hash-pinned `lane_base` (`854d1bdc83efc13ae49716190ba8db858e4dd0fc`), whose commit
   and blob already exist in central ancestry, in addition to the current-file
   hash. It does not fetch the operator source merely to satisfy this check.
3. Capture a currently running ordinary author/fix/review, matching run role and
   problem, with a fresh thread/started turn and no terminal turn event. Require
   exactly one central runner and its actual native child, correct cwd and exact
   output-run binding. Match `same_shared(BASE, current_HEAD)` only after runtime
   hashes pass. The final enabled launcher must pin the exact observed current
   HEAD/run/problem/stage/session; natural advancement requires refreshed evidence
   and root review, retaining immutable BASE.
4. Keep `--untracked-files=all`. Author/fix edits must belong only to the exact
   current numeric lesson prefix proven by that phase's prompt metadata and
   ownership instruction; renames refuse. Review allows only exact prompt-bound
   untracked report/evidence paths and no tracked edits. No broad lesson-directory
   allowance or invented clean-worktree requirement replaces those rules.
5. Require STOP absent, queue 984, all previous reservations imported, target
   records/runs/directories/branches/reservations absent, no ID/port conflicts,
   available memory >1 GiB, free/bindable ports, and stable final state/head/native
   identity. An enabled preflight and exact launcher require fresh root review
   and separate dispatch authorization. They remain pending here.

After such authorization, unchanged launch gates would observe runner counts
1 then 2 before each spawn, use nice 10 / max rounds 6 with no publication options,
and require fresh lane thread/turn events. Actual post-dispatch proof must establish
three runners and distinct live native/session identities. Preserve any partial
spawn/timeout and observe the same handle; never blindly rerun. None is performed
by this preparation.

## Dated read-only observation

At **05:59:40 SGT**, central actual/saved HEAD was `7fd4aa457c318f053d7dc722fd63b3012bccb838`,
recorded #854 author, and the import receipt remained `waiting-for-natural-boundary`
with STOP present. Of 39 reservations, 37 were imported and #982/#987 remained
`started`; therefore the prior-import gate was not satisfied. #992/#995 were
unstarted at queue indices 205/206 with no matching record/run/reservation,
lesson/lane directory or branch. Ports 18797/18798 had no listener and temporary
bind checks succeeded, then closed. Memory available was 1,907,400 KiB. These are
transient observations, not reserved capacity, worker liveness or launch eligibility.

At **06:02:00 SGT**, [static-source-correction.json](static-source-correction.json)
confirmed root's required preflight correction: `cat-file -e` for operator commit
`8f7d005b…` exits 128 because that object is absent in central. The previous draft's
`git show` against it would therefore fail. After verifying the exact approved
pins hash, read-only checks confirmed their `lane_base` commit exists and its
static-builder blob and current source both match
`f92eca0575bfcf74a4b68b9d011470e99415f12b671328bba1cebf035ddfd12e`.
The pending preflight now performs these checks before module import. No fetch,
remote write or template execution was used; all six runtime pins remain pending.

The ordinary author pipeline independently fetches its official contract and
performs design, implementation and independent lesson review/repair. Dispatcher
notes are not injected into prompts or adopted into the shared tree as an author
brief. No policy/prompt change is proposed.

## Static validation only

Eight tests pass: exact byte/AST reversal and hashes, six pending pins, target and
policy mapping, rejection of STOP/import/publication control-flow mutations,
hash-before-import ordering, ordinary phase ownership/completion binding, and
dated observation integrity. They parse but never import or execute templates:

```sh
python3 -B specs/reviews/parallel-992995-launch-preparation-20261026/test_templates.py
```

`tests.log`, `parameter-map.json`, both diffs and `validation.json` preserve the
reviewable preparation. No final preflight or dispatch has occurred.

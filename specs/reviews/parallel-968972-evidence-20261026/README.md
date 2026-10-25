# Exact #968/#972 launcher preparation

Prepared 2026-10-26, then dispatched once after independent root hash review and
explicit authorization. See the [launch report](../parallel-968972-launch-20261026.md),
[dispatch receipt](dispatch.json) and [live census](live-launch.json). The sections
below retain the pre-dispatch source/guard evidence; validation.json describes
that preparation stage, not the later runtime status.

[launch.py](launch.py) SHA-256:
`012137ab9eabb43cb6b9038ab6065312d8287724540d67fb362038ac4a5caa05`.
Source is the proven #960/#964 launcher SHA-256
`943794458f663fe6734fc1eda2e877e38f7455acdf022b865c77a261be47eb68`.

The [exact diff](parameter-only.diff) changes nine parameter occurrences only:
BASE, central HEAD/run, central problem/stage/session, target-ID list, lock name
and ID/port plan. Inverting those substitutions reconstructs the proven source
byte-for-byte; constant-normalized ASTs are equal and Python parsing passes.
[Validation receipt](validation.json) binds the launcher and preflight hashes.
No function, control-flow branch, guard, prompt, review gate or publication option
was changed. Never import/run this launcher merely to check Python syntax: it has
intentional top-level deployment operations.

## Read-only preflight

[preflight.json](preflight.json), produced by [preflight.py](preflight.py) over
SSH stdin with `python3 -B`, records **02:31:57 SGT**:

- Frozen BASE and actual/saved central HEAD:
  `58cb97e51878f40e234b3e78a8bf9adb24f30c51`.
- Current #818 fix `818-fix-0dbe90734960`; session
  `01a17453-eaf8-7033-b7d8-04655e3b33c0`, with thread/turn events.
- Exactly one campaign runner, PID 1481177; actual native Codex descendant PID
  1481538, whose output/schema paths belong to that current fix run.
- Existing importer `same_shared(BASE, HEAD)` passes. Rendered-state-contract
  digest remains `d861a659f42607defb40f46505b02d0283be48a533127b40efa8c6bf543c4faa`.
- All 33 previous lane reservations are imported; STOP is absent; queue stays 984.
  Both targets are queued but have no problem/run, reservation, checkout/state
  path or branch. Ports 18791 and 18792 have no TCP listeners; actual bind checks
  remain in the launcher. Available memory: 1,863,184 KiB.

An initial read-only import probe lacked the local scripts module search path;
no eligibility result or mutation followed. The retained successful probe sets
that path and invokes the existing importer comparison without modifying it.

## Dispatch and provenance boundaries

These observations can expire as central progresses. The dispatcher must review
this exact hash and revalidate current guards before executing; a normal advance
requires a fresh read-only guard-pin refresh with fixed BASE/shared parity, not
waiving assertions or changing control flow. A partially spawned/timed-out run
requires receipt and exact-process inspection, never blind restart.

Fixed official/teaching preparation source
`ca4622c7af1d498ab4fa02dc76a40b44161d715f` remains dispatcher access evidence only.
It is not adopted into the central/shared tree or injected into author/reviewer
prompts. Standard authors independently verify official contracts and follow the
approved design/brief process; fresh reviewers retain their cold walkthrough and
normal independent acceptance requirements. The later launch is proven by its separate receipt/census; no lesson acceptance
is claimed by this preparation record.

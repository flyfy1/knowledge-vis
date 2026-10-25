# Disabled #996/#1000 launch preparation

Prepared 2026-10-26. **Not dispatchable: future #992/#995 import completion and
all final runtime identities remain unresolved.** No Pi file write, launcher
transfer/execution, reservation, checkout, STOP change, worker, policy adoption,
commit or push occurred. Only a bounded read-only target/port census was run.

## Sources, changes and early refusal

The launcher operational body derives from the reviewed #992/#995 pending source
`774fa491b7fff4af8b6ed2c8b5384542167e1d7e4c8208e46c550a4e25aba7c5`.
Its nine substitutions rename six pending parameters, the target ID list, pair
lock and port plan. Removing the explicitly declared disable line and reversing
these substitutions restores source bytes and AST exactly. **The operational
body's control flow is unchanged.** `parameter-only-body.diff` shows those changes.

To satisfy refusal before **any** write, each pending script also has one
unconditional `raise RuntimeError(...)` immediately after its docstring, before
imports, file reads or lock opening. This is a deliberate disabled-entry gate,
separately shown in `disabled-gate.diff`; it is not hidden inside a claim that the
entire script is parameter-only. Tests execute the disabled scripts locally with
imports/file access trapped and confirm the early exception occurs first. No
operational code runs. Future enablement requires explicitly reviewing removal
of this line after actual pins are available; do not strip it automatically.

The preflight body derives from reviewed final script
`1614f6868e620d276026bd0b49484c3389ef7f649dd61dc6cab449f0aacc9d86`.
`preflight-adaptation.diff` records its future receipt owner, unresolved BASE and
external pins source, target ports, dispatcher evidence reference and output labels,
plus the same disabled-entry gate. Runtime hashes still precede module import;
exact current prompt ownership, native identity and `same_shared` guards remain.

| Artifact / parameter | Pending value |
| --- | --- |
| `launch.pending.py` SHA-256 | `fbf19b825664c751d429a0eb54894c1559299a0ee207e3415ac90bc18431ad7b` |
| `preflight.pending.py` SHA-256 | `951a0879a35501af0151ca6e7094fd1d6f75294517faa9c0f6d07c3e44630a23` |
| Targets / proposed ports | #996 / 18799; #1000 / 18800 |
| Future import owner | `import992995-only-20261026-888bb6ac` |
| Future operator hash / transfer path | Unresolved; none invented |
| External approved pins path / SHA-256 | Unresolved placeholders; no old operation path reused |
| Completion receipt SHA-256 | Unresolved |
| BASE / current HEAD / run / problem / stage / session | Six unresolved placeholders |
| Runner / native identity | Unresolved external proof |
| Policy | `816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c` |
| Dispatcher-only official prep | `6d2a1b0e7109954d45f32a1dc47606e06c1c6f99` |

Per-ID lane branches/checkouts/states use the established pattern recorded in
`parameter-map.json`. No file or resource is reserved by naming it here.

## Future completion and launch conditions

The only proposed completion source is
`STATE/import992995-only-20261026-888bb6ac.json`. It must actually reach
`completed-resumed`; its `pushed_head`, corroborated by
`ordinary_resume_proof.agent_candidate`, supplies immutable BASE. Do not use
today's central HEAD, the previous pair's BASE, a request commit, or a proposed
future adoption revision. The actual final operator/pins transfer path and pins
digest must come from its reviewed transfer receipt; they remain null in the map.

After explicit enablement review, preflight must verify that actual pins file's
hash and all pinned runtime/policy bytes before importing the helper. The static
dependency's immutable source remains the validated pins' `lane_base`, with
object/blob/current-byte checks, avoiding a guessed source commit unavailable on
Pi. Only then run `same_shared(future_BASE, actual_current_HEAD)`.

Current ordinary author/fix/review must have a running role-matched record, fresh
thread/started turn, no terminal event, a live central runner and native child
with correct ancestry/cwd/output binding. Derive any permitted worktree files
from that exact prompt: author/fix only their specific numeric lesson prefix,
no renames; review only exact untracked report/evidence paths and no tracked edits.
Retain `--untracked-files=all`, final stable current/HEAD/native checks, STOP absence,
one central runner, finite queue 984, all previous reservations imported, target
absence, >1 GiB available memory and free/bindable ports.

The unchanged launch body still requires runner counts 1 then 2, nice 10, max
rounds 6, no publication arguments and fresh lane thread/turn observations. A later
authorized dispatcher must separately prove three runners and distinct live lane
native/session identities. Changed observation pins require reviewed refresh;
partial spawn/timeouts require observing the same handle, never blind retries.
No such final preflight or launch is performed by this preparation.

## Read-only observation and tests

At **06:30:46 SGT**, both targets were unstarted in the frozen queue at indices
207/208, with no record/run/run directory/reservation/lesson/lane directory/branch.
Ports 18799/18800 had no listener or reservation conflict and passed temporary
binds, then closed. The future import receipt did not exist. There were 41 lane
reservations in the census; their dated statuses are retained. These facts are
not acceptance, current-agent liveness, reserved capacity or launch eligibility.

Eight tests pass: launcher operational-body byte/AST reversal, exact declared
preflight adaptation, actual local disabled-entry refusal before import/file
access, unresolved pins, original runtime-hash/native/ownership gates, rejection
of STOP/import/publication changes, target/policy mapping and bounded observation
integrity. They neither contact Pi nor run the operational bodies:

```sh
python3 -B specs/reviews/parallel-9961000-launch-preparation-20261026/test_templates.py
```

`tests.log` and `validation.json` freeze this disabled proposal. Future authors
independently retrieve their official contracts and follow existing design and
independent review workflows. Dispatcher notes are not injected into prompts or
adopted into shared policy as an implementation brief.

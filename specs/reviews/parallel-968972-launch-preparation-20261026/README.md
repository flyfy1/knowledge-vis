# Proposed #968/#972 launcher parameters

Prepared 2026-10-26. **Not launch-ready.** This is a parameter-only proposal,
not executable launcher bytes. No Pi writes, reservation, checkout, worker, STOP,
shared prompt or policy change was made. Preserve the finite 984-ID campaign.

Reuse the proven [#960/#964 launcher](../parallel-960964-evidence-20261026/launch.py)
(SHA-256 `943794458f663fe6734fc1eda2e877e38f7455acdf022b865c77a261be47eb68`)
without replacing its control flow. The [parameter map](parameter-map.json) binds
that exact source and six dispatcher evidence files from immutable commit
`ca4622c7af1d498ab4fa02dc76a40b44161d715f`; these are not adopted into the central
shared tree. The map deliberately leaves future launch pins null.

## Proposed substitutions

| Existing location | Later value |
| --- | --- |
| Target-ID validation `['960','964']` and plan | `['968','972']`; plan `('968',18791), ('972',18792)` |
| Lock/operator/artifact names containing `960964` | Unique reviewed `968972` names; operator name includes its final hash |
| Repository/state/branch naming | Preserve dated templates, substituting 968/972 only; require all paths/refs absent |
| `BASE` | **Unresolved:** reviewed shared-tree commit chosen after successful #960/#964 guarded import and #818/#964 boundary transaction |
| `CENTRAL_HEAD`, `CENTRAL_RUN` | **Unresolved:** actual post-boundary head/current run; never copy old #780 values |
| Hard-coded central problem, stage and `thread.started` session | **Unresolved:** bind actual fresh central run/native process/event identity after boundary resume |
| `POLICY` | Re-read rendered-state-contract digest from the future frozen tree; retain its exact comparison, plus full shared-tree preflight |

A read-only Pi `ss -ltn`/reservation-ID census at **02:23:51 SGT** found no listener
or reservation using 18791/18792. They are only proposed ports, not reserved ports;
retain the existing bind checks immediately before later creation. Use fresh
unique operation names if the date or ownership context changes.

## Preserve the existing gates

Retain lock ownership; repeated `validate(1)`/`validate(count)` checks; exact central
HEAD/run/stage/session and actual process arguments; STOP absence; 984 queue length;
target membership with no problem/run; and all earlier reservations imported.
Preserve memory >1 GiB, worker-count progression 1→2→3, niceness ≥10, separate
checkout/state locks, six rounds, no publication arguments, exclusive reservation
creation, fsync/atomic receipt updates, and fresh thread/turn observation. An
observation timeout preserves the spawned receipt and exact process handle for
re-polling; it must not cause a duplicate launch.

The old launcher's `POLICY` constant checks only the rendered-state-contract file,
not the entire shared tree. As in the prior preparation, separately prove the
unchanged importer's `same_shared` equality for future lane BASE and the live
central head. Do not relax that guard to make the new documents fit.

## Gate incompatibilities to resolve before final bytes

1. **Prior work/import boundary is mandatory.** Wait for accepted, exited #960/#964
   lanes and successful guarded import/#818/#964 follow-up transaction. Revalidate
   all target absence and reservation status afterward. Earlier state/HEAD/session
   observations in the preparation are not launch pins. If central is stopped,
   paused, registering or has no genuine active agent, the reused running-stage
   guard fails; do not waive it or invent a run. A later actual resumed stage must
   supply the pins, accounting for intervening registration-only steps.
2. **Keep dispatcher evidence outside the shared-tree adoption.** Paths under
   `specs/reviews/parallel-968972-preparation-20261026/` count as shared under the
   importer, unlike excluded numeric review paths. The dispatcher explicitly
   decided **not to adopt them into central or lane BASE**, and not to change
   `run_agent` or prompts. Their fixed source is ordinary access/preflight evidence
   for dispatch only; no additional document-adoption gate is required.

## Dispatcher adjudication: original preparation is not author context

The existing runner substitutes catalog metadata and the standard author prompt;
it does **not** inject these teaching notes. The normal author independently
fetches/verifies the official statement/interface and develops the lesson under
the reviewed design and specification. The dispatcher judged that existing flow
sufficient. Do not claim mere checkout presence delivers the notes, add a context
parameter, alter catalog metadata or seed lesson implementation. This is a
parameter-only reuse of the established author/reviewer machinery.

## Author/reviewer boundaries

The fixed payloads and teaching notes inform dispatcher preparation only; they
are not proofs, required author context, approved BRIEFs or independent acceptance.
The author must still verify official
access/contract, read the established design adjudication and website-design
skill, write the local brief, and obtain new design review if departing from the
approved pattern. No prefilled algorithm or widened scope is authorized.

Preserve the independent reviewer's cold browser walk before source/BRIEF/context
inspection. There is no teaching-note injection into either author or reviewer prompts.
Dispatcher evidence does not substitute for independent reconstruction, execution
or six-dimension gates. Official evidence is audited under the existing flow.
The future operation needs exact reviewed launcher bytes/hash and live preflight;
this document does not make it ready or authorize execution.

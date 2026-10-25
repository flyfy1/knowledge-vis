# Disabled #1001/#1012 launch after #854 bridge adoption

Prepared in the original main checkout, 2026-10-26. **Not dispatchable.** No Pi
access, fetch, preflight, launcher execution/transfer, reservation, checkout, STOP,
worker, policy/runtime change, commit or push occurred. Both scripts retain an
unconditional `RuntimeError` immediately after the docstring, before imports or
any file access. Proposed ports18801/18802 are neither reserved nor verified free.

## Source and future receipt

The source is the reviewed disabled #996/#1000 after-995 template. Complete
reversible substitutions and source hashes are in `parameter-map.json`; the two
`.diff` files show every change. The launcher changes the gate explanation, six
pending parameter labels, target list, pair lock and port plan. Its operational
control flow is unchanged. Preflight updates those target/source parameters and
the receipt schema described below. No original template was edited.

The actual disabled #854 adapter was inspected at
`specs/reviews/854-bridge-adoption-preparation-20261026/operate.py`. Its owner is
**`854-bridge-adoption-20261026-185d4ba0`**. The future preflight must use its
completed receipt, not the earlier #996/#1000 import receipt or a proposed source
commit. It requires:

- exact future receipt digest and owner; `status == "completed-resumed"`;
- `queued_repair_id == "854"`, `queue_preserved is True`, `ledger_preserved is True`;
- BASE equals both `pushed_head` and `resume_proof.agent_candidate`;
- recorded fresh agent problem854/stagefix, matching the adapter's corrected
  startup contract; fresh **current** runtime identity is independently observed
  later and may have naturally progressed.

The additional fresh854fix assertion is explicit in the diff. Synthetic tests
reject author/review, wrong problem, wrong digest/owner and the old proof schema.
The source adapter's current hash is reference evidence only; it remains disabled
and is not treated as a future final operator or completion receipt.

BASE/current HEAD/run/problem/stage/session, runner/native, completion receipt
SHA-256, final operator digest and actual external pins path/hash are all unresolved.
No transfer path or final hash was invented. The future receipt/pins identities
must come from actual reviewed execution, then receive separate enablement review.

## Preserved safeguards and scope

The static dependency's Git object/blob/current-byte checks retain the future
receipt-bound BASE as source; #854 pins have no `lane_base`. Receipt and external
pins hashes, every pinned runtime/policy byte and the static dependency are checked
before importing runtime code. `same_shared(BASE,current_HEAD)` is unchanged.

The exact current native/session/ancestry/cwd/output, prompt-owned dirty paths,
`--untracked-files=all`, STOP absence, 984queue, target/run/directory/branch absence,
all prior reservations imported, >1GiB memory and future free/bindable ports remain
required. Launch starts with zero new lanes and one central worker, checks one
then two total workers before each spawn, and later requires three live runners.
Nice10, max-rounds6 and no publication arguments are preserved. Partial execution
must retain its handle and receipts; no blind retry or silent observation repin.

Existing #1001/#1012 dispatcher source notes remain at
`specs/reviews/next-10011012-preparation-20261026/`, committed source
`d36d073f970fd50d1cabbce310d8e3294829a53a`. They are not duplicated, injected into
author prompts or adopted as an implementation brief.

## Local checks

Eight tests pass: byte/AST reversal, early refusal with IO/import trapped,
unresolved identities/no readiness claim, synthetic bridge receipt controls,
preserved hash/native/resource/scope guards, actual disabled adapter schema,
rejection of guard weakening and exact artifact hashes. They perform no operational
preflight and contact no remote.

```sh
python3 -B specs/reviews/parallel-10011012-launch-preparation-20261026/test_templates.py
```

| Disabled artifact | SHA-256 |
| --- | --- |
| launch.pending.py | `59c7ed8b1ecea2c5a35711f72855ac6357aadfb8ffc8a5147e5d14ed214cd366` |
| preflight.pending.py | `8a2e5724bd0eea2c8dbc16e98ceb48ec604eee84cf16b93365b41f2dc64dd522` |

This is a local disabled preparation only, not a claim that current imports or
#854 adoption have finished, or that either target is currently launch-ready.

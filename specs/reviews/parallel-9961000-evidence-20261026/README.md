# Exact #996/#1000 launch proposal after the queued #995 handoff

Frozen 2026-10-26; **review required, not dispatched**. The original disabled
import-receipt and after-995 templates remain unchanged. This directory removes
the disabled-entry line only in the new proposal and binds actual completed
handoff evidence. No launcher transfer/execution, checkout, reservation, STOP,
Pi persistent write, worker launch, commit or push was performed by this worker.

## Actual completed handoff and immutable BASE

The existing #995 operator **1857482** reached `completed-resumed` at
**23:07:06.453480 UTC / 07:07:06 SGT**, then exited. Its actual receipt owner is
`995-copy-repair-20261026-9d027af3`, `queued_repair_id` is `995`, and both
`queue_preserved` and `ledger_preserved` are true. The receipt's `pushed_head`
equals `resume_proof.agent_candidate`:

**BASE = `6c68b23cc306067de5a912195a3c7edeebc2a0be`.**

`handoff-receipt.json` preserves original bytes; SHA-256
`86159f93f1a918035f10c47c6bbda09409b8a914c0320dfee40551b305eed343`.
The completed observation records operator absence. Earlier waiting/adoption
observations are retained as history and are not treated as completion.

`handoff-dispatch.json` records the actual transfer's `--pins` argument:
`/home/songyy/projects/leetcode-hard-campaign-state-20261018/995-copy-repair-20261026-9d027af3-dispatch/pins.json`.
Its actual bytes hash to
`b8daf2ba46ff675f5cc14f6ddca7e1816d14348b3438b228f13c4e6fa60ff93c`, matching the
reviewed handoff source. The actual operator bytes also match
`2cc99b2622895aaf3dc87c83131dfb4ab2b70e123a424845409dd428788fe280`.
No filename or directory was inferred from a digest.

## Frozen current identity and read-only result

The exact preflight ran through SSH stdin with `python3 -B`, exit 0 and empty
stderr, completing at **23:07:14.972442 UTC**. It verified receipt digest/schema,
external pins digest and all policy/runtime dependencies before importing runtime
code. Because handoff pins have no `lane_base`, the unchanged static dependency
object/blob/current-byte checks use the actual receipt-bound BASE. No fetch occurs.

| Parameter | Captured value |
| --- | --- |
| Current HEAD | `6c68b23cc306067de5a912195a3c7edeebc2a0be` |
| Current run | `871-review-5c5479d608a1` |
| Session | `01a17551-4500-7f91-b832-4d15fa2f15fa` |
| Central runner / native PID | 1865819 / 1866040 |
| Policy SHA-256 | `816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c` |
| Available memory | 1,912,520 KiB (>1 GiB required) |
| Targets / ports | #996 / 18799; #1000 / 18800 |

There is exactly one campaign runner, STOP is absent, all **41** reservations are
imported and the fixed queue has 984 entries. Neither target has a problem record,
run, reservation, checkout/state directory or branch. Both ports have no listener
and pass temporary loopback binds, then close. `same_shared(BASE, current_HEAD)`
passed. Live native ancestry/cwd/current-run output, thread/turn and final stable
state/head/native checks passed. Current review had no worktree edits; its only
permitted future untracked paths come from its exact report/evidence prompt:
`specs/reviews/871-review-1-04735bd3.md` and
`specs/reviews/871-evidence/871-review-1-04735bd3/`. Tracked changes remain forbidden.

A separate read-only observation confirms the exact HEAD is pushed, #995 is now
`changes_required` / `fix` while the old accepted review is preserved, and ordinary
#871 review remains current. The queue and release ledger hashes remain unchanged.
This does not claim #995 has already received its repair or another acceptance.

## Reviewable delta and checks

| Artifact | SHA-256 |
| --- | --- |
| `launch.py` | `75c880000eb7f66eff3c2758e84e045294e5a04a279dcbcfd6a7a0382f5088f8` |
| `preflight.py` | `d14d4e15b4fa53ff8a384b01e8a351d7e178af328bf5291cfdc7458c4c7e09be` |
| `preflight.json` | `2b7f3a75990192b61fe4ee07bf20ad6e0ae27a3466f97f2821d82926712bb64c` |

The launcher differs from the reviewed disabled after-995 source only by removal
of its explicit gate and six observation/BASE substitutions. Preflight differs
only by that gate removal and four actual receipt/BASE/external-pins substitutions.
`parameter-map.json`, `launch.diff` and `preflight.diff` expose the exact changes.
Reversal restores each original byte-for-byte and as an AST. The launch body still
uses nice 10, max rounds 6, one-then-two runner gates and no publication arguments.
No author prompt or dispatcher teaching notes were injected.

Eight final local tests pass. They check source reversal, real receipt schema and
hash, actual external transfer identity, six runtime bindings, native/resource/
target preflight proof, hash ordering, original scope and launch guards, and exact
artifact hashes. The earlier disabled schema tests also remain unchanged.

```sh
python3 -B specs/reviews/parallel-9961000-evidence-20261026/test_final.py
```

Independent/root review and a separate exact dispatch authorization remain
necessary. Any actual dispatch must immediately rerun this read-only preflight
and compare the frozen observations; if central has advanced, refuse and request
a reviewed observation refresh. Never silently repin. Any partial spawn must be
observed through the same handle, never blindly rerun. This folder is a local
proposal, not execution evidence or reserved capacity.

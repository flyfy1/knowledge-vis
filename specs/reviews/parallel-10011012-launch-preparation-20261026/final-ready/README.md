# Final #1001/#1012 launch proposal after #854 adoption

**Frozen proposal; no launch, transfer, reservation, STOP or Pi persistent write.**
Original disabled files are unchanged. Independent review and separate exact root
dispatch authorization remain required. No local commit was made by this worker.

The actual #854 operator1979827 completed and exited. Its receipt is
`STATE/854-bridge-adoption-20261026-185d4ba0.json`, raw SHA-256
`b806def3f37922cfda0d48e1f23afe52f7b450bed84d1a7abab0e71a7eef83b0`.
The exact owner/completed-resumed/queued854/queue-preserved/ledger-preserved fields
and recorded fresh854fix match the approved schema. **Immutable BASE is
`048d217b1313ec068fbf41fe3703f5f3e83dcc90`**, equal to both `pushed_head` and
`resume_proof.agent_candidate`, independently observed as the exact remote HEAD.

The actual dispatch arguments identify external pins at
`STATE/854-bridge-adoption-20261026-185d4ba0-dispatch/pins.json`, SHA-256
`2b6a396c630e912348d480ad295674745f73e672ca1c7007e1f79a78fbad041d`.
Operator, both helpers and payload manifest bytes also match their actual transfer
hashes before any runtime module is loaded. `capture-handoff-readonly.py` additionally
verifies all32 adopted files and four protected files **at immutable BASE**, source
candidate `27b9930daf25f9fb1651038bff1605969cb27f01`, runtime/launcher hashes, unchanged
queue and #995 entry/history, unchanged release ledger, no pending release or
lane-checkout processes, operator exit and STOP absence. It never executes the
adoption operator or fetches objects. #854/#995 remain changes_required; neither
has a new campaign acceptance by virtue of this capture.

## Exact fresh preflight

At **00:09:37.763447 UTC / 08:09:37 SGT**, the exact read-only preflight completed
with exit0 and empty stderr. Current HEAD is the BASE above. Current run is
`854-fix-4964d1606702`, session `01a17588-eeec-7b71-91f6-8bdbffe0305e`, runner
**1984564**, native **1984809**. Native ancestry/cwd/output, fresh thread/turn,
current-role binding and final stable identity passed. Only the exact prompt-owned
`leetcode/854/` dirty scope is allowed, with no renames; observed files were that
fix's untracked revision tests/evidence. No shared or foreign path allowance exists.

One campaign runner, all **43** old reservations imported, fixed984 queue, STOP
absent and `same_shared(BASE,current_HEAD)` passed. Both #1001/#1012 lack a problem
record, run, run directory, reservation, lane checkout/state or branch. Ports
**18801/18802** have no listeners/conflicts and passed temporary loopback binds,
then closed. Available memory is **1,939,200 KiB**, above1GiB. Policy remains
`816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c`;
release ledger remains
`163b32ba940e02a8f17c1ccaf5e9a9f6dfcd606491007d096faa9b971b45eda6`.

| Artifact | SHA-256 |
| --- | --- |
| launch.py | `b67d0a53fb067e21aa7a1f506f77d11343af8abe3ba1e7a9f6acc0073b987a46` |
| preflight.py | `63295fc43653f73801b9ef39fb4b96fe107ba1ab1c9bcae399081fd370ce2d97` |
| raw preflight output | `3130e00a4a2f7df74fd1d13ed688243f074a8c5017f00586af0970d48e938daa` |
| parameter-map.json | `e326dbd3baa893730a03afcb8c05c213eb3c265afef995a6251b4ad64e81ff9b` |

The launcher changes only six actual parameter values and removes its disabled
entry line. Preflight changes only four receipt/BASE/pins values and removes its
entry line. Exact reversible diffs are included. Runtime/static(BASE) hashes still
precede importer execution; original native/shared/resource/target/worktree gates,
nice10, max-rounds6 and publication-disabled lane behavior remain. No author context
was injected. The ordinary central every20 queue continues unchanged.

Eight local tests passed; no operational launch was tested. Raw receipt and full
preflight are preserved losslessly as deterministic gzip because the adoption
receipt embeds historical state (~3.9MB preflight output). `preflight-summary.json`
is the exact output excluding only the repeated full receipt; tests verify both
raw hashes and the summary relationship. No evidence was fabricated or omitted
from the compressed originals.

```sh
python3 -B specs/reviews/parallel-10011012-launch-preparation-20261026/final-ready/test_final.py
```

Before any separately authorized dispatch, rerun `preflight.py` read-only and
explicitly compare frozen HEAD/run/session/runner/native. On advance or mismatch,
refuse before transfer and request reviewed observation refresh; never silently
repin. Any partial spawn must be observed through its existing handle, not retried.

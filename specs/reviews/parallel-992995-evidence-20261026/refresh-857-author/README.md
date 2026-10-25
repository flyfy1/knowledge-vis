# #992/#995 observation refresh — #857 author

Prepared 2026-10-26 after the approved attempt refused **before transfer, zero
spawn** when central naturally advanced from #854 review to #857 author. The
original approved scripts and `parallel-992995-execution-20261026/` refusal
artifacts remain unchanged; their hashes are in `preserved-artifacts.json`.
This is a new proposal awaiting fresh independent/root review and separate launch
authorization. No transfer, reservation, checkout, lane execution, STOP change,
Pi file write, commit or push occurs here.

The fresh read-only preflight ran at **06:10:51 SGT** using the original unchanged
script over SSH stdin with Python `-B`. It passed all hash-before-import, ordinary
native/run/session, ownership, resource, target-absence and stability gates.

| Item | Verified value |
| --- | --- |
| Immutable BASE | `1be3c657ef0c1ef3152f8abced78df2e278f09da` |
| Current central HEAD | `5d9cf8fc351f19c9e747b8c5e424858b2cee6e3b` |
| Current problem / phase | #857 / author |
| Run | `857-author-6ff773b703f3` |
| Session | `01a1751c-7c80-77f2-95bc-3c72095f217c` |
| Runner / native PID | 1774575 / 1778062 |
| Final launcher SHA-256 | `b04075f86c3ae1b7c210b26d468988595c8dc34d4ef6b912ffce0ebf0922e132` |
| Unchanged preflight script SHA-256 | `1614f6868e620d276026bd0b49484c3389ef7f649dd61dc6cab449f0aacc9d86` |
| Fresh preflight capture SHA-256 | `237d5cfbe0f7db3453dad74d962d9cdb1df7624d047b90c4b3bdf696213c9826` |

[observation-only.diff](observation-only.diff) contains exactly **five** changes:
current HEAD, run, problem, stage and session. Reversing them restores the approved
launcher `d222c9545aeeb0304292fe2d55c93c169a2516693610a41c983b078ef6a2d890`
byte-for-byte and AST-equivalent. BASE, #992/#995, ports 18797/18798, policy,
import receipt, runtime hashes and all launcher control flow remain unchanged.

The completed import receipt still has SHA-256
`cb5fdd343af51ee94fd03ec2caa438e115e5d8173558050cfa19304754510e46`,
and its `pushed_head` fixes BASE. Current #857 author is a later ordinary run;
it is not relabeled as the receipt's initial #854 review. The fresh preflight
independently binds the current native child to its runner ancestry, central cwd
and exact run output path, with a started thread/turn and no terminal turn event.
`same_shared(BASE, current_HEAD)` explicitly passed after the approved external
pins and every runtime/policy byte were verified. Policy remains
`816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c`.

Exactly one campaign runner was live; all 39 prior reservations were imported,
STOP was absent, queue length was 984 and available memory was 1,982,012 KiB.
Both target IDs remained unstarted, with no record/run/reservation/checkout/state/
branch/port conflict; both ports passed temporary binds, then closed. This is a
dated observation, not a resource reservation.

The exact current prompt metadata and `Own ONLY` instruction allow only
`leetcode/857/` plus tests inside it. Seven observed untracked author files were
within that prefix; no foreign or tracked changes were observed. The unchanged
phase-specific preflight allows tracked author changes only in that exact prefix
and rejects renames. Review scope still disallows tracked edits. The prompt hash
and actual paths are preserved in `preflight.json`.

Eight static tests pass, including byte/AST reversal, receipt/BASE and later-run
binding, fixed target/policy mapping, STOP/import/publication mutation rejection,
hash-before-import ordering and the actual author ownership/native/resource proof.
`validation.json` hashes this proposal; original artifacts are separately checked
unchanged. Tests do not execute or import launchers:

```sh
python3 -B specs/reviews/parallel-992995-evidence-20261026/refresh-857-author/test_parameters.py
```

Fresh dispatch authorization must name this proposal and immediately revalidate
its observation pins. Any further advancement requires another zero-spawn refusal
and reviewed refresh, keeping BASE fixed. A partial spawn must be observed through
its original handle, never retried blindly. No author prompt injection, policy
adoption, extra worker or publication is part of this refresh.

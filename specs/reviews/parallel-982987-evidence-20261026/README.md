# Final #982/#987 launcher — awaiting root review and separate authorization

Prepared 2026-10-26 after the exact #843 repair receipt reached
`completed-fresh843fix-running`. **No launcher execution, reservation, checkout,
STOP change, worker launch, shared mutation, commit or push.** The original
[pending templates](../parallel-982987-launch-preparation-20261026/README.md)
remain unchanged as preparation history.

| Artifact | SHA-256 |
| --- | --- |
| [launch.py](launch.py) | `042e95a37d31100524e862db7e354e664310df535eccd7736aa2415c16196463` |
| [preflight.py](preflight.py) | `ec01c22261e9150cc5c45a01754ac3179e7a69ac84c900cff2c3d36e33ec70e2` |
| Reviewed #975/#980 source launcher | `17709040ee542e912e697aedca65e0800a5e6c5b77535fafb3aa3597b1cd25a8` |

Six pending values are resolved. Ten non-identity parameter substitutions reverse
the final launcher to byte-identical reviewed source and AST; launcher control
flow is unchanged. The changes cover six runtime/base pins, policy, IDs, lock name
and ports. [parameter-only.diff](parameter-only.diff),
[pending-to-final.diff](pending-to-final.diff) and [parameter-map.json](parameter-map.json)
are the exact review surfaces. [preflight-enabled.diff](preflight-enabled.diff)
changes only its pending BASE to the successful receipt's actual adoption head.
The previously prepared fix-specific guard and runtime-hash-before-import order
are retained.

## Actual completion and fresh read-only proof

The #843 repair operation completed at **05:25:59 SGT**. A new read-only preflight
passed at **05:26:25 SGT**, preserved in [preflight.json](preflight.json).

| Field | Frozen value |
| --- | --- |
| Immutable BASE / current actual and saved HEAD | `854d1bdc83efc13ae49716190ba8db858e4dd0fc` |
| Central run | `843-fix-d56cf6178cb9` |
| Session | `01a174f4-bc5c-7992-be3a-69f166e491b8` |
| Runner / live native PID | `1696215` / `1696569` |
| #982 / #987 preview ports | `18795` / `18796` |
| Adopted rendered-state policy hash | `816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c` |

The embedded receipt is exactly
`843-budget-repair-20261026-91db47a2.json`, with successful final status. Its adopted
head equals BASE; its fresh fix run, session and native PID agree with the live
observation. The native process is a descendant of the actual central runner,
with cwd and output path bound to the exact current run, and thread/turn events
present. STOP is absent, and HEAD/current/status/receipt remained stable through
the read-only check.

All **37** older reservations are imported; exactly one central runner is live.
Available memory was **1,889,044 KiB**, above the existing 1 GiB threshold. Both IDs
remain unstarted/unreserved in the finite **984** queue, without run directories,
matching reservations, lane paths or branches. Both ports were listener-free and
bindable. This is transient evidence, not a capacity reservation.

Before executing repository modules, preflight verifies the approved #843 pins
file hash `1ddd6bf0460798971b109465d8fe8ee95644479fe003fcd5ccd50d7fc18670e4`, every
runtime/policy source hash and the static dependency's fixed-source hash. Only
then does it load the importer and verify `same_shared(BASE, current_HEAD)`.
The current fix prompt's exact ownership instruction and problem JSON allow
tracked/untracked work only within `leetcode/843/`; rename or foreign/shared paths
refuse. No broader lesson-prefix exception or policy adoption is introduced.

## Retained execution boundary

Root must independently review these exact hashes and issue a separate launch
authorization. Immediate preflight must still match all frozen parameters before
any transfer/execution; natural advancement or guard refusal requires reporting
new observations rather than guessing or silently updating the launcher. Keep
the immutable BASE and verify shared-tree equality on every refresh.

The unchanged launcher keeps the exclusive pair lock, imported-reservation gate,
target/path/branch/port absence checks, memory threshold, exact runner counts
1 then 2, nice 10, max rounds 6 and no publication arguments. A later successful
dispatch must be followed by evidence of three runners and distinct fresh lane
native/thread/turn identities. Preserve partial receipts and repoll the same
handle/PID after any possible spawn; never blind retry.

Official dispatcher prep remains fixed at
`062a793491ca1962d4474b64c0c382a4f247a702`, with committed file hashes in the map.
Standard authors independently obtain the original contract and use existing
design/brief and independent lesson-review/repair rules. No prep-note injection
or shared-prep adoption is required or performed.

Eight static checks pass, including exact reversal, completed-receipt/live-pin
binding, targets/policy, STOP/reservation/publication mutation controls,
hash-before-import/fix ownership and the bounded runtime proof. Tests parse but
never import/execute the launcher. See [tests.log](tests.log) and
[validation.json](validation.json); these are preparation checks, not lane launches.

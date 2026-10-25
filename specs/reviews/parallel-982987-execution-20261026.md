# Parallel #982 / #987 launch — 2026-10-26

Both isolated author lanes started successfully. This records startup evidence only; neither lesson has yet received independent acceptance or been imported/published.

## Approved dispatch

Root authorized one execution from committed source `1e6c06c0da772f102aa8d78cb202ca1eded78fb1`. Launcher SHA-256: `042e95a37d31100524e862db7e354e664310df535eccd7736aa2415c16196463`; read-only preflight SHA-256: `ec01c22261e9150cc5c45a01754ac3179e7a69ac84c900cff2c3d36e33ec70e2`.

The fresh preflight at **2026-10-25 21:30:09 UTC** matched every frozen identity: central/base `854d1bdc83efc13ae49716190ba8db858e4dd0fc`, `843-fix-d56cf6178cb9`, session `01a174f4-bc5c-7992-be3a-69f166e491b8`, runner/native `1696215/1696569`, and the exact completed #843 repair receipt. Access/preparation and queue/reservation checks were retained from the approved launcher; both target IDs were still unstarted and unreserved. Available memory was 1,719,596 KiB.

The exact launcher was copied exclusively to `/home/songyy/projects/leetcode-hard-campaign-state-20261018/parallel-launch-982987-20261026-042e95a3.py`, verified remotely, and dispatched **once** at **21:30:21 UTC**, PID `1700051`. It printed both `started` records and exited. Its output remains at the same path with suffix `-output.log` replacing `.py`.

## Live proof

At **21:32:56 UTC**, there were exactly three campaign runners. Both lanes use nice 10, max rounds 6, a single-problem queue, separate preview ports/state/locks, and no publication option.

| ID | Runner / native Codex PID | Fresh author run | Session | Preview port |
|---|---|---|---|---|
| 982 | 1700254 / 1700300 | `982-author-4532e76a05c3` | `01a174f9-3155-7ac0-bfdf-41021c3e0150` | 18795 |
| 987 | 1700716 / 1700850 | `987-author-a21aea0fbd64` | `01a174f9-9ece-7dd1-9194-e68450d0fc0c` | 18796 |

Each native process was a descendant of its runner; cwd and `-o` output directory matched its own checkout/run. Both event streams contained distinct `thread.started`, `turn.started`, and completed output items (877,820 and 355,476 bytes at the live observation). Compressed startup-event snapshots and progress/reservation records are archived alongside the observation.

- #982 checkout: `/home/songyy/projects/leetcode-hard-lane-982-20261026`; state: `/home/songyy/projects/leetcode-hard-lane-state-982-20261026`; branch: `codex/lane-982-20261026`.
- #987 checkout: `/home/songyy/projects/leetcode-hard-lane-987-20261026`; state: `/home/songyy/projects/leetcode-hard-lane-state-987-20261026`; branch: `codex/lane-987-20261026`.

Both lane HEADs remain the approved base. Central naturally advanced after launch to candidate `f6e2500dc87fe0a50a3258af80bf46d761ca1be8` and `843-review-9015ddd39953` (runner `1696215`, native `1701800`). The existing importer’s `same_shared(base, current_head)` check passed. Root separately confirmed pushing that candidate; this launcher did not push it.

All three STOP files were absent. The release ledger remained byte-identical (`1b05df6e7c7249e29adfb20b0b712865ff6fea54aeef042d04bf33857738b89b`), with **119 released** and no pending release. The prior #843 repair receipt remained byte-identical. Available memory at final observation was 1,727,840 KiB. No central progress/STOP/policy edit or publication was performed by this operation.

## Evidence and next boundary

Evidence: [execution directory](parallel-982987-execution-20261026/), particularly `preflight-comparison.json`, `dispatch.json`, `launcher-output.log`, `live-launch.json`, and `validation.json`.

One read-only archive probe initially used the wrong ledger filename (`release-ledger.json` instead of `releases.json`); its traceback is preserved in `observation.stderr`. Corrected read-only capture succeeded. This was not a launcher failure or redispatch.

Allow both lanes to complete their normal independent reviews. Import only exact accepted/exited lanes at an owned clean central boundary while the target IDs remain unstarted centrally; preserve candidates, review history, evidence, and reservation/import receipts. No import or additional dispatch is part of this operation.

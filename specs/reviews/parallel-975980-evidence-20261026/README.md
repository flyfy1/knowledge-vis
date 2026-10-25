# #975/#980 launcher — dispatched and live verified

Prepared 2026-10-26, then independently approved and dispatched once at 04:28:48
SGT from commit `63c53437`. The launcher exited successfully at 04:29:42; the
subsequent live census confirms three runners and two distinct fresh lane agents.
See [dispatch.json](dispatch.json), [live-launch.json](live-launch.json),
[execution-validation.json](execution-validation.json) and the
[launch report](../parallel-975980-launch-20261026.md). Earlier failed preflight
attempts remain preserved as zero-spawn history. The preparation details below
explain the approved boundary; they are not a second dispatch instruction.

Launcher SHA-256: `17709040ee542e912e697aedca65e0800a5e6c5b77535fafb3aa3597b1cd25a8`.
Read-only preflight SHA-256: `988302a994cfd3b89cbfe01b184008fe4c96287c7f1032c8e612173962e1c60d`.
The approved #968/#972 source remains
`012137ab9eabb43cb6b9038ab6065312d8287724540d67fb362038ac4a5caa05`.
Nine actual non-identity substitutions restore the original source byte for byte
and AST for AST when reversed; six values resolve the pending template. Counts
come from the map, not a forced expectation. See [parameter-only.diff](parameter-only.diff),
[pending-to-final.diff](pending-to-final.diff) and [parameter-map.json](parameter-map.json).
All launcher control flow, guards, standard author/reviewer machinery and publication
restrictions are unchanged.

## Fresh read-only evidence

[preflight.json](preflight.json) passed **04:26:47 SGT**. Stage B's immutable
`completed-review-running` receipt is embedded and hash-bound; its adoption head
remains BASE. Central has since naturally advanced to #839 author.

| Field | Frozen value |
| --- | --- |
| Immutable BASE | `2b1cd8cfe14432d1e8d78433f080b1bdaeaf32ba` |
| Observed actual/saved central HEAD | `96e82a2f927f7506f2dd97956f1b837e67c9df1e` |
| Current run | `839-author-ed3a2c092deb` |
| Session | `01a174bb-07c4-7881-855c-30619660e8d7` |
| Runner / live native PID | `1600975` / `1609492` |
| #975 / #980 ports | `18793` / `18794` |
| Rendered-state policy SHA-256 | `d861a659f42607defb40f46505b02d0283be48a533127b40efa8c6bf543c4faa` |

STOP is absent; 35 prior reservations including #968/#972 are imported; exactly one
campaign runner is live. Available memory is 1,908,528 KiB. Both targets remain in
the finite 984 queue with no record/run/reservation/checkout/state/branch; both ports
have no listener and bind successfully. Availability is not a reservation.

Before executing any repository module, preflight verifies the external approved
Stage B pins SHA-256 `cba2aa3afe9fd177d4dd2d44d378f94c89375f803b7d2f47ca7c7067988fcb04`,
then every pinned runtime/policy byte. Publisher's transitive static-builder
module is separately verified against bytes from that pins file's fixed approved
source revision. Only then does it load the importer and call `same_shared`.
Native ancestry/output/cwd bind the live process to the recorded current run;
thread/turn events and stable final HEAD/current/STOP are also checked.

## Current author scope assessment

The actual current `prompt.md` identifies problem 839 in its JSON metadata and says:
“Own ONLY leetcode/<id>/ and tests inside that folder. Do not edit shared assets,”.
Preflight requires that exact instruction and matching positive numeric metadata ID,
then derives **only `leetcode/839/`**. Tracked and untracked changes within that
specific prefix are allowed for this active author; other paths and rename output
refuse. It reads `git status --porcelain --untracked-files=all` so newly created
parent directories cannot hide individual paths. The observed paths and exact
prompt SHA-256 are recorded in preflight.json. This is no general `leetcode/`
allowance and does not authorize shared or unrelated lesson edits.

The review branch still allows only untracked files in its exact prompt-bound
report/evidence paths, rejecting all tracked edits. Other stages refuse this
additional phase assessment. These checks neither modify prompts nor replace
normal campaign ownership checks. Runtime/policy hashes remain verified before
loading any importer dependency; no overlapping-marker policy adoption occurs.

## Prior refusals and retained execution boundary

[dispatch-preflight.json](dispatch-preflight.json) and
[dispatch-refusal-observation.json](dispatch-refusal-observation.json) preserve the
first zero-spawn refusal after advancement to #834 review. The explicit-file Git
status correction retained the same scope.
[dispatch-revalidation.json](dispatch-revalidation.json) and
[dispatch-second-refusal-observation.json](dispatch-second-refusal-observation.json)
preserve the second zero-spawn refusal after advancement to #839 author.
[initial-probe-refusal.json](initial-probe-refusal.json) records an earlier harmless
read-only total-cleanliness probe; that extra gate was not part of the launcher.

The successful execution followed root review and immediate fresh matching preflight.
For any later distinct action, frozen parameters must be revalidated.
If central advances, preserve the refusal and report new observation pins before
execution; keep BASE and verify shared-tree equality. No STOP/policy waiver.
The existing launcher retains exclusive lock/reservation guards, all-prior-imported,
984 scope, target absence, memory/port checks, exact worker count, nice 10,
max rounds 6 and no publication arguments. Post-launch evidence must show three
runners and distinct fresh lane native/thread/turn identities. Any partial spawn
or timeout means preserve receipts and repoll the same handle/PID, never blind retry.

Standard authors independently fetch official statements and follow existing
reviewed design/brief and independent lesson-review/repair rules. Dispatcher prep
remains fixed at `74f2c6729ab50f1781b2fb5fadc2ff267e27d634`, with hashes in the map.
No teaching-note injection, shared-prep adoption or review bypass.

## Local validation

Seven static tests pass, including byte/AST restoration, exact source/launcher and
live-pin bindings, target parameters, and STOP/reservation/publication negative
controls. Tests parse but never import/execute the launcher. Run
`python3 -B specs/reviews/parallel-975980-evidence-20261026/test_parameters.py`.
See [tests.log](tests.log) and [validation.json](validation.json). The static validation remains historical preparation integrity. The separate execution
receipt proves launch; independent lesson acceptance is still pending.

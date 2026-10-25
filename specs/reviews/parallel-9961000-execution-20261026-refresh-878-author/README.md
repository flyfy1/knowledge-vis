# #996/#1000 startup — refreshed #878 authorization

The approved preflight matched every frozen #878 identity at **23:13:56 UTC**.
Launcher `d58b169d614e1042a82284103ac809877e78803a41d4a5445bd00588b5d05560`
was transferred exclusively/hash-verified to
`STATE/parallel-9961000-20261026-d58b169d/launch.py` and executed **once at 23:14:09
UTC**, PID1871363, under source `240ca7a4138f51ec3e1401160b54dbdc135d43a5`.
The previous zero-spawn refusal is untouched. The real partial state (#996 started,
#1000 checkout prepared) was observed through this same handle; no retry occurred.

By **23:15:11 UTC**, both reservations were started and exactly three runners were
live, including unchanged central runner1865819. The launcher was absent and its
log emitted both successful started records without an error. Its numeric exit
code was not separately captured.

| Lesson | Run | Runner / native | Session | Port |
| --- | --- | --- | --- | --- |
| #996 | `996-author-9180dd0f5b54` | 1871480 / 1871523 | `01a17558-1c90-7cd0-976c-7f3beab58eed` | 18799 |
| #1000 | `1000-author-3a58ffe68610` | 1871874 / 1871917 | `01a17558-700c-7460-90ec-32d20d8337d0` | 18800 |

Both runners have nice10, max-rounds6, exact ID/state/port arguments and no
publication arguments. Native ancestry/cwd/output bindings and distinct fresh
thread/turns passed. Actual runner ports are verified; no HTTP/UI claim is made.
Central stayed at `cf1a31fc75c66ca79e54513e050b7e0ba31b6e70` with
`878-author-004c6e7e9e78`, same984 queue and unchanged policy/ledger; STOP is absent.
Lane BASE is `6c68b23cc306067de5a912195a3c7edeebc2a0be`.

The bounded final observation retains actual process arguments, reservations and
thread/turn events plus the earlier partial-state summary. `startup-proof.json`
contains the checked invariants; the full launcher log and fresh preflight are
preserved. Redundant full snapshots/raw event streams were omitted. No generic
test framework or further runtime changes were added. This is startup evidence,
not acceptance/import/publication; both lessons continue through their ordinary
independent review pipelines. No local commit was made by this worker.

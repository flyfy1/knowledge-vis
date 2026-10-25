# Pending #975/#980 launcher parameters

Prepared 2026-10-26. **Preparation only; not dispatch-ready.** No remote writes,
launch, checkout, reservation, queue change or policy adoption occurred in this
preparation. Stage B evidence adoption and normal central resume must finish before
the six pending immutable observation/base pins can be filled. The #818 measurement
STOP is a hard refusal, including while progress still says `running`.

The approved [#968/#972 source](../parallel-968972-evidence-20261026/launch.py) has
SHA-256 `012137ab9eabb43cb6b9038ab6065312d8287724540d67fb362038ac4a5caa05`.
The [pending template](launch.pending.py) has SHA-256
`9cd775670a13266a93016e6bccbbd76ff110777c599115dd889c674f79b97379`.
Its nine parameter substitutions are shown in [parameter-only.diff](parameter-only.diff)
and [parameter-map.json](parameter-map.json). Reverse substitution restores the
source byte for byte, including all control flow. **Do not execute the template:**
even a refusing operator opens its lock before validation. The placeholders are
deliberately invalid, not an additional execution sandbox.

| Parameter | Prepared value |
| --- | --- |
| IDs / preview ports | #975 / 18793; #980 / 18794 |
| Branches | `codex/lane-975-20261026`; `codex/lane-980-20261026` |
| Checkout / external state paths | Existing lane naming pattern; exact paths in parameter map |
| Pair lock | `parallel-launch-975980.lock` |
| BASE; central HEAD/run/problem/stage/session | Six pending Stage B pins; no future value inferred |
| Rendered-state policy hash | Unchanged `d861a659f42607defb40f46505b02d0283be48a533127b40efa8c6bf543c4faa`; revalidate later |
| Dispatcher official evidence | Commit `74f2c6729ab50f1781b2fb5fadc2ff267e27d634`; committed file hashes in parameter map |

## Bounded observation and remaining gates

[read-only-observation.json](read-only-observation.json) records **03:20:07 SGT**:
central HEAD/expected HEAD `835700570acedda88ea8228286673bf7dca13881`, recorded
#834 author, STOP present, queue length 984. Both targets are queued and have no
problem record, run, matching reservation, checkout/state directory or branch;
neither proposed port has a listener. #968/#972 reservations still read `started`
in this observation. This is a transient snapshot during the parent-owned operation,
not its completion receipt. Absence of listeners does not reserve ports or prove
socket bind availability. This observation does not establish a live native agent.

After Stage B completes, root must obtain fresh read-only evidence of immutable
BASE, current HEAD/expected HEAD and actual central run/session/native process;
verify the existing importer's `same_shared` relationship and policy pins; verify
STOP absent, all older reservations imported, target absence, resource capacity,
and port bind availability. Natural central progress may require refreshed central
observation pins after confirming the frozen BASE still has the same shared tree.
No current observation is a substitute for that final preflight. Hash/review the
resulting exact launcher before separately authorizing its one dispatch.

| Existing protection or workflow | Mapping retained without new machinery |
| --- | --- |
| Launch eligibility | Running central state, STOP absence, exact HEAD/run/stage/session, queue 984, target absence; repeated before each spawn |
| Live ownership | Launcher checks central runner PID and arguments; separate fresh preflight must also prove the active native child and session, not just historical thread events |
| Isolation and capacity | Exclusive pair lock and reservation, prior reservations imported, absent target paths/branches, socket bind, >1 GiB available memory, exact runner count 1 then 2; final observation expects 3 |
| Author and design | Standard campaign author flow independently retrieves official statement and follows existing reviewed design/brief rules; no new prompt or teaching-note injection |
| Independent lesson review | Standard campaign review/repair/acceptance pipeline remains required; max rounds 6; no direct acceptance or publication |
| Process and outcome proof | Nice 10, fresh lane thread/turn, exact args/state; verify separate live native processes after dispatch with existing observation approach |
| Partial result or timeout | Keep receipt; repoll the same spawned handle/PID. Never rerun after a possible spawn |
| Publication/import | No publication args; lane acceptance only becomes central progress through the existing guarded import boundary |

Official prep is dispatcher evidence only. It is neither an implementation brief
nor required author context. Mere checkout presence does not deliver it to an
author. No shared-tree adoption of these prep files, author prompt change, new
review bypass, or extra policy adoption prerequisite is proposed.

## Static validation

Run `python3 -B specs/reviews/parallel-975980-launch-preparation-20261026/test_parameters.py`.
The seven local checks parse but never import/execute a launcher, verify exact
source/template identity and parameter reversal, and reject STOP/reservation gate
removal or added publication arguments. These tests establish preparation integrity;
they do not simulate agents, prove runtime readiness, or authorize dispatch.
See [tests.log](tests.log) and [validation.json](validation.json).

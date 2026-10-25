# Pending #982/#987 parallel-lane templates

Prepared 2026-10-26 while the #843 repair handoff waits for its natural boundary.
**Preparation only: no execution, reservation, checkout, STOP, remote file write,
commit or push.** Six launcher pins remain deliberately unresolved. Do not run
either pending template. Even a refusing launcher opens its lock before checking
eligibility; placeholders are not an execution sandbox.

## Exact sources and changes

The reviewed #975/#980 launcher has SHA-256
`17709040ee542e912e697aedca65e0800a5e6c5b77535fafb3aa3597b1cd25a8`.
The pending [launch.pending.py](launch.pending.py) SHA-256 is
`465a733c667547199d648d6093998f9c6da2a56f783be1900a7f488684fbfa2f`.
Ten non-identity parameter substitutions reverse to byte-identical original
source and AST. **Launcher control flow is unchanged.** The change list is in
[parameter-only.diff](parameter-only.diff) and [parameter-map.json](parameter-map.json).

| Parameter | Prepared value |
| --- | --- |
| IDs / ports | #982 / 18795; #987 / 18796 |
| Branches | `codex/lane-982-20261026`; `codex/lane-987-20261026` |
| Paths | Existing per-ID lane checkout and external state pattern; exact paths in map |
| Pair lock | `parallel-launch-982987.lock` |
| BASE, central HEAD/run/problem/stage/session | Six pending #843 completion/live-observation pins |
| Rendered-state policy | `816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c` |
| Official dispatcher prep | Fixed commit `062a793491ca1962d4474b64c0c382a4f247a702` |

The [pending read-only preflight](preflight.pending.py) SHA-256 is
`5e9a328679acb553a2ce1645138eb24482822489bfb681fa51794e3e52b4c9b9`.
Its source was the reviewed #975/#980 preflight
`988302a994cfd3b89cbfe01b184008fe4c96287c7f1032c8e612173962e1c60d`.
[preflight-adaptation.diff](preflight-adaptation.diff) separately records the new
completion receipt, approved runtime-pins source, policy, target IDs/ports and
specific fix-phase ownership check. Preflight adaptation is explicitly reviewed
code, not claimed to be a parameter-only launcher change.

## Bounded read-only observation

[read-only-observation.json](read-only-observation.json) was captured at **05:16:11
SGT**. Central actual/saved HEAD was `c365653de76aafb9985ac9061843ec707d3c90e9`,
recorded #850 author, one campaign runner, STOP present. The #843 operator receipt
was `waiting-for-natural-boundary`. This observed head is **not** the future BASE.

All **37** prior reservations are actually `imported`. #982/#987 remain at queue
indices 203/204 in the finite 984 queue, with no problem record, run/run directory,
matching ID/port reservation, lesson directory, lane checkout/state or lane branch.
Ports 18795/18796 had no listener and accepted temporary socket binds, which were
closed without reservation. Available memory was 1,824,068 KiB. The adopted policy
file hash matches the new value above. These transient facts are not launch
eligibility, native-agent proof, reserved capacity or a promise of future state.

## Completion and runtime gates still required

1. Wait for the exact #843 operation receipt
   `843-budget-repair-20261026-91db47a2.json` to become
   `completed-fresh843fix-running`. Use its actual adopted `head` as immutable
   BASE only after root has verified that completion. Never infer it from the
   pre-handoff head or request-source commit.
2. Resolve the pending BASE in preflight and require it to equal that receipt's
   adopted head. Capture a genuinely fresh active #843 fix run, thread/turn,
   runner and native child, with STOP absent. Freeze exact observed HEAD/run/
   problem/stage/session plus external runner/native proofs; then fill all six
   launcher pins. No pending pin may be guessed.
3. Before importing any runtime helper, verify external
   `843-budget-repair-20261026-149c7da2/pins.json` SHA-256
   `1ddd6bf0460798971b109465d8fe8ee95644479fe003fcd5ccd50d7fc18670e4`, then every
   pinned runtime/policy byte. The static-builder dependency also retains its
   exact approved hash check before importer execution. Only then call the
   existing importer's `same_shared(BASE, current_HEAD)`.
4. Keep exact current prompt ownership. The fix branch requires matching problem
   JSON and the existing `Own only` instruction for `leetcode/<id>/`; only that
   specific numeric lesson prefix may have tracked/untracked edits, and renames
   refuse. Explicit `--untracked-files=all` prevents collapsed-directory ambiguity.
   Review ownership remains restricted to the exact prompt-bound untracked
   report/evidence paths. The final preflight requires #843/fix, not an unrelated
   phase silently accepted as equivalent.
5. Recheck all prior reservations imported, target absence, queue 984, resource
   threshold >1 GiB, free/bindable ports and exactly one central runner. Native
   ancestry, cwd and run-output binding plus stable final HEAD/current/STOP remain
   external preflight obligations. Natural advancement requires a new read-only
   observation and root review, preserving BASE/shared policy.

After final root review and a separate exact dispatch authorization, the unchanged
launcher would require runner counts 1 then 2, isolate each checkout/state, launch
with nice 10 / max rounds 6 / no publication arguments, and observe fresh lane
thread/turn events. Post-dispatch proof must establish three runners and distinct
native/session identities. A possible partial spawn or timeout requires preserving
the receipt and repolling the same handle/PID, never a blind rerun. This document
does not authorize any of those actions.

Standard new authors independently fetch the official problem and use the existing
design/brief, independent review and repair pipeline. Dispatcher prep is not a
required implementation brief, is not injected into author prompts, and needs no
shared-tree adoption merely to launch. Existing fixed prep-file hashes are in the
parameter map. No policy/prompt expansion or additional worker is created here.

## Static validation

Eight tests pass: exact source/parameter reversal, pending pins, target/policy
mapping, STOP/prior-import/publication mutation rejection, hash-before-import
ordering and exact fix ownership, plus bounded observation checks. They parse but
never import/execute either template. Run:

```sh
python3 -B specs/reviews/parallel-982987-launch-preparation-20261026/test_templates.py
```

[tests.log](tests.log) and [validation.json](validation.json) record preparation
integrity only. No final live preflight, author launch, acceptance or deployment
has occurred for this pair.

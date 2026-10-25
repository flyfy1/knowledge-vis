# Frozen #992/#995 launch proposal — awaiting root review

Prepared 2026-10-26 from the unchanged pending templates committed at
`945980823018ddb900098a92712350a14da5b70a`. **No lane launch, reservation,
checkout, STOP change, remote file write, commit or push was performed.** The
only remote execution was the hash-guarded read-only preflight, via Python `-B`.
Separate root review and exact dispatch authorization are still required.

## Exact proposal and evidence

| Artifact | SHA-256 |
| --- | --- |
| Final `launch.py` | `d222c9545aeeb0304292fe2d55c93c169a2516693610a41c983b078ef6a2d890` |
| Final read-only `preflight.py` | `1614f6868e620d276026bd0b49484c3389ef7f649dd61dc6cab449f0aacc9d86` |
| Actual `preflight.json` | `284165351cb1414202045feb428dd6f92f317af66f3dc91e0af2ebd7bbecc39d` |
| Completed import receipt | `cb5fdd343af51ee94fd03ec2caa438e115e5d8173558050cfa19304754510e46` |

The final launcher fills exactly six pending parameters; its nine overall
substitutions reverse to the reviewed #982/#987 launcher
`042e95a37d31100524e862db7e354e664310df535eccd7736aa2415c16196463`,
byte-for-byte and AST-equivalent. No control flow changed. The final preflight
diff replaces only its pending BASE. Original pending artifacts remain intact.
Review `pending-to-final.diff`, `parameter-only.diff`, `preflight-enabled.diff`
and `parameter-map.json`; no unresolved token remains in the final scripts.

| Frozen parameter | Actual value |
| --- | --- |
| Immutable BASE | `1be3c657ef0c1ef3152f8abced78df2e278f09da` |
| Current central HEAD | `1be3c657ef0c1ef3152f8abced78df2e278f09da` |
| Current problem / phase | #854 / review |
| Current run | `854-review-0add7000fba0` |
| Current session | `01a17518-b387-7960-b6d6-60e162d298e1` |
| Observed runner / native PID | 1774575 / 1774809 |
| Targets / ports | #992 / 18797; #995 / 18798 |
| Rendered-state policy | `816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c` |
| Dispatcher-only official prep | `d3d2aa8eb61c17081beffdca687f9f2d15555973` |

## Actual read-only preflight

At **06:06:31 SGT**, the exact receipt
`STATE/import982987-only-20261026-891ce2d4.json` was `completed-resumed`, with
`pushed_head` and `ordinary_resume_proof.agent_candidate` equal to BASE. The
currently observed problem/run/session/native matched its fresh ordinary-review
proof. This preflight verifies receipt/current identity; the exact remote push was
independently verified by root before this task.

The external pins at
`STATE/import982987-only-20261026-e0e53065/pins.json` matched
`0d9dec18554ed18154ac5b4137371b08382bd217c290149fd048a46987387a01`.
Every pinned policy/runtime file was verified **before** importer execution.
The static dependency's source object was the pins' existing `lane_base`
`854d1bdc83efc13ae49716190ba8db858e4dd0fc`; its object/blob and current bytes
matched `f92eca0575bfcf74a4b68b9d011470e99415f12b671328bba1cebf035ddfd12e`.
No fetch was used. `same_shared(BASE, HEAD)` passed.

The snapshot confirms exactly one campaign runner, its native child ancestry,
central cwd and current run's exact output path, a started thread/turn and no
terminal turn event. The final state/head/native checks remained stable. Queue
length is 984, STOP absent, all **39** previous reservations are imported, and
available memory is 1,994,004 KiB. Both target IDs are in the queue with no record,
run, run directory, reservation, checkout/state, branch or ID/port conflict.
Ports had no listener and passed temporary binds, then closed. This does not
reserve capacity or promise the same state at later dispatch.

The worktree contains only three prompt-owned, untracked review artifacts:
`specs/reviews/854-review-1-9601268b.md` and two screenshots under
`specs/reviews/854-evidence/854-review-1-9601268b/`. The exact prompt is hashed in
the receipt. The review guard permits no tracked changes; author/fix branches
retain their exact prompt-derived numeric lesson scope. No ownership rule was
broadened to obtain a pass.

## Validation and execution boundary

Eight static tests pass, including original-source reversal, actual receipt and
six-pin binding, target/policy identity, STOP/import/publication mutation rejection,
hash-before-import order, static ancestry source, and the captured resource/native/
ownership facts. Tests never execute or import the launcher. `tests.log` and
`validation.json` freeze the local proposal. Run:

```sh
python3 -B specs/reviews/parallel-992995-evidence-20261026/test_parameters.py
```

An authorized dispatcher must immediately revalidate the frozen observation.
If central advances, preserve zero-spawn refusal evidence and obtain a newly
reviewed observation-parameter proposal while retaining BASE/shared policy; do
not guess replacement pins. If any partial spawn occurs, preserve the receipt and
observe that exact handle instead of rerunning. Unchanged launcher gates require
runner counts 1 then 2, nice 10, max rounds 6 and no publication arguments; actual
post-dispatch evidence must show three runners and distinct fresh lane identities.
None of that execution has occurred here.

Normal future authors independently fetch official contracts and follow existing
design/brief, independent review and repair flows. No dispatcher note is injected
into their prompts and no policy or shared-tree adoption is proposed.

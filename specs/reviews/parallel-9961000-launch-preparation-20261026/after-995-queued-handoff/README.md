# Disabled #996/#1000 launch after the queued #995 handoff

Prepared 2026-10-26. This is a separate disabled adaptation of the original
import-receipt template in the parent directory. Parent files remain unchanged.
No Pi access, mutation, transfer, execution, reservation, worker launch, STOP,
policy adoption, author prompt injection, commit or push was performed.

Both scripts retain an unconditional `RuntimeError` immediately after the
docstring, before imports or any file access. They are **not dispatchable**.
Completion of the earlier #992/#995 import is insufficient to enable this version.

## Actual source and schema adaptation

`adaptation-map.json` records exact source hashes and reversible substitutions;
the two `.diff` files expose every changed line. The launcher changes only its
disabled-entry explanation and six unresolved parameter names. Its operational
control flow, target IDs, ports, nice 10, max rounds 6 and publication exclusions
are unchanged.

The preflight switches its source to the future receipt
`STATE/995-copy-repair-20261026-9d027af3.json`. Before using it, the proposed body
requires its still-unresolved exact SHA-256 and owner, then:

- `status == "completed-resumed"`;
- `queued_repair_id == "995"`;
- `queue_preserved is True` and `ledger_preserved is True`;
- `pushed_head == BASE` and `resume_proof.agent_candidate == BASE`;
- a nonempty `fresh_agent` proof, followed by the existing independent live
  current-session/native/prompt-ownership verification.

The #995 operator uses **`resume_proof`**, not `ordinary_resume_proof`. This is a
schema adaptation with additional receipt checks, not a claim that every preflight
change is a parameter substitution. Synthetic valid and adversarial receipts
exercise the exact extracted guard statements, including false/missing fields,
wrong owner, wrong digest, old schema and divergent candidate.

Another necessary schema difference is that #995 handoff pins have **no
`lane_base`**. The existing static dependency guard therefore uses the completed
receipt-bound BASE as the immutable Git object/blob source. It still verifies
that the commit exists, its static-builder blob matches the approved hash, and
current static-builder bytes match, before importing runtime modules. It performs
no fetch. The exact external pins bytes and every pinned policy/runtime byte must
also pass their original hash checks before importing the importer; then
`same_shared(BASE, current_HEAD)` remains required.

Known reviewed source identity is recorded only as local preparation evidence:

| Source | SHA-256 |
| --- | --- |
| #995 approved operator | `2cc99b2622895aaf3dc87c83131dfb4ab2b70e123a424845409dd428788fe280` |
| #995 approved pins | `b8daf2ba46ff675f5cc14f6ddca7e1816d14348b3438b228f13c4e6fa60ff93c` |
| Disabled launch | `35045331153db7194b92ba21fcab73639b93cdf366907bcfe33eadfa8d862359` |
| Disabled preflight | `e66694dcdded8f21537d4dc82e0d7ffe95d0b7749dcb6bb37806252edc478d4f` |

No external transfer path is inferred from these hashes. The final receipt hash,
actual external pins path/hash, BASE, current HEAD/run/problem/stage/session and
runner/native identities remain unresolved in the map. Their future values must
come from the actual successful handoff and fresh observation, then receive a
separate enablement/dispatch review. No completed receipt is claimed here.

## Preserved launch boundaries

Targets remain #996/#1000 on proposed ports 18799/18800. This adaptation does not
refresh the parent's dated port census or claim current free capacity. The exact
984 queue, target record/run/reservation/checkout/branch absence, all reservations
imported, >1 GiB available memory, listener and temporary-bind checks remain.
Native ancestry/cwd/output binding, thread/turn evidence, current state stability,
STOP absence and one central runner remain. Worktree allowances still derive
from the current author/fix/review prompt with `--untracked-files=all`; there is no
broader path allowance. Launcher counts remain one then two workers before each
spawn; later actual dispatch must verify three live runners and distinct fresh
lane identities. A partial spawn must be observed through its existing handle.

## Local checks

Ten tests pass, including exact byte/AST reversal, original parent-file hashes,
actual disabled-entry execution with import/file access trapped, synthetic
receipt-schema rejection, unresolved identity checks, dependency hash order and
unchanged native/scope/resource/target guards. No operational body is executed.

```sh
python3 -B specs/reviews/parallel-9961000-launch-preparation-20261026/after-995-queued-handoff/test_templates.py
```

Two earlier local test runs are preserved. The first reversal test used a broad
`base` reverse replacement that collided with unrelated occurrences; the map now
names the two exact static Git expressions. The test also initially assumed the
wrong existing publication-argument predicate; it now checks the actual unchanged
`--publish-root`/`--public-base` exclusion. Neither correction changed either
pending script or loosened a runtime guard. `tests.log` is the final passing run;
`validation.json` freezes the complete local proposal.

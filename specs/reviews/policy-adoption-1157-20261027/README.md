# Prospective policy adoption after the 1157 independent review

Preparation only. `adopt.py` is disabled (`PINS_SHA = None`), and `pins.pending.json`
has `boundary: null`. Nothing in this preparation creates STOP, fetches objects,
changes Pi state, commits, pushes, launches, or touches production. The operator's
future enabled transaction only adopts two files and leaves its owned STOP in place.
An independent review of the final pins/code and an explicit root dispatch are required.

## Exact payload and observed state

Source: `694b9fc23684172609c57ed7e7e58192a4751c5d`, not moving main.

| File | Old SHA256 | New SHA256 |
| --- | --- | --- |
| specs/leetcode-rendered-state-contract.md | 816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c | cfeeb79c9c0527c195214ab64545146d7a95f87899ff15aec72c63121ff3ca41 |
| specs/leetcode-explainers.md | 7fe59194a1ab1eb838a865a6cefcfbd98d527fe7657d1614c959b73c86dc404e | 861011bbcd79d5856f04347cd054ac1d82fe0b3d2c18da59dda87ad264e441c1 |

`policy.patch` records the complete 65-line rendered-state addition and 11-line
explainer addition. fbaf2f2d/a9cfeb19/198b3338 affect rendered-state-contract;
694b9fc2 affects explainers. No prompt, rubric, registry, lesson, or historical
review file is adopted. Candidate/review histories keep their original policy;
this transaction does not retroactively apply new requirements or close findings.

Read-only observation at 2026-10-26 17:56:21 UTC: author
`1157-author-0d5347d33395`, runner2481309, HEAD/expected HEAD
`c9952320a1ab32c4e3e3877b7325d113ed832038`, STOP absent. This is an observation,
not an executable future boundary pin. Queue is exactly984 IDs with compact-JSON
SHA256 `434e5df4289eb8084c994f7a9bfe9920331ebcd4675beb7d2d511c1749d1fb7a`.
Ledger SHA256 `aedb5d29f7620aa51d60824c1e9a0319f732aa0a90f1b313340ac29183f63886`,
pending null,178 released. Any ledger drift requires inspection, not automatic repinning.

The unchanged external launch.py SHA256 is
`94056740463e5f9ec4fe63d0d2c56d1ccbf1ab60556f7952580fe58512127e70`.
It uses the entire catalog queue, port18770, publication every20 and the existing
runtime environment. Ordinary resume remains `python3 STATE/launch.py --continuous
--max-rounds 6`; campaign model/reasoning remains its unchanged default. The script
never invokes that command itself. Observation, launcher bytes, policy/runtime
hashes and immutable protocol hashes are preserved in the preparation artifacts.

## Obtain the actual review/register seam (root-owned future step)

Do not set STOP during the author. First observe the actual fresh1157 review run,
candidate, native process/cwd/output, distinct session and real thread/turn events.
Under separate root authorization, exclusively write and fsync `STATE/STOP`:

```json
{
  "owner": "policy-adoption-1157-20261027",
  "created_at": "<actual UTC>",
  "reason": "Finish the active 1157 independent review under its existing policy; preserve the accepted review/register seam for prospective two-file policy adoption."
}
```

The runner checks STOP existence at the top of its stage loop. A successful review
first commits its report, appends its review record and saves phase=register,
status=review_passed; STOP then prevents ordinary registration. It does not
interrupt the active reviewer. Persisted `current` may still name the completed
review, so actual process exit is required. If STOP loses the timing race and a
new stage starts, do not change its policy. If review requests fixes, leave the
old policy for its ordinary fix/review cycle; this adapter refuses that state.
A failed runner, blocked lesson, pending release or publication threshold also
refuses adoption. Preserve the owned STOP and report the precise recovery decision;
do not silently remove it or restart anything.

Once actually stopped, capture a new immutable final boundary object containing:

- `head`: exact completed review commit, matching clean HEAD and expected_head;
- `progress_sha256`: SHA256 of exact stopped progress.json bytes;
- `stop_sha256`: SHA256 of exact owned STOP bytes;
- `review`: complete actual last1157 review record;
- `run`: complete matching completed independent reviewer run;
- `report_sha256`: SHA256 of the committed report bytes.

Copy pending pins to a separately named final pin file, fill only this real boundary,
and preserve pending pins/observation. Required outcome is accepted, every score>=3,
weighted>=85, zero required findings, real evidence/report and independent sessions.
All runs must be nonrunning;1157 must be the first ordinary unfinished queue entry
and the only pending registration. No active lane reservations or checkout processes
may remain. Pin the exact resulting final SHA only after independent inspection;
`PINS_SHA=None` remains until separately approved literal enablement. Never dispatch
this preparation just because a reviewer says it is probably ready.

The stopped seam captured after review is recorded in `pins.final.json` (file SHA256
`c84d1430fbf0bddda22914dd7ee61226a7f420f48b01dd61ee211b61e02b417c`). It binds
HEAD/expected_head `fa5def51c2ad7e720fce7489daaadaaacfc7649a`, review run
`1157-review-5585150eeec1`, report SHA256
`30bc18e97f336d9515059854f4362507bb23af964f10670ab65647567c489c7f`, progress
SHA256 `2e6ad29a916858357679fdda3bcebd2f731814efaa1bdbfa85a1d991596978ed`,
ledger SHA256 `aedb5d29f7620aa51d60824c1e9a0319f732aa0a90f1b313340ac29183f63886`,
and owned STOP SHA256 `da53ab9b332d71c81c823f1f6e2bbdfffc28c10d68b05a4bfa0f1cbe029a0517`.
The final pin file is a capture, not authorization: revalidate every value before
any future transfer or enablement, and refuse drift.

The source commit `694b9fc23684172609c57ed7e7e58192a4751c5d` is not currently
present in the Pi campaign object database (read-only `git show` refused it during
capture). A future operator must separately transfer/fetch only that reviewed object
history, without checkout/merge/reset and with HEAD, progress, ledger and STOP bytes
unchanged, before its source-blob checks can pass. This audit performed no such fetch.

## Future operator procedure

Read-only preflight: `python3 adopt.py --pins FINAL_PINS.json`. It refuses now
because future review pins are unresolved. It makes no lock/state/object writes
and disables Python bytecode writes. Source objects must already exist locally:
any separately authorized object fetch must preserve HEAD/state/ledger and be
recorded outside this operator. There is no fetch, checkout, merge or reset here.

After final approval/enablement, transfer the exact operator and pins exclusively
outside the checkout, hash-verify them and use the explicit dispatch token once:
`root-reviewed-policy-adoption-1157-20261027`. Run from outside the checkout.
The enabled operator revalidates under release.lock, runner.lock and the checkout
campaign lock, snapshots raw progress/ledger/STOP durably, writes only the two blobs,
commits respecting normal hooks, verifies full tree delta/modes, then atomically
changes only progress.expected_head. Receipt and archive are exclusive:
`STATE/policy-adoption-1157-20261027.json` and
`STATE/policy-adoption-1157-20261027-before/`. Partial failure preserves all files,
STOP, commits and receipt; no rollback, reset or automatic retry exists.

The actual publisher `_reviewed` API determines digest-qualified eligible items.
The conservative bound adds1157 once for pending registration and requires<20.
Existing same-digest pointer refreshes also refuse this ledger-preserving handoff.
No accepted-minus-released arithmetic is used. If the bound reaches20, defer this
maintenance and let a separately authorized ordinary release finish first; never
bypass release/public verification or rewrite ledger pins.

## Explicit post-adoption push/cleanup/resume (not implemented here)

On `adopted-stopped-awaiting-root`, independently compare full before/after trees,
all state fields except expected_head, ledger raw bytes, STOP raw hash/owner and
candidate/report/run identities. Confirm the two new policy hashes and clean saved
HEAD. Root separately authorizes exact-head push and verifies remote durability.
Then, only after all maintenance locks are released and root explicitly authorizes
ordinary continuation, compare STOP against the archived raw bytes and owner and
unlink only that exact file. Do not use an unconditional `rm` or delete another
owner's STOP. Start the unchanged launch command once and retain its actual handle.

Registration is expected to run without an agent, potentially making a new HEAD
before the next ordinary queue agent. Validate its exact deterministic registry
allowlist, parent and Review-Candidate/Review-Report trailers; preserve the old1157
candidate/report. Prove actual next run from a freshly reread queue, old run prefix,
fresh thread/turn/session and native ancestry/cwd/output. Do not expect a new1157
agent, do not require the next candidate to equal the policy commit if registration
advanced it, and do not claim author/reviewer acceptance from startup liveness.

## Reused protocol and limits

The immutable hashes in pins identify the940/956 expected-head-only policy commit
and registration-aware resume protocol, and the later968/972 digest-qualified
publication-bound implementation. Historical scripts are references only; they
include old imports/reopens and must not be dispatched for this operation.

Tests exercise accepted and refused review seams, changed runtime before import,
disabled dispatch, publication/same-digest refusal, actual scratch-Git two-file
adoption, complete metadata preservation, durable archive, hook failure and retry
refusal. They do not simulate future1157 acceptance or prove Linux browser behavior.
No public probes, production security changes or extra runtime workers are needed.

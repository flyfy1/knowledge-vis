# Disabled import-only preparation: #992 / #995

Prepared 2026-10-26. **Pending both completed independent acceptances; not
dispatchable.** No Pi file write, import, STOP change, real worker launch,
publication, policy adoption, commit or push was performed. The only Pi action
was a bounded read of the two reservations and recorded lane status.

## Proven source and parameter-only change

The baseline operator is
`specs/reviews/parallel-982987-import-preparation-20261026/operate.py`, committed
at `8f7d005b91072d953251ecb7f3188388b873351a`, SHA-256
`e0e530655dd21c90a95c5a0b0baa7f6b4e84fa96ae359c6cd72da3e34d5798f6`.
The existing helper remains byte-identical at
`specs/reviews/parallel-968972-import-818-search-preparation-20261026/operate.py`,
SHA-256 `f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698`.
It is referenced, not copied or modified.

The new [operate.py](operate.py) SHA-256 is
`e75a434a0829b46b3233d34a03f78094453ec6c02b47cbab0df0b8bb2eca101a`.
Exactly five substitutions change the target tuple, explanatory pair label,
unique owner, dispatch token, and `PINS_SHA` to disabled `None`. Reversing them
restores original bytes and AST. No control flow, helper, shared policy or runtime
module is changed. [parameter-only.diff](parameter-only.diff) and
[parameter-map.json](parameter-map.json) preserve the exact adaptation.

| Parameter | Pending value |
| --- | --- |
| IDs | `992`, `995` |
| Owner | `import992995-only-20261026-888bb6ac` |
| Future exact dispatch token | `root-reviewed-import992995-only-20261026-888bb6ac` |
| Immutable lane BASE | `1be3c657ef0c1ef3152f8abced78df2e278f09da` |
| Expected lane branches | `codex/lane-992-20261026`, `codex/lane-995-20261026` |
| Runtime pins hash constant | `None` — disabled |
| Acceptance entries | Both `null` |
| Central / release identities | Both `null` |

The usual per-ID lane paths are derived by the unchanged helper. No external
operator transfer path is invented or created here. The owner token has not
reserved a transaction; existing-receipt/lock checks still apply before any future
authorized operation.

## Failure before mutation

`main()` requires the exact token **and non-None PINS_SHA before reading the pins
or helper**. Therefore this checked-in disabled template refuses even when given
its apparent exact token. Tests patch file reads and the mutation entry to fail
if reached and verify neither is reached. A separate local fixture temporarily
supplies the pending JSON's digest: `pins_ready()` still refuses its pending
status before the helper is read, runtime modules are imported or `execute()` is
entered. No real pins are enabled by either test.

`pending-pins.json` SHA-256 is
`f8d059331391db8c734ca26fcecf3d6112754311e6092d99a26082e571d39567`.
It carries only the existing finite-queue/runtime-policy requirements and verified
lane BASE. Its lane acceptance slots, central identity and release identity are
explicitly unresolved. Existing runtime hashes copied from the approved baseline
are future invariance requirements, not a fresh live acceptance/dispatch freeze.
The policy requirement remains
`816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c`.

At **06:27:00 SGT**, [reservation-observation.json](reservation-observation.json)
confirmed both actual reservations use this BASE, nice 10, ports 18797/18798,
status `started`, and publication disabled. Recorded #992 was still author
`992-author-bd39779c66e3`; #995 was review `995-review-f5d78a25ecbc`,
`review_pending`. This snapshot is explicitly not acceptance pins or native-agent
liveness proof. No report, score, candidate, final head, current central run or
release identity has been frozen in the pending pins.

## Preserved guarded behavior

- Both lanes must be completed, independently accepted and frozen before final
  pinning. Runtime/policy/importer bytes are verified before runtime module
  execution, with no new policy/reopen path.
- The finite 984 queue identity, exact current central dispatch identity and
  completed release ledger must match before owned STOP creation. Pending
  releases, foreign STOP, other active lanes and current-target conflicts refuse.
- Natural completion reaches an owned stopped boundary; active agents are not
  signaled. The unchanged deep importer owns locks, fingerprints and merge checks.
- On second-import failure, first import state/receipt and its imported
  reservation remain preserved; the second reservation stays started. Failures
  retain owned STOP/receipts and say inspect, never retry. Foreign STOP bytes are
  never overwritten.
- Publication-bound projection remains intact: 18 pending plus 2 incoming refuses
  at the 20 boundary, and pending registrations/releases are included. This is
  import-only; release ledger bytes stay unchanged. No publication call is added.
- Ordinary resume requires a fresh expected run/thread/turn/native identity,
  exact registration/candidate proof, one runner, existing max-round/publication
  settings, exact pushed continuation head, and unchanged ledger/reservations.
  Policy changes, unrelated reopens and destructive recovery are not introduced.

After both lanes actually finish, a separate fresh read-only capture must bind
their full histories, entries/reports/source identities, terminal heads and
reservations; recheck central run, release ledger and publication bound then.
Only a reviewed final pins digest can replace `None`, followed by separate root
authorization for one exact dispatch. Do not repurpose stale baseline acceptance,
release or current-run identities merely because their schemas match.

## Local verification

**22 tests passed:** 5 substitution/preservation tests and 17 existing adapted
operator-interface tests. Tests prove byte/AST reversal, unchanged helper,
fail-closed pending gates, runtime-hash ordering, partial-import preservation,
foreign STOP protection, queue-drift refusal, ordinary-resume registration proof,
and publication bounds. Existing isolated local runner fixtures use temporary
repositories/states and fake agent behavior; no real agent or Pi worker starts.
No browser/clipboard test is run.

```sh
python3 -B specs/reviews/parallel-992995-import-preparation-20261026/test_substitutions.py
python3 -B specs/reviews/parallel-992995-import-preparation-20261026/test_operate.py
```

Logs and `validation.json` freeze this preparation only. No live import readiness
or dispatch approval is claimed.

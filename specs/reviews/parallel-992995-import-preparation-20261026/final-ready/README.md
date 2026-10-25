# Final #992/#995 import-only proposal — review required

Both lanes actually completed independent acceptance and their runners exited
before this capture. The read-only capture finished successfully at **06:37:11
SGT on 2026-10-26**, exit 0 with empty stderr. This directory contains a separately
enabled proposal; the committed disabled parent files remain unchanged.
**No operator execution, Pi file write, STOP, import, worker launch, publication,
push or commit was performed. Fresh independent/root review and separate exact
dispatch authorization remain required.**

## Exact artifacts

| Artifact | SHA-256 |
| --- | --- |
| Enabled proposal `operate.py` | `bac505d88f928cc75bef78020de4999e4cf76a09eda23c8b5a1fa1c8311f306c` |
| Final `pins.json` | `f728f0c4b959caea85112e4bac606a4dab5f3e1db6f91dccf30988c03a75442b` |
| Read-only capture body | `1b2b0cd1dcecbc6ff9e412cc2cac3323acf9b63443384e262869e17cf42aa782` |
| Actual `capture.json` | `48074c479ac68790b1b6d554bd6c289c866520674395af189cc0a9cf48b490e4` |
| Unchanged helper | `f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698` |

`enable-only.diff` changes **only the PINS_SHA value** in disabled source
`e75a434a0829b46b3233d34a03f78094453ec6c02b47cbab0df0b8bb2eca101a`.
No flow, owner, dispatch token, helper or policy changes. The owner remains
`import992995-only-20261026-888bb6ac`; the token remains
`root-reviewed-import992995-only-20261026-888bb6ac`. No external transfer directory
has been selected or created. The original comment/pending artifacts are retained
as historical preparation; the enabled constant is the actual gate in this proposal.

## Frozen acceptances and histories

| Identity | #992 | #995 |
| --- | --- | --- |
| Candidate | `d0c85b2b93a6f29e23cdf9c6b7f19963d266b9aa` | `d84cfb5265103d6d321fdc3f0d5dd4b3e17ac13c` |
| Review commit | `3451d95894cf401b2462024ca4165565b259e6db` | `5a5cd3c329aec4854ea61f0ae5d15b1826f94a21` |
| Registration / terminal HEAD | `ed430afbbe348a302d6ddb0cd35f8142e2a0c04c` | `2ef5c525c750d800269cc33ed565f9a80b752a23` |
| Score / required open | 100 / none | 95 / none |
| Candidate = review = registration lesson tree | `8f0c8379da4165f9dc126d9189363bb0af6848bb` | `9fb98cd2eb0d740e233c2e52a1fe2eb318b4de87` |

Both lane states are `completed`, current is null, all author/review runs completed,
and accepted entries are `accepted_local` / `done`. Deep importer validation checked
run/session uniqueness, actual events/finals against every history entry, candidate
bindings, clean checkouts and saved heads. `_reviewed` validated the actual candidate,
report, source assets and registry metadata. Candidate→review→registration ancestry
and equal numeric-lesson trees passed; ordinary `git ls-remote` verified both exact
registration heads on their lane branches. No runner PID or process rooted in a
lane checkout remained.

Both actual reservations remain `started`, use BASE
`1be3c657ef0c1ef3152f8abced78df2e278f09da`, match their lane paths and unchanged
policy, and disable publication. Other reservations are inactive/imported as
required. Central has neither target record nor target run. Shared trees match
between current central, both candidates/terminal lane heads and the lane BASE.
This captures eligibility for a proposed import, not evidence of an import.

The exact original reports and compressed raw completed progress records are
saved here, and capture.json retains full entries/histories, report text, registry
entries, canonical/asset hashes and publication-proof metadata. Both reports were
read in full. #992 records at-most subtraction, positional multiplicity, zero
threshold, 16,739 independent canonical checks and bilingual source/device coverage.
#995 records forced choices, expiry-before-test, 3,586 independent canonical
subset-oracle checks and bilingual source/device coverage. Its optional `995-A01`
(related-link anchor precision) and `995-A02` (English “commute” wording) remain
open advisories, not silently fixed or closed. Both reports separate preset UI
coverage from custom code checks, Linux Chromium/CSS zoom from physical devices,
and review from successful LeetCode submission/publication. No browser or clipboard
checks were rerun by the capture worker.

## Actual central and release observation

| Item | Captured value |
| --- | --- |
| Central HEAD | `237c625ccf42fe101afd96e2d913c9b933566ecf` |
| Current ordinary run | `864-author-a939f826b6fa` |
| Session | `01a17534-7ece-7673-bb9b-a107a54f298f` |
| Runner / native PID | 1774575 / 1805108 |
| Shared policy | `816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c` |
| Last completed release | `84dfd908f5c94592918eb4ecb72eb87e` at `7fd4aa457c318f053d7dc722fd63b3012bccb838` |
| Release ledger SHA-256 | `163b32ba940e02a8f17c1ccaf5e9a9f6dfcd606491007d096faa9b971b45eda6` |

The current identity was freshly derived, not reused from #862 review. The single
central native child has matching ancestry, cwd and exact current-run output path,
fresh thread/turn and no terminal event. Its prompt metadata/ownership restricts
work to `leetcode/864/`; observed untracked files were only its two provenance
files. No foreign path or broad dirty-tree allowance was introduced. STOP was absent.

Actual ledger pending is null. The unchanged helper recomputed five eligible IDs
`854,857,862,982,987`, plus incoming `992,995`: conservative upper bound **7 < 20**,
no pending registrations or reopened IDs. Ordinary next problem is #864. The full
finite 984 queue hash, runtime/policy/importer bytes, ledger, reservations and lane
states were verified; central state/HEAD/native and these persisted inputs were
checked unchanged again before output. The old release identity was observed
afresh rather than copied as an assumption.

## Verification entry point and tests

`capture-readonly.py` is adapted from the prior committed read-only capture;
`capture-adaptation.diff` exposes its added native/ownership, tree/ancestry,
remote-head, archive and end-stability checks. Caller supplies parsed parent
`pending-pins.json` as `pins` and the unchanged helper file text as `helper_source`.
Run the combined payload through SSH stdin with `python3 -B`, saving stdout and
stderr locally. It checks all runtime/policy/launcher and helper hashes before
executing imported runtime code. It never calls import_lane, writes a receipt,
changes STOP or starts a process. It refuses if either lane is incomplete, a lane
process remains, registration is not exact-pushed, central has advanced during
capture, shared policy differs, a pending release exists or the sub-20 gate fails.
`capture-preparation.json` is the earlier dated waiting-state record, not the final
outcome; `validation.json` records this successful capture and proposal.

**21 local checks passed:** 17 adapted operator-interface fixtures plus four
frozen-artifact/identity checks. They cover the single-value enablement, exact
acceptance/report/tree/current bindings, runtime hash ordering, pending refusal,
partial-import preservation, foreign/owned STOP, queue drift, ordinary resume and
publication bounds. Local runner fixtures use temporary state and fake agents;
no real agent or Pi worker starts.

```sh
python3 -B specs/reviews/parallel-992995-import-preparation-20261026/final-ready/test_operate.py
python3 -B specs/reviews/parallel-992995-import-preparation-20261026/final-ready/test_ready.py
```

Fresh execution review must revalidate the exact current identity and release
ledger before any transfer/STOP, then retain the existing natural-boundary and
partial-failure protections. If central advances, capture and review fresh pins;
do not edit an approved identity silently. No final execution approval is implied
by this directory name or by the non-None PINS_SHA.

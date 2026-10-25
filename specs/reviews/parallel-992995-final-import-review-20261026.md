# Final independent review: #992/#995 import only

**Approved for the bounded import-only operation; no required findings.** Operator SHA-256 `bac505d88f928cc75bef78020de4999e4cf76a09eda23c8b5a1fa1c8311f306c`; pins SHA-256 `f728f0c4b959caea85112e4bac606a4dab5f3e1db6f91dccf30988c03a75442b`. Separate root dispatch and fresh live identity checks remain required. This review covers only the import of the existing frozen accepted candidates; a separate #995 copy-repair request is not included or adjudicated here.

## Exact change and tests

Read the final README/manifest, enabled script, capture body and actual reports/archives. Replacing only the PINS_SHA literal with None reconstructs reviewed disabled `e75a434a0829b46b3233d34a03f78094453ec6c02b47cbab0df0b8bb2eca101a` exactly. Owner/token, control flow, helper `f0c4ac70…`, policy, zero reopened IDs, importer and normal resume behavior are unchanged. All17 final manifest file hashes verified. The retained historical “Disabled preparation” comment does not override the now non-None gate; final documentation explicitly identifies an enabled proposal awaiting dispatch.

Independently ran **17 operator-interface tests in2.483s and four identity tests in0.009s, all passed**. [Operator log](parallel-992995-final-import-review-evidence-20261026/operator-tests.log), [identity log](parallel-992995-final-import-review-evidence-20261026/identity-tests.log). These retain disabled/pending refusal, runtime hash ordering, partial-import and STOP/queue/publication safeguards, delayed ordinary startup and registration-history verification. No live operator, browser or clipboard test was executed.

## Acceptance and live consistency

Verified decompressed raw progress hashes, complete entry/run hashes and exact report text against pins/capture. Then independently reran the inspected hash-before-import read-only capture with Python `-B`. At **2026-10-25 22:39:54 UTC / October26 06:39:54 SGT**, the **entire fresh pins and both complete lane archives equaled the frozen proposal**; current native PID/session also matched. [Capture](parallel-992995-final-import-review-evidence-20261026/capture.json), [explicit comparison](parallel-992995-final-import-review-evidence-20261026/identity-comparison.json), [stderr](parallel-992995-final-import-review-evidence-20261026/capture.stderr).

| Lane | Candidate | Exact pushed registration | Historical verdict |
| --- | --- | --- | --- |
|992|`d0c85b2b93a6f29e23cdf9c6b7f19963d266b9aa`|`ed430afbbe348a302d6ddb0cd35f8142e2a0c04c`|100; no required findings|
|995|`d84cfb5265103d6d321fdc3f0d5dd4b3e17ac13c`|`2ef5c525c750d800269cc33ed565f9a80b752a23`|95; no required findings|

Both are completed with null current, clean checkouts, exited runners and no lane checkout process. Actual run/session/events/final results and `_reviewed` source/metadata proof pass. Candidate/review/registration lesson trees are identical: #992 `8f0c8379da4165f9dc126d9189363bb0af6848bb`; #995 `9fb98cd2eb0d740e233c2e52a1fe2eb318b4de87`. Canonical source hashes are respectively `597643e0fa4dbc0f383302d78ff074426c811ecad597e2cd8da8841587cce5e3` and `31cc55e456b9d13a0350ec26272a1601f19a9832c3dde85f5f123c54d7c848b9`. #995-A01/A02 remain optional historical advisories; import neither repairs nor upgrades them. No fresh whole-lesson acceptance is claimed by this operational review.

Central remains HEAD `237c625ccf42fe101afd96e2d913c9b933566ecf`, #864 author `864-author-a939f826b6fa`, runner1774575/native1805108, session `01a17534-7ece-7673-bb9b-a107a54f298f`. Native ancestry/cwd/exact output directory and fresh nonterminal events match; dirty scope is prompt-owned `leetcode/864/`. The ordered984queue, shared policy/runtime/launcher hashes and reservations remain consistent, and neither incoming target is centrally started.

The unchanged ledger hash is `163b32ba940e02a8f17c1ccaf5e9a9f6dfcd606491007d096faa9b971b45eda6`, pending=null, latest completed release84df… at7fd4aa…. Eligibility is five IDs854/857/862/982/987 plus incoming992/995: **7 < 20**, with no registration prefix/reopened IDs. This is current eligibility evidence, not a guaranteed future count.

## Retained boundaries

Exact central identity and release guards must run again before owned natural STOP. Advancement requires explicit fresh reviewed pins; do not silently repin. At the stopped boundary, revalidate acceptance, ordered queue, policy and publication projection. The existing deep importer remains responsible for locks, exact candidate/source/provenance and preservation of prior history. No shared-policy adoption, copy repair, rescore, reopen or new publication path is authorized by these artifacts.

Both imports must preserve ledger bytes/reservations/history, then exact-push before normal continuous/full984/every20/max6 resume. Existing registration-prefix proof and fresh run/thread/turn/native evidence remain mandatory. Partial imports and failures retain receipts, commits, state and owned STOP for inspection; do not reset or retry blindly. The known spawn/STOP-removal crash boundary remains non-atomic.

Only local review evidence/report files were written; remote work was read-only. No STOP, import, source/state/policy mutation, commit, push, launcher execution or publication occurred during review.

Final disposition: root accepted the verified immutable manifest/hash set as the freeze boundary. Approval binds only the exact operator/pins above; no additional producer acknowledgment, test repetition or live mutation was needed.

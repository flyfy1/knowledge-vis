# Frozen #996/#1000 import-only proposal

Preparation only: no STOP, import, reservation update, source/policy adoption, queue mutation, worker launch, push or commit. The original disabled proposal is unchanged. `operate.py` differs only by replacing `PINS_SHA=None` with the captured pins hash. This executable proposal still requires independent final review and separate root dispatch authorization.

- Operator SHA256: `d05b1311070d66fb751292a3e35fcd5c2f1d4ec6c339a670ee68864591eaddbe`.
- Pins SHA256: `d5842e36977e38f3bcc095d9610818af577c778307664ab498352b3feeb257b0`.
- Unchanged helper SHA256: `f0c4ac708a4b0209c7a6522787b38a04923ac922d61d8afa0dbecf7b8ad61698`.
- Owner/token: `import9961000-only-20261026-641c280f` / `root-reviewed-import9961000-only-20261026-641c280f`.

## Actual read-only capture

At2026-10-25 23:39:27UTC, central HEAD/checkpoint was `3f86d6a43303d4dedcc1f9e2aafe1449e8fd43af`, current `879-author-ce034589b597`, runner1865819/native1900058, session `01a1756d-2f73-7060-8df8-f3bacfc08a6b`. Fresh thread/turn/native ancestry/cwd/output were checked. Dirty files were restricted to the actual author's `leetcode/879/` ownership. No STOP, other worker or lane checkout process existed.

Both lanes were completed/accepted/current=null, with exited runners and clean checkouts. Exact registrations were verified by read-only remote `ls-remote`:

| ID | Accepted candidate | Fresh review commit | Registration / remote head |
|---|---|---|---|
| 996 | `0cd4cc9fd8de9a9e349a8d9c74313cb7c3ec3b38` | `82715e0ead4491d2c2020432b6011a25a5ba52db` | `af88d4a6f1c7727420c024fe3abce66c795fccb0` |
| 1000 | `20f52a5cf74957ddacf1a7627ed882defe6a70f5` | `134bfbe9767a8f92fa3f1263c1f2c2d7a3485b4d` | `30516661a5cfc0673c2dcfaa018444e2ffa2c85b` |

#996 round2 is100/100 with `996-R1-COST-01` explicitly closed; its original failed96.25 review remains in full history. Its report preserves the identical-byte author contrast evidence rewrite process deviation. #1000 is92.5 with no required findings; dense derivation and zoomed table panning remain reported limitations. Capture validates actual accepted states, completed runs, publisher review eligibility, canonical bytes, metadata/registry records, candidate→review→registration ancestry and equal lesson trees. No new algorithm/browser tests or acceptance were fabricated by this observer.

BASE remains the completed #995 queued-repair handoff head `6c68b23cc306067de5a912195a3c7edeebc2a0be`. The raw handoff receipt SHA is `86159f93f1a918035f10c47c6bbda09409b8a914c0320dfee40551b305eed343`. Both reservation BASEs and `same_shared` checks bind this later shared tree. The isolated #854 proof-bridge branch is not adopted.

Queued #995 remains `changes_required`/`fix` with its exact entry, run-history hash, maintenance history and request hash captured. Actual `_reviewed` excludes it. Import-only control flow has no reopen/policy replacement step; unchanged `import_metadata_preserved` protects every prior problem/run, maintenance record and queue. A focused negative test rejects changing queued #995 back to accepted. These extra captured #995 fields document the observation; they are not a newly invented executable scheduler guard.

The984-ID queue and release ledger are unchanged. Latest completed release is still bound by exact receipt/revision/hash; pending is null, ledger SHA256 `163b32ba940e02a8f17c1ccaf5e9a9f6dfcd606491007d096faa9b971b45eda6`. Actual digest-qualified eligible count is9; adding deduplicated incoming996/1000 yields conservative upper bound11. No subtraction of accepted-minus-released or future-registry simulation is used. Dispatch must revalidate exact current head/run/runner and release identity before its owned STOP; ordinary boundary and pre-resume bounds are also retained.

## Validation and remaining gate

17 adapted existing safety tests plus5 frozen-identity/preservation tests passed. They cover actual delayed runner startup and registration, wrong-run refusal, helper hash-before-execution, publication/pending gates, foreign STOP preservation, partial-import retention, queue rereads, no adoption/reopen, exact pin-only enablement, actual acceptance/history/tree receipts and queued995 preservation. `capture-adaptation.diff` exposes the read-only capture changes; all artifacts are hashed in `validation.json`.

Final independent review and root dispatch are still required. If central identity advances before dispatch, refuse before STOP and prepare a separately reviewed observation refresh; do not silently update these pins. Preserve all partial receipts/STOP/history on a real operation failure and do not retry automatically.

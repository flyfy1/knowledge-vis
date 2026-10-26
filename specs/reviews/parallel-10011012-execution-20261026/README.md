# #1001/#1012 exact-launch refusal — 2026-10-26

**Refused before transfer or launcher execution; zero lanes spawned.** No reservations, checkout/state directories, central STOP, policy or publication changes were made. No silent repin or retry occurred.

Authorized source `367d0ff8428031e59dc474dad86b1378ed03471d`; launch SHA256 `b67d0a53fb067e21aa7a1f506f77d11343af8abe3ba1e7a9f6acc0073b987a46`, preflight `63295fc43653f73801b9ef39fb4b96fe107ba1ab1c9bcae399081fd370ce2d97`, parameter map `e326dbd3baa893730a03afcb8c05c213eb3c265afef995a6251b4ad64e81ff9b` were verified locally before the read-only preflight.

At **2026-10-26 00:14:19UTC**, the unchanged preflight completed successfully with empty stderr. General eligibility, shared tree, receipt/BASE/policy, one worker, target absence, available ports and current review-owned dirty paths passed. The additional mandatory exact observation comparison then refused:

| Identity | Frozen | Actual |
|---|---|---|
| HEAD |`048d217b1313ec068fbf41fe3703f5f3e83dcc90`|`b3336f7dc7243e7d15f336ab490eb6c3a0824304`|
| Run/stage |`854-fix-4964d1606702` / fix|`854-review-dcc68f3629c0` / review|
| Session |`01a17588-eeec-7b71-91f6-8bdbffe0305e`|`01a1758c-7fc0-7b21-9f8d-9c75db7c79b1`|
| Native Codex |1984809|1988405|
| Runner |1984564|1984564|

The new review began00:11:43.941515UTC. BASE remains048d217b; the prior adoption receipt and runner still match, but they do not waive current identity drift. Root independently reported the same advancement while this preflight was running.

Both targets had no problem record, run/run-directory, reservation, lane checkout/state, branch or listener at capture; ports18801/18802 passed temporary binds and closed. No transfer command was issued and no launcher PID/receipt exists from this attempt. `comparison.json` records all eight explicit comparisons; `refusal.json` preserves exact observed identity and target absence. Full preflight including the large immutable handoff receipt is preserved losslessly in `preflight.json.gz`; the summary omits only that repeated receipt.

Root was notified promptly. A separate producer/reviewer may prepare a new observation refresh; this refused authorization does not permit an automatic retry. Existing #854 review continues untouched. No local commit was made by this observer.

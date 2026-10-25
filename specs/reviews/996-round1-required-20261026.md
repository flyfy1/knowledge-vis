# #996 round 1 required cost correction — 2026-10-26

**Changes required, 96.25/100; `996-R1-COST-01` remains open in this historical review.** This is an archive of the actual failed gate, not an acceptance or a claim that the later fix is independently closed.

Candidate `f3eec8c23092990d0309b8f227d5e2a2cf233d1d`; fingerprint `ac3efcd80cda6c9f907b5b9df2eae14c52f96fb7fa3b1ec7bc4c7da7b8de4519`. Reviewer run `996-review-67e31a100281`, session `01a17561-e4d1-7a70-940f-ca3695122afc`; report `specs/reviews/996-review-1-1d9a6502.md`; review commit `03cdc24b4aadb90bbe616279aeccf093c0267c91`.

Both localized cost strings in candidate `copy.js:287–288` claimed preprocessing `O(k²)`. Candidate `solution.py:7` constructs `Counter(nums)`, which visits all n input entries. The phase bound must include that work: `O(n + k²)`; sorting k distinct values is dominated by the quadratic compatibility construction. The original total factorial-time and auxiliary-space bounds remain conservative and sound. No numerical-answer defect was established.

The reviewer executed the unchanged canonical callable with an instrumented list iterator: at fixed k=1, n=1/6/12 produced exactly 1/6/12 input visits, all returning 1. This supports the missing scan identified by code inspection; it is **not** a timing-based asymptotic inference. The archived instrumentation command/output and `preprocess-boundary.json` retain the exact evidence. Canonical source SHA256 is `0075faaa73aef51ec54192dffbaa04987f05100aafe84a4f9f062d9411c4086f`.

Scores were 4/4/4/4/3/4. Browser, algorithm, source parity, native copy/fallback, bilingual controls, selected widths and CSS zoom checks passed as recorded in the full report. The required finding blocks acceptance despite a score above85. Limitations include no judge submission, live official language-selector verification, human-learning study, production verification, physical-device or native browser-chrome zoom proof.

The existing lane started ordinary fix `996-fix-c44013a158e2` at 23:30:59 UTC. A later closure must be recorded separately against the new frozen candidate and a fresh independent review. This observer did not edit, restart, import, publish or mutate lane state.

[Bounded evidence](996-outcome-20261026/) preserves the original report/state, exact candidate canonical source and cost-line excerpts, actual counter instrumentation events/results, two cost-panel screenshots, independent check receipts and hashes in `round1-manifest.json`. It does not duplicate the whole lesson. Ready for root review/commit; this observer made no commit.

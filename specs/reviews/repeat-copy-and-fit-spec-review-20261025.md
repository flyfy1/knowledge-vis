# Independent review: repeated copy and native-select evidence

Date: 2026-10-25. Reviewer: separate agent `font_metrics_spec_review`.
Reviewed proposal SHA-256:
`8997483ee9a81fcf5492362826c7eed901dd548d651a9a86738ebd8732291509`.
Scope: the proposed section 4 replacement and section 8 addition, compared with
the current rendered-state contract and the linked #745/#765 evidence. No browser
rerun was needed; this is document review, not fresh lesson verification.

**Verdict: approve this exact proposal. Required findings: none.** Both amendments
strengthen evidence interpretation within existing gates, without changing scores,
waiving failed assertions, or asserting an unsupported runtime defect.

The [745 review](745-review-mac-copy-adapter-20261025.md), archived focused probe
and `focused-results.json` substantiate the repeat-copy gap. The probe creates a
distinct non-source sentinel for each locale and verifies it before denying
automatic writes. Wrong-host copying retains that sentinel; actual Mac copying
replaces it with the exact 405-character canonical source in both attempts.
The proposed per-attempt reset and verified readback prevent a later no-op from
passing against an earlier successful transfer. Focus, full selection, real host
copy, exact equality and explicit inability-to-verify reporting remain required.
The surrounding host/platform and frozen-test adapter rules remain unchanged.

The [765 diagnosis](765-mac-fit-diagnosis-20261025.md) supports the proposed
classification: original canvas width 209.440px exceeds the 206px conservative
budget, while DOM measurement agrees and the actual selected label is complete.
The overlong positive control clips; it does not turn the original into a clipping
case. Shorter equivalent copy measures 200.016px and passes the same predicate in
the diagnostic experiment. The amendment correctly requires a new candidate and
the original case/full relevant suite before treating that as a verified repair.
It neither identifies an unmeasured native-arrow width nor lowers the allowance.

Scope remains bounded to repeated fallback attempts and diagnosis of an observed
fit failure. No universal font matrix, synthetic test result presented as native
proof, or blanket historical retesting is introduced. Prospective adoption must
wait for completion of already frozen work and record the policy revision and
first eligible subsequent work. This approval does not itself adopt policy,
close #765, alter #745's historical acceptance, or establish public delivery.

Optional implementation-level safeguard: when reusing one browser context across
attempts, restore a trusted clipboard writer for seeding before reinstalling the
denial; read the sentinel again immediately before the host copy action. The
archived #745 probe already demonstrates the latter. This preserves the proposed
contract and needs no additional scoring or generalized clipboard framework.

Only this review file was created. No contract, runtime, campaign state, commit or
deployment was changed. The verdict is bound to the proposal hash above.

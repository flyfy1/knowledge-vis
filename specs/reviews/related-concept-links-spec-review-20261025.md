# Independent document review: related-concept links

Date: 2026-10-25. Reviewer: separate agent `font_metrics_spec_review`.
Reviewed proposal SHA-256:
`c8fd12dd7972d7ede302a6f737a3a76d7a1718e85ed5dd1c12f0625717a27f11`.
Scope: the current related-concept-links proposal, existing explainer/rendered-state
requirements, and its linked #239 follow-up and repair request. This is document
review, not lesson acceptance, link repair verification or public-delivery proof.

**Verdict: approve the current proposal for prospective adoption. Required open
findings: none.** Its bounded check follows existing concept-deep-link, real-browser,
keyboard and independent teaching-review requirements without creating a new
layout, scoring dimension or semantic crawler.

The [239 follow-up](239-review-related-links-20261025.md) supports the distinction:
the inspected local destinations contain a regex prediction and a running-maxima
derivation, despite labels promising monotonic-stack domination and prefix sums.
The proposed #84/#239 pop distinction and #327 range-sum explanation preserve the
meaning established by that report. These are illustrative examples rather than
mandatory destinations. Structural text/href/fragment regressions can prevent
recurrence; independently reading the rendered target supplies the separate
semantic evidence. Neither is presented as a substitute for the other.

I checked the publication-dependency claim against `scripts/leetcode_publish.py`:
`_asset_refs` explicitly excludes inter-lesson navigation from runtime dependencies,
and release staging uses that asset scan. The revised proposal correctly states
this limit; it no longer implies an existing asset gate guarantees navigation.
Preferring a served target and explicitly recording a same-batch dependency,
followed by checking the actual published target, is realistic within the current
workflow. No automatic inclusion or waiver of target acceptance is authorized.

The [repair request](239-review-navigation-repair-request-20261025.md) expressly
selects the advisory for a new candidate. The proposal preserves that distinction:
an ancillary finding does not silently rewrite historical scores, while a selected
repair still needs fresh independent review of closure and preserved behavior.
Recorded idle-boundary adoption and retention of frozen policy identities match
the existing contract. Prior release receipts remain historical evidence, not
proof of the changed candidate's delivery.

## Bounded recommendations

- For a same-batch destination, record its accepted candidate and confirm its
  inclusion in the selected release manifest before deployment. The actual served
  check remains necessary afterward. This makes the dependency record actionable
  without adding a new resolver or changing publication thresholds.
- When recording the observed target explanation, include the target revision or
  release identity when available. This distinguishes the locally inspected target
  from later served content and makes future semantic drift easier to diagnose.

Only this review file was written. No shared specification, implementation, Pi
state, commit or deployment was changed; no fresh browser or public-link checks
were run. The verdict applies to the proposal hash above.

## Integrated section verification

Date: 2026-10-25. **Approved: the local integrated section 12 equals the approved
proposal body plus exactly the two bounded recommendations above.** I compared
the texts directly. Apart from promoting the section heading from level 3 to
level 2, the only changes require the accepted target candidate and selected
manifest inclusion before deployment, and add target revision/release identity
when available. No other requirement was added, removed or weakened.

Exact SHA-256 values at verification:

- Full `specs/leetcode-rendered-state-contract.md`:
  `226a94fb0cd222398b710718253d7ed46cd77f986ed61eef7e25c14213845dcc`.
- Section 12, from its `## 12.` heading through the final newline:
  `27c57059efa5186e8e9f48be316f9adb63c95fe18c377e82de4c1359f814fa2f`.

The [dispatcher adoption request](related-concept-links-adoption-request-20261025.md)
correctly distinguishes local document preparation from central adoption. It
leaves adoption pending until a recorded safe boundary after the frozen #239 and
#736 reviews, retains their policy identities and historical results, and requests
an explicit adoption receipt. This closes only the independent document stage.
I did not inspect or mutate Pi state, adopt policy remotely, verify lesson closure,
or deploy. Only this review report was appended.

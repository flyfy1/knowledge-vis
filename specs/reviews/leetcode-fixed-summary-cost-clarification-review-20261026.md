# Independent review: fixed-summary phase-cost clarification

**Recommendation: adopt the two proposed §9 edits at a separately reviewed future policy boundary; defer activation now. No required wording corrections. Do not add a localization amendment.** This is a proposal review, not policy adoption or a retrospective acceptance change.

Read the proposal, its bounded audit, current rendered-state §9, the explainer's localization key/meaning contract, the review-gates localization paragraph, and archived #878/#996 finding/source evidence. Verified all 10 audit file hashes. The proposed delta is proportionate: one sentence broadens the existing parameter check and one worked paragraph shows a failure mode the existing zero-depth example does not illustrate.

## Why this small delta helps

Current §9 already requires truthful phase costs and valid parameter conventions. Its phrase “several independent parameters” and concrete zero-depth example can nevertheless suggest looking only for an independently variable parameter becoming zero. Here `1 ≤ k ≤ n`; `k` cannot be zero on a valid nonempty input, yet can remain 1 while the scan length changes. Respecting valid relationships while testing zero **or positive fixed** summaries clarifies how to apply the existing obligation. It does not add a scoring gate or a generic requirement to append n.

The proposed `Counter(nums)` example is grounded in the actual archived code. I independently executed its unchanged `Solution.numSquarefulPerms` with a list subclass counting yielded input entries: all-equal inputs of lengths 1, 6 and 12 produced k=1, visits 1/6/12 and answer 1. The source places this scan before sorting k distinct values and constructing the k×k matrix. Thus the combined preprocessing account needs O(n+k²), or an explicitly limited O(k²) matrix-stage claim with counting accounted for separately. This loop/source argument supplies the reasoning; three finite valid-domain observations are corroboration, not an asymptotic proof or timing benchmark.

The original #996 issue was the unqualified preprocessing claim in both languages. The total-program time and auxiliary-space bounds remained conservative/correct, and the numerical algorithm was correct. The proposal preserves those limits and the recorded round-2 closure. It does not justify a new failure, rescore, broader algorithm claim, mandatory Counter suite, or expansion beyond the original valid domain.

#878 needs no additional rule. Existing guidance already distinguishes semantic correctness from key presence, namespace uniqueness and pair shape, and explicitly checks rendered meaning. The archived map0/1/2 values were input labels rendered where code-transfer explanations belonged. Both languages could agree and still serve the wrong explanatory purpose. The original report correctly charged Python transfer while retaining its separate bilingual score. Another localization rule would repeat existing guidance without addressing a new gap.

## Adoption and evidence limits

Keep the proposal's preservation of small-case/source inspection, no timing-only proof, proportional checks, separate baseline/submission/snapshot costs and no rubric changes. Apply the new paragraph only when the actual phase performs the scan; do not impose it on code that receives an already-built frequency map.

Active specs, prompts, lessons, frozen candidate scores and runtime state were not changed. No browser, network, judge or publication checks occurred. The proposal's reference to an active #854 handoff is dated context; the recommendation is to wait for the next explicit policy-adoption boundary and respect whichever transaction/lane hashes are then active, including upcoming #1001/#1012 pins. Completion of one handoff is not automatic authorization to alter another operation's shared-policy identity.

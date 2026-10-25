# Independent review: baseline syntax and accumulator teaching

Date: 2026-10-26. Disposition: **recommend a small prospective authoring clarification; no new acceptance gate**. This is a source/evidence review, not another lesson acceptance, measured novice study, or public-delivery check. No active policy, lesson, campaign state, or remote file was changed. The website-design review-first discipline was applied to scope and audience fit; no new UI component is proposed.

## Frozen evidence

Reports were read with `git show` at central commit `ebb5a2b3ec75400e7e06f85f7e5d6169a30b9ef9`, rather than inferred from active reviewer messages. Lesson HTML, bilingual copy and canonical Python were read at each reported candidate:

| Lesson | Candidate | Exact finding and source observation |
| --- | --- | --- |
| #920 | `e1dfa23199ec290c1e795f870689ce075e3d79f8` | [920-N01](https://github.com/flyfy1/knowledge-vis/blob/ebb5a2b3ec75400e7e06f85f7e5d6169a30b9ef9/specs/reviews/920-review-1-62e8ca13.md), “Findings and prior-review closure”: baseline `index.html:7–26` uses `product`, tuples and set operations. `copy.js:74–80` explains enumeration, coverage, recent-k rejection and streaming cost, but does not explain set semantics or the removal operation. Canonical `solution.py` uses none of those baseline APIs. |
| #801 | `154c1becf178b798dfbd80acbb79fabdd262ae68` | [801-A1](https://github.com/flyfy1/knowledge-vis/blob/ebb5a2b3ec75400e7e06f85f7e5d6169a30b9ef9/specs/reviews/801-review-1-3074702f.md), “Findings, scores and conclusion”: baseline `index.html:8–15` uses shifts, bit tests, `bit_count`, comprehensions and `all`. `copy.js:15–16` explains bit i as the exchange choice and the exhaustive cost, without decoding the operators. Canonical `solution.py` uses the independently explained two-cost DP and no masks. This is the completed accepted review, superseding provisional remarks. |
| #903 | `26f8fd8ec1e79a233779b82a4c8ee3d63edaee17` | [903-A1](https://github.com/flyfy1/knowledge-vis/blob/ebb5a2b3ec75400e7e06f85f7e5d6169a30b9ef9/specs/reviews/903-review-1-52a18398.md), “Findings and scores”: `copy.js:38–41` already explains prefix/suffix reuse, write-before-add for I, add-before-write for D, and maps `total` to code. `solution.py:8–17` implements precisely that ordering. The optional gap is a numerical accumulator walkthrough, not a missing derivation. |

All three reports accepted their candidates at 96.25/100 with no required open findings, identifying minor Python-transfer friction for the stated basic-Python reader. They do not establish actual novice failure. Report SHA-256 values, respectively:

- #920: `2a1458107380b1d24ef5f01fbb801d467d150480b19084ef5aa7fba9c03c1375`
- #801: `23599f660544217e5ec11a684ad4ee5d89ad4a44dddfab527300ad534d95e5b6`
- #903: `8055ad63b7dfbadee54a39b4c24ee417a71c4feaf527112651fb34124498d379`

## Existing coverage and smallest useful delta

The current explainer already requires the target reader and step prerequisites (lines 61–65), an understandable correct baseline (79–83), transition-to-Python mapping (90–98), observable accumulated behavior (109–113), and concrete gradual derivation (278–291). The gates already require a cold reconstruction without the brief, a fresh example and code mapping, and distinguish minor friction from missing essential causal bridges (lines 25–67). The local policies match frozen `154c1bec…` byte-for-byte: explainer SHA-256 `6d4cc609772cb6c6382148568107a0ffd8b6c40cbbf4af473f2519ab364a2945`; gates `e962d37d8bc0c4b690ea35ae8bc728ffe138e9b1d768054c98b9654fadcde789`.

Thus the underlying requirement exists. A new syntax checklist, mandatory glossary, animation or scoring dimension would duplicate it. The useful clarification is that **baseline code also consumes the reader's prerequisite budget**, and that the concrete example should bridge the final accumulator optimization, not stop at the direct recurrence.

Suggested addition under **Concrete, gradual explanation contract**, without changing review-gates:

> Apply the declared reader prerequisites to baseline code as well as the final solution. When an unfamiliar helper API or compact expression obscures what a line does, give a short local explanation or a tiny equivalent example in both languages. For a basic-Python reader, consider enumeration helpers, set updates and bit tests/counts; explain the operations actually used, rather than adding a general syntax tutorial. Familiar loops need no repeated introduction.
>
> When replacing repeated sums or scans with an accumulator, prefer a short numeric trace from the lesson's existing example: show the accumulator before the update, the term added or removed, the value afterward, and when the destination is written. Explain direction or boundary exclusions where they affect the result. Adjacent prose or a small table is sufficient; reuse existing evidence when it already makes this bridge clear.

## Adjudication and adoption boundary

**Recommended:** adopt only this clarification at the next authorized safe policy boundary. Keep the existing required-versus-advisory judgment: unreadable syntax that blocks the essential mechanism or executable transfer can support a required finding under existing gates; absent syntax comments or a dedicated numeric table alone cannot. A correct, reconstructable explanation with minor friction remains advisory. No point deductions, retroactive rescoring, reopened acceptance, or automatic edits to these three lessons follow from this proposal.

**Also defensible:** leave policy unchanged and use this report as author guidance; existing contracts already cover the learning objective. The reason to prefer the small addition is the repeated baseline-versus-final-code distinction across two independent reports, plus the separately observed last optimization bridge in #903. Mandatory walkthroughs for every API/loop, new automated presence checks, or broader lesson rewrites are deferred as disproportionate to this evidence.

No suites were rerun: the question is authoring guidance, and the exact reports plus frozen copy/source are sufficient for this narrow assessment. Any future lesson revision still requires its normal fresh independent review; any adopted wording must not silently replace the policy frozen for currently running lanes.

## Dispatcher decision and implementation

Adopted the two proposed paragraphs in `specs/leetcode-explainers.md` under
“Concrete, gradual explanation contract.” The existing rubric and required/advisory
thresholds remain unchanged. A dedicated table, syntax glossary, new UI component,
or automated presence check is not required. Earlier lesson acceptance and scores
remain intact. The reviewed proposal is the full scope; broader lesson rewrites
are deferred until a concrete lesson-level revision is requested or required.

P0 is the short prerequisite and numeric-transition clarification plus independent
wording review. P1 is adoption at a clean campaign maintenance boundary after
the active #940/#956 lanes are safely imported. P2 and deferred work are generic
syntax tutorials, new visual components, and retrospective lesson changes; the
current evidence does not justify them. The high-return change is making the
existing learning contract concrete without adding a separate checklist.

This is a local policy refinement pending central adoption. The active Pi queue
and #940/#956 lanes retain their frozen policy. Do not copy the new specification
into those checkouts during authoring or review. Record the eventual adoption
commit and preservation checks separately; this document does not claim that
future runs already consume the clarification.

## Independent final wording review

**Pass, 2026-10-26; no required changes.** Inspected the final 14-line explainer
diff and dispatcher decision. A whitespace-normalized comparison confirmed that
the two inserted paragraphs exactly match this proposal. Reviewed explainer
SHA-256: `aea47ced67404393d055b2cedf8750012e31b07c3af60e19b2d2533fc08a821f`.
The conditional syntax explanation, “prefer” numeric trace, prose/table choice,
and explicit reuse of existing evidence avoid mandating a general tutorial or a
new table. Existing required/advisory distinctions remain the adjudication rule.

Checked that review-gates and campaign/publisher scripts have no diff against
HEAD. The task's explainer diff contains no runtime, rubric, or acceptance change;
unrelated working-tree changes were observed and excluded from this conclusion.
The report permalinks use the verified repository origin and the same immutable
commit/path identities read in the initial review; no new network availability
claim is made. No executable suite was needed or run for this prose-only change.

The initial “no active policy changed” and byte-for-byte policy/hash statements
above describe the **pre-implementation review snapshot**. The dispatcher has now
prepared the local explainer change; “Adopted” in its decision means local wording
selection, not Pi campaign adoption. Its explicit pending-central-adoption note
accurately preserves that distinction. No central policy/state check or mutation
was performed in this follow-up; eventual adoption and preservation proof remain
separate work at the stated safe boundary.

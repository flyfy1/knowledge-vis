# Independent proposal: keep workflow status out of lesson copy

Date: 2026-10-26. **Recommend a narrow prospective clarification.** This is a wording/scope assessment, not a new acceptance decision. No lesson, active policy, queue, run, or remote file was edited. The website-design review-first discipline applies: keep learner-facing content relevant to learning, with no additional badge or component.

## Exact evidence

- Frozen #940 candidate `4d65eab80efc4cff1f122918d021f0c9e308e686`, read through Git in the Pi lane: `leetcode/940/copy.js:41` defines `foot` as “作者自查候选；独立评审待进行。” / “Author self-checked candidate; independent review pending.” It then distinguishes simulation, tests and submission acceptance. `index.html:18` binds the footer directly to this localization key. Copy SHA-256: `db79c8f2ba6489ef7bf4af67e232f9d0c3e80ed3a442ad8a8f2f6f6b1e1c3e93`; HTML: `f8efd06fa5d97dda71c3f8f58f64d7ebf8061dab81f951d1479bf2e1c2d8ffe8`. This establishes frozen source/binding, not a fresh independent rendered #940 review.
- Ordinary public [#780 Codex page](https://visual.integ.life/leetcode/780-codex/) returned HTTP 200 in a fresh Playwright Chromium page at `2026-10-25T16:50:48Z` (2026-10-26 00:50 SGT). Actual footer after each locale click: “作者自查候选 · 尚待独立评审。未声称 LeetCode 提交通过或实际学习效果。” / “Author self-checked candidate · Independent review pending. No claim of LeetCode acceptance or observed learner outcomes.” The ordinary public `copy.js` also returned 200, SHA-256 `5db7c700615f16b2b7047d08efcc92271e4d80e1c51acee5b04074966ff28eec`. The web reader could not access the page; direct browser rendering supplied this evidence. This check confirms public copy, not release-history reconciliation or a new lesson review.

The frozen #940 author/review prompts and review-gates match the inspected local files byte-for-byte. Author prompt SHA-256: `036b88a5740ac4e81f357904e069e6daa782983f40c5d4db08e30599255ee6dd`; review prompt: `129537defd8df8fda1c84c3bea80b62c8c717275f558128d8b62b02319838a1b`; gates: `e962d37d8bc0c4b690ea35ae8bc728ffe138e9b1d768054c98b9654fadcde789`.

## Ambiguity and smallest change

The author prompt correctly says this is the author run, forbids independent-acceptance claims and fake completion, and requires self-check labeling. Gates lines 101–120 distinguish workflow stages; lines 196–206 require truthful reporting of pending evidence. The review prompt explicitly writes an evidence report and forbids implementation edits. None requires a pending-status footer. The ambiguity is **where author status belongs**; these rules can be overextended into runtime copy. This is a plausible instruction-level contributor, not proof of how either author chose the wording.

A static footer frozen before review cannot automatically know a later acceptance or deployment state. Changing it to “accepted” before review would fabricate completion; editing it afterward would alter the accepted candidate. The appropriate default is to omit transient workflow status from the learner UI.

Suggested explainer paragraph:

> Keep transient author, review and publication status in the BRIEF, self-check evidence, independent review reports and campaign/release records, not learner-facing lesson copy. Do not announce temporary workflow states such as “author candidate” or “independent review pending” in the lesson UI, or add workflow completion badges. Retain stable limitations that help the learner interpret the material, such as a teaching simulation not executing the displayed submission or a conceptual comparison differing from the original interface, beside the relevant content. Omitting workflow copy does not assert acceptance. Never insert an unearned completion claim or rewrite a frozen candidate after review to update status; any runtime-copy change follows the normal new-candidate and independent-review process.

Suggested author-prompt sentence immediately after the author-run disclaimer:

> Record author/review status in BRIEF and evidence records, not lesson UI; follow the explainer's workflow-copy rule while retaining learner-relevant simulation and language limitations.

This adds no UI badge, model label, metadata service, runtime status lookup, publisher rewrite, or automatic cleanup rule. Codex origin remains represented by the separately authorized URL routing. Review/report truthfulness requirements stay intact; no rubric change is needed. This is a semantic rule, not a keyword-presence gate: algorithm/domain states such as a pending Promise or a candidate solution remain allowed. A generic disclaimer about absent submission or measured-learning evidence need not become recurring footer copy when no such claim is being made.

## Boundary and next action

Adopt prospectively only after independent wording review and an authorized safe campaign boundary. Current lanes keep their frozen policy. This proposal does not rescore #940 or #780, change their acceptance, or direct the active reviewer to waive or add a finding.

The observed public #780 footer and frozen #940 footer are not repaired by this proposal. Any later cleanup must preserve their actual review state; for an accepted/published footer, cleanup is separate work: create a new candidate, obtain fresh focused independent review of the affected bilingual copy under the existing narrow-revision rules, then use the normal publication and served-byte verification path. Preserve previous review/release history. No automatic post-review mutation or publisher text stripping is authorized.

No broad suite was rerun; the narrow public browser read, exact source/binding and relevant instructions suffice for this proposal. Actual novice comprehension and all public delivery states remain outside this assessment.

## Dispatcher decision

Adopted the proposed explainer paragraph and author-prompt sentence locally,
pending independent final wording review and central adoption. Existing rubric,
reviewer independence, status reporting and immutable-candidate rules remain
unchanged. This applies to production-workflow status, not algorithm/domain
states. Stable limitations remain beside the content they qualify. No runtime
page or publisher behavior was edited.

P0 is the prospective placement rule plus explicit author instruction. P1 is
safe central adoption after the active #940/#956 lanes are imported and a clean
maintenance boundary is confirmed. Separate follow-up work is the known #780
public footer and #940 frozen footer, through new candidates and focused fresh
independent review; this policy update does not repair them or create acceptance.
P2/deferred work includes status badges, automatic scrubbing, a runtime status
service and broad unrelated lesson rewrites, because they add machinery or alter
reviewed assets without solving the instruction ambiguity. The highest-return
change is to locate truthful reporting in its proper records.

The active Pi queue and lanes keep their frozen specification and prompts. The
new policy must be adopted by an explicit source commit, path allowlist and hash
checks at the maintenance boundary; it must not track the moving main branch or
rewrite existing review/release receipts.

## Independent final wording review

**Pass, 2026-10-26; no required changes.** Inspected the final explainer and author
prompt diffs and the dispatcher decision. A whitespace-normalized comparison
confirmed exact parity with the proposed paragraph and sentence above. Final
file SHA-256 values:

- `specs/leetcode-explainers.md`: `7fe59194a1ab1eb838a865a6cefcfbd98d527fe7657d1614c959b73c86dc404e`
- `scripts/campaign-prompts/author.md`: `5f7feaa56f9f8f1f3f434e1fe4576cc2a10da21594c9aef829cab86e69dae06b`

The rule expressly addresses transient workflow announcements, so algorithm and
domain states remain allowed. It preserves relevant simulation/language limits
without requiring generic disclaimers or replacement badges. It neither grants
acceptance by omission nor authorizes edits to frozen candidates. The report
clearly identifies local preparation, pending central adoption, and separate
future #780/#940 candidate/review work.

Verified no diff against HEAD for review-gates, the reviewer prompt, campaign and
publisher scripts, or local #780/#940 paths. There is no runtime scrub or changed
review rubric in this patch. This does not certify unrelated working-tree edits
or a central adoption that has not occurred. Earlier frozen/local byte-match and
author-prompt hash statements describe the initial assessment snapshot; the new
local prompt is identified by the hash above. No executable tests or remote
mutations were needed or performed for this final prose review.

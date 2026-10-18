# Independent state-readability documentation review

Outcome: **accepted**. Required open findings: **zero** (`[]`). This accepts only the documentation clarification; it does not accept or repair a lesson.

Candidate: `cae9c2c9b0c00076bfae8a21236c86ef2f3d7e7e`.
Exact sole parent: `1b54881e0f4731ceddcf383f288620d55781fe9a`.
Date: 2026-10-18. Reviewer: this fresh Codex review run, gpt-6.1-sol, medium, distinct from author session `01a14f14-a0de-7f82-9e9b-95ee29861cce`. Reviewer session UUID is unavailable in the supplied runtime context. No additional agents were used.

## Scope and independent basis

Read `WORKFLOW.md`, `/home/songyy/Documents/agent-skills/website-design/SKILL.md`, `UI-I18N-SPEC.md`, the exact parent-to-candidate diff, and surrounding explainer/review-gate contracts. Applied the design skill's readability, bilingual/accessibility, and evidence-boundary requirements to the existing contract. This is a documentation consistency review, not a new feature/layout design gate or lesson walkthrough.

Independently read the original Git blob using:

```
git show 90defbad97ab0adfd070fcc0ec4de1608e87be43:specs/reviews/37-review-1-807e6ed8.md
```

The historical report reviews lesson candidate `1b54881e0f4731ceddcf383f288620d55781fe9a`, records **changes_required**, **72.5/100**, and open **37-R01–37-R04**. Its R04 identifies official Sudoku preset event 12, `candidates_at_entry` / `["9"]`, EN and shared untranslated variable labels in ZH, and 320/390 px. It reports the label ending at x=179.72 and the value beginning at x=126.33/149.66 despite no page overflow. These coordinates are historical reviewer measurements, not measurements performed here.

Exported four original PNG blobs from that same immutable commit to `/home/songyy/projects/leetcode-state-readability-review-state-4af63192` and opened each with `view_image`: `state-overlap-320.png`, `state-overlap-390.png`, `zh-state-overlap-320.png`, `undo-state-code.png`. The images visibly show the label/value intersection; the expanded operation/history image also preserves the undo context. Screenshot visual inspection supports the source report's description but cannot independently establish its DOM measurements or replay actions. Cropped board/navigation at viewport edges is not treated as additional DOM clipping evidence. Event/input provenance comes from the archived report, not an inference from screenshot pixels alone.

**No new browser reproduction was performed.** None is necessary for this documentation-only consistency decision. No server, runtime test suite, metadata fixture, screenshot generator, or current evolved lesson content was used as substitute evidence. The historical report itself distinguishes CSS zoom=2 from unverified native browser-menu zoom; this review preserves that limit.

## Assessment

- **Bounded intermediate-state coverage:** explainer lines 244 onward and gates lines 133 onward explicitly cover dense intermediate states, long identifiers, shared untranslated labels, both locales, and 320/390 px. Relevant populated states are required; initial/final views and page `scrollWidth` alone cannot establish compliance. The preceding unchanged #51 paragraph requires populated diagrams/state-panel reflow in both languages at narrow widths and **200% zoom**. Read together, the addition extends that inspection to adjacent state text; it does not replace or waive zoom coverage. The contract avoids mandating exhaustive per-frame/per-pixel checks or a new framework.
- **Actionable evidence:** the gates require exact candidate, input/preset, event/actions, locale, width, a relevant screenshot **and** rendered label/value/text geometry. Container-box intersection alone does not prove glyph collision. Viewport, scroll-position, and capture artifacts must be separated from reproducible visible defects, with settled-view/ordinary-operation rechecks. This is enough to require evidence attached to an identifiable state rather than a generic mobile pass.
- **Accessible content remains the goal:** deliberate internal scrolling is explicitly permitted with retained label/value association and keyboard access. There is no blanket component no-overflow rule. Existing mobile access and skill requirements continue to require touch usability and access to full essential values; keyboard support alone cannot excuse inaccessible mobile content. No essential ellipsis, fixed-height clipping, unreadable shrink-to-fit text, or hidden causal label becomes acceptable through this exception. Actual keyboard/touch/full-value behavior remains a future repaired-candidate verification duty, not a runtime pass claimed here.
- **Causal interpretation stays intact:** the unchanged interaction/teaching contracts keep visible before/after distinctions, named variables tied to input/state/code, intermediate legal transitions, and equivalent reasoning across languages. Readability is added to those duties rather than substituted for them.
- **Closure and scoring are preserved:** a repair needs a new frozen candidate and a separate fresh review of that actual candidate. Author status is only fixed-awaiting-review; independent closure appends to original evidence. Test counts and scores cannot clear an open required defect. The six dimensions, weights **15/20/20/20/15/10**, **85/100** total threshold, **3/4** dimension minimum, and zero-open requirement are byte-identical in the rubric block. Prior reports, lesson scores, and acceptance history are not changed by this candidate or decision.
- **Author evidence:** checked the implementation note against the immutable report and diff rather than treating its self-check as independent validation. The historical coordinates, input/event, locales, image names, and no-page-overflow account match the source. The note clearly labels these as sourced observations and disclaims fresh reproduction, screenshot inspection, UI repair, and lesson acceptance. Its external `events.jsonl` session attribution was not independently authenticated; no independent-runtime conclusion relies on it. Its documentation claims about scope, links, and unchanged rubric were checked here.
- **Scope:** the exact diff contains 72 additions and no deletions across only the two specifications and implementation note. P0/highest-return work is the existing-finding clarification; P1/P2 and implementation/runtime work are expressly outside this candidate. No new platform, historical lesson rereview campaign, production implementation change, registration, publication, or deployment is authorized or performed.

No actionable documentation defect remains open.

## Commands, integrity, and limits

Commands/checks performed in the isolated worktree:

- `git status --short`, `git rev-parse HEAD`, and `git show -s --format='%H %P' <candidate>`: initially clean, exact candidate and sole parent.
- `git diff <parent> <candidate> --stat`, full three-path diff, and `git diff --check <parent> <candidate>`: exact intended additive scope; whitespace check passed.
- `git ls-tree -r <source-commit> specs/reviews/37-evidence/37-review-1-807e6ed8/` and `git show <source-commit>:<path>`: immutable report/evidence access, without checking out or editing the source revision.
- `python3 -B` read-only checks: exact changed-path set; byte-identical six-dimension/canonical-interpretation block; no lesson, WORKFLOW, or UI-policy diff; all 15 relative Markdown file targets in the three changed documents exist; SHA-256 and Git blob identities below match their source revisions. Link existence does not establish external delivery.

One initial integrity-check attempt incorrectly assumed the original report was present in the candidate tree and stopped with Git exit 128. The original report/evidence are archive objects in the specified source commit, absent from this candidate tree. The corrected check verifies those immutable objects and exported hashes directly; no claim is made that they exist in the candidate checkout. Temporary `hashes.json`, `checks.json`, and exported images remain outside the repository in the permitted review-state directory.

Final integrity check verifies every tracked working file against the candidate index/tree, unchanged HEAD, and only this new report as repository output. No own commit, push, central/active-lane state change, or deployment was made. No bytecode was generated. Acceptance here leaves original 37 findings and scores unchanged and still requires independent closure on a frozen repaired lesson candidate.

## Exact source and evidence identities

Git object IDs below identify original blobs; SHA-256 identifies their raw bytes. The source report and first four images come from `90defbad97ab0adfd070fcc0ec4de1608e87be43`; specification/implementation blobs come from the reviewed candidate.

| Path | Git blob | SHA-256 |
| --- | --- | --- |
| `specs/reviews/37-review-1-807e6ed8.md` | `8e3440b4c271df08f439222f70cc778e3cc4953d` | `1c72ff67fa80341721cc00ca4a3d04a438f97167fdbb58fca2c83eb6b6b0b273` |
| `specs/reviews/37-evidence/37-review-1-807e6ed8/state-overlap-320.png` | `b4c3f3de203096381e0bc0750c4bbbd663b64e7f` | `e25974abdb7b9a9410acc26f7b9f568a431ba055f2cbad26306669137df60ff3` |
| `specs/reviews/37-evidence/37-review-1-807e6ed8/state-overlap-390.png` | `9411df347919785702347ba55c3c10ba94f0a8b9` | `d38a706fce548d5ed1ac19c81d1927e08c811173e2a1c2d238260e000afd30b9` |
| `specs/reviews/37-evidence/37-review-1-807e6ed8/zh-state-overlap-320.png` | `03c2b7435222418348258f7aa52a373e2c1025a6` | `d8d3fca1d89bc8a75a85cb7271a30a6507cd5940b595b0ca1345c8a2d7c54158` |
| `specs/reviews/37-evidence/37-review-1-807e6ed8/undo-state-code.png` | `e4c22b6ef77cbcb3d5cad2a09192f04c05df8241` | `cab5ba0a6f7dc9d31e002111da23ab7355be17b360ca2fac9394e4734b0710ed` |
| `specs/leetcode-explainers.md` | `d2d277ba1bbdc439259ed08727e1c578e6d22154` | `160436a16ee4d99c2aeba18a13544536d74805b98999d88f96067341dc7acde9` |
| `specs/leetcode-review-gates.md` | `db50b2e533b4bed620bfd6405581247b56c77848` | `2dd5fdb507c9b8a4cbc83efb5d90776ac655bc9d94f6651c5a58011263ca3659` |
| `specs/reviews/leetcode-state-readability-spec-implementation.md` | `1b4d36998b6f61d21787f83c77aa7b0b6c48cae9` | `18895d1b674553cc630334a5e0b42f9fb1cc18be79aa63630673f5c5336ee950` |

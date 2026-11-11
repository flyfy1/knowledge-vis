# #591 Tag Validator — author brief

Reuse verdict: extend the approved collection lesson pattern, per specs/reviews/leetcode-all-hard-design-review.md dispatcher adjudication. Website-design skill read; existing product/design gate is approved, this is not a new layout or independent lesson acceptance. Category leetcode; stage university. Reader knows loops and Python lists. Smallest outcome: hand-validate nesting and CDATA, predict a fresh failure, map the scan to a faithful submission.

Official verification: 2026-10-25, https://leetcode.com/problems/tag-validator/ and public GraphQL. Raw dated statement, all three examples and complete observed codeSnippets saved in provenance/official.json. Python3 explicitly supplies `class Solution: def isValid(self, code: str) -> bool`. Select Python. n is 1..500; permitted alphabet includes English letters/digits and <>/![]. and spaces. Names are ASCII A..Z, length 1..9. Entire string requires one closed root. At `<` parse through next `>`; CDATA only inside a root and ends at FIRST `]]>`. Empty content is valid, empty input is outside constraints (defensively false). No XML libraries: XML syntax differs.

Sequence (five steps, grammar/state rather than a manufactured optimization story):

|Step|Already known|One question|Input → desired output|Action → visible observation|Conditions|
|---|---|---|---|---|---|
|0|Strings|Why is `<A><B>x</B></A>` valid?|String → Boolean|Read five hand operations → pending names A; A,B; A,B; A; empty|Valid names, one root|
|1|Opening/closing|Why are counts insufficient?|Crossed close → false|Compare count rule and ordered pending names → B must close first|Outside CDATA; ASCII grammar|
|2|Ordered names|What must be remembered at each cursor?|Preset → exact scan snapshots|Next/back/range/reset/end; change preset restarts → token, consumed prefix, stack before/after, full history|Teaching simulation; no branch omission; token spans zero-based [start,end)|
|3|Invariant|Does a fresh root remain valid after first CDATA close?|Fresh string → select true/false/reason|Predict, reveal, change answer → explanation hidden until reveal and invalidated on change|Independent of trace; locale preserves answer and reveal|
|4|Invariant and trace|How does this become the submission?|Canonical source → executable Python|Open/copy/download → identical source; fallback selectable|Local browser model is simulation; Python executed only offline tests|

Terms, locally repeated where needed: tag/start/end/name/content (0); stack = ordered pending opening names, top = last name (1/2); recursive parser = a function parsing one whole tag and its children (1); cursor i = next unconsumed zero-based character, [a,b) = a through b-1, CDATA = opaque span ending at first terminator (2); invariant = statement preserved by each legal action (2/3); n = input length, d = maximum nested depth (4).

Derivation: counts lose order; last opened must close first; a list saves only that ordered path. Recursive descent is a clear O(n)-time/O(d)-space baseline, iterative explicit stack has same asymptotic costs and avoids interpreter recursion depth. Token searches consume disjoint spans; fixed CDATA prefix length and tag length at most 9 keep operations linear. Invalid long names allocate up to n temporary characters before rejection, hence honest O(n) total auxiliary worst case (O(d) stack on valid input). Trace stores copied snapshots/history, not submission space.

Token contract: exact shared `../style.css` palette --bg #0d1117, --panel #161b22, --panel2 #1c2330, --line #2b3547, --text #e8edf4, --muted #9aa7b8, --accent #6ee7ff, --accent2 #ffb454, --good #7ee2a8, --bad #ff7a93. Shared system font/typography/spacing/radii; local overrides only layout, 48px controls, full-opacity disabled, muted field borders, 3px accent2 focus. No new colors, shadows, fonts or motion.

P0/highest-return slice: readable stack transitions plus retained token ledger, causal rules, bilingual state parity, original Python, independent oracle, browser/source verification. P1: preset boundaries and source fallback. P2/deferred: custom editor, autoplay, XML tree, cross-page concept registry writes (outside ownership); no current need for framework/backend. Related existing anchors checked locally. Empty/loading/reconnect states inapplicable: synchronous bundled presets; initial, middle, accepted, rejection, rewind, quiz unanswered/selected/revealed/changed, copy success/fallback covered in both languages. Risks: simulation can diverge from source (cross-tested); no actual novice or independent-review claims. Tests accept LESSON_EVIDENCE_DIR. All output limited to this lesson; no registration or publication.

## Revision 2026-11-11

Review (review-range-2, B=1): the "slow" recursive baseline is already O(n), so nothing visibly failed; the stack was defined, not discovered; the real difficulty (rules that depend on position) was only a list.
Changes: step 02 now opens with a flat-checklist lab (delete CDATA, then ① same name at both ends, ② legal names, ③ equal open/close counts) on four inputs; the checklist passes <A><B><C></B></C></A>, <A></A><A></A> and <![CDATA[x]]><A></A>, all invalid. Two predict-then-open questions follow ("when </B> arrives, which open tag must close first?" → C; "what is open at the second <A>?" → nothing) before the stack is named. The recursive baseline is reframed as the natural way to carry the context (O(n); speed is not the issue). The proof paragraph is split into three numbered points tied to presets. core.js gains `checklistInputs`/`checklist` (teaching only). Leading spaces in related labels and review-status footer/verify wording removed.
Changed by Claude Code (claude-opus-5-5), 2026-11-11, in the working tree (uncommitted).
Verified: check.py (Python vs recursive oracle, core frames), browser.cjs (now also checks every checklist input), accessibility.cjs pass; zh/en at 1280/390/320, no overflow or console errors.

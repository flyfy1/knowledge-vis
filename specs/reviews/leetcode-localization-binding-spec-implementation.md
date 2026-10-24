# Localization binding specification implementation

Documentation base / initial HEAD: `b7046afea68e366f22723358dc4504711518e629`.
Implementer: gpt-6.1-sol, fresh session
`01a14f58-b2b9-7bf2-92be-2336bd2c5a8c` (matching `CODEX_SESSION_ID` and
`CODEX_THREAD_ID`). Independent review of this documentation candidate: **pending**.

## Immutable evidence and boundaries

Read via `git show`, without checking out or executing lesson files:

- `3c650ef9acced5f69e1805eec32c9fcaa6bf9278:leetcode/214/SELF-CHECK.md`,
  lines 88–94: author inspection reported a duplicate `fallback` copy key that
  replaced algorithm mismatch explanations with the manual-copy label. The author
  reported correction before candidate freeze; diagnostic captures were superseded.
  This is author-reported prefreeze evidence, not an independently observed original
  failure. No retained executable original red evidence or new reproduction is claimed.
- `3c650ef9acced5f69e1805eec32c9fcaa6bf9278:leetcode/214/tests/core.cjs`,
  line 4: a source-text duplicate translation-key assertion exists. It illustrates
  detection for this representation, not a mandated regex or proof of correct meaning.
- `3c650ef9acced5f69e1805eec32c9fcaa6bf9278:leetcode/214/copy.js`,
  lines 24 and 36: final `fallback` explains mismatch, candidate reduction and pending
  pi; `fallbackStatus` and `manualLabel` separately describe manual copying in EN/zh.
  `leetcode/214/tests/browser.cjs` at the same commit, lines 52–62 and 78–87,
  covers denied clipboard/manual source selection and bilingual fallback states.
  These are inspected final sources/check definitions, not tests run in this session.
- `b7046afea68e366f22723358dc4504711518e629:specs/reviews/214-review-1-3e29c6e1.md`,
  especially “Cold walkthrough”, “Independent execution and inspected tests”, and
  “Browser, bilingual, visual and accessibility observations”: the independent
  reviewer checked candidate `3c650ef9acced5f69e1805eec32c9fcaa6bf9278`, including
  final algorithm fallback/pending-state meaning in both locales and manual-copy
  behavior/source selection. The report was introduced in
  `7de4d993f19f1287672e7bcb7a3007d0d78ffcfc`; it is not inside the lesson candidate.
  This supports independently verified final behavior within that report's scope,
  not independent reproduction of the author's prefreeze bug. Its existing lesson
  acceptance is historical; this change performs no new review or acceptance.

## Rationale and scope

A valid lookup can still display the wrong explanation if a key is overwritten or
bound to unrelated copy. Add namespace-local uniqueness detection and representative
visible semantic-binding verification in both locales; checking presence alone
cannot prove that the learner sees the intended algorithm meaning.

Read `WORKFLOW.md`, `/home/songyy/Documents/agent-skills/website-design/SKILL.md`
and `/home/songyy/Documents/agent-skills/diagnosing-bugs/SKILL.md`.
Website-design verdict: reuse the existing lesson contract for learners reconstructing
an algorithm. No new feature/layout needs design work. P0 / highest-return slice:
this concise prevention requirement, done when both specifications consistently
require detection plus meaning checks. P1/P2: none in scope. Deferred: UI/framework
work and runtime rechecks require a separately authorized concrete lesson revision;
there is no such implementation need here.

Diagnosing-bugs phases 1–6 (new red loop, reproduction/minimization, hypotheses,
instrumentation, runtime fix/regression and fix closure) are not needed: this is
bounded evidence-to-spec documentation using immutable historical evidence, not
active bug diagnosis or a runtime fix. No new causal hypothesis is being tested,
and the superseded original diagnostics are not reconstructed. Documentation checks
are the appropriate feedback here; no claim that this session fixed a bug follows.

Only [the explainer](../leetcode-explainers.md),
[review gates](../leetcode-review-gates.md), and this report change. Existing
frozen-candidate and required-finding closure discipline is preserved. No global
uniqueness across separate namespaces, exhaustive test matrix, required framework
or regex, rubric changes, runtime/prompt edits, central/lane/state/ledger changes,
retroactive acceptance, deployment, push, or apply is part of this change.

## Documentation self-check and next action

Checks: `git diff --check`; exact three-path change scope; additive-only specification
diff inspection; unchanged six-dimension rubric, weights and acceptance thresholds
against the immutable base; relative Markdown link and anchor targets. All passed.
The initial HEAD matched the required base and the initial worktree was clean.
No runtime suites, browser reproduction, or new screenshot inspection were run.

These are implementer documentation self-checks only. They establish consistency
and bounded scope, not runtime correctness, learner comprehension, independent
review, lesson recertification or release readiness. Next action: a separate fresh
independent review of this documentation candidate; review remains pending.

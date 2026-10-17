# Explainer specifications

Use these repository-local specifications when creating or revising lessons.
They record reusable authoring decisions and verified lessons from implementation.

- [LeetCode explainers](leetcode-explainers.md): the teaching process, Python
  policy, collection registration, and mathematical and browser acceptance checks.
- [Site UI and bilingual policy](../UI-I18N-SPEC.md): applies to every lesson.
- [Concept map](../CONCEPT-MAP.md): register concepts and link to exact steps.
- [Independent novice-review rubric](reviews/leetcode-2916-rubric.md): Astra's
  outcome-based acceptance criteria. [2916 iteration record](reviews/leetcode-2916-iterations.md)
  links the independent findings to implementation changes.

Each problem keeps its own `BRIEF.md` alongside its implementation. Generalize
reusable findings into these specifications; keep example-specific calculations
and review evidence in the problem folder. Do not put credentials or private
machine configuration here.
- [Hard-problem traces](leetcode-hard-traces.md): frame timing, visual semantics,
  node identity, DP dependencies, undo state, bounded traces, and the first-ten
  mechanism-specific regression cases.
- [First-ten review](reviews/leetcode-first-ten-review.md): two self-review
  iterations, actual findings and fixes, and verification evidence.

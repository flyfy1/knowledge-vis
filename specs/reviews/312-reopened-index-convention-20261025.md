# Reopened finding — #312 prediction index convention

Dispatcher source audit, 2026-10-25. This is not an independent acceptance review
or a new browser walkthrough. Preserve all historical reviews.

Affected lesson bytes: `leetcode/312/` as present at `82b1e52`, unchanged from the
previous accepted campaign candidate. Discovery followed optional DOC-OPT-01 in
[the independent documentation review](leetcode-rendered-state-contract-review-20261025.md).

## R312-INDEX-001 — Specify which index the prediction grades

Required correctness/teaching finding, open.

Current `copy.js` asks, in both languages: `nums=[2,1,2]`, interval `(0,4)`,
“if index 2 is last,” what is the product? Feedback says that index 2 has value 2
and grades `1×2×1=2` as correct. The interval and recurrence elsewhere use the
padded array. Directly padding this input gives `[1,2,1,2,1]`:

- padded index 2 has value 1, so its final-step product is `1×1×1=1`;
- original zero-based index 2 has value 2 and corresponds to padded index 3,
  whose final-step product is `1×2×1=2`.

The current prompt does not state the switch from padded interval coordinates to
original indices. A reader following the recurrence can select 1 and be marked
incorrect. This is a visible semantic contradiction even though the main DP
algorithm computes the correct total.

Fix the actual prediction contract: explicitly show the padded values and state
which candidate index is meant. Either convention is valid when the mapping is
explicit and prompt, options, grading, and explanation agree. Do not silently
switch conventions. Preserve the canonical submission and unrelated controls.

Add a focused regression with independently derived values. Check both locales,
all prediction options, reveal/change, language switching after answering, and
that the fresh exercise still tests the fixed-boundary invariant. Compare the
rendered text with the declared indexing convention, not merely the stored
correct option index. A successful algorithm-only test does not close this.

An implementation agent must fix a new candidate, followed by a fresh independent
review under the unchanged six-dimension rubric. Keep the lesson in scope but
exclude its current acceptance from publication eligibility until closure.

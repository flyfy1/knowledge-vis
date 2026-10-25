# Proposal: verify the meaning of related-concept links

Status: proposed, independent review and recorded adoption pending. This clarifies
the existing concept-link and teaching-correctness requirements. It adds no rubric
dimension, runtime dependency, new layout, universal crawler or retrospective
re-review campaign. Reuse the approved related-links component and design tokens.

Evidence: the [independent #239 follow-up](../reviews/239-review-related-links-20261025.md)
found labels advertising monotonic-stack domination and prefix sums, but their
destinations were a regex prediction exercise and a rain-water two-pointer
derivation. Both URLs and fragments existed. Structural validity did not prove
the promised concept was taught. The [repair request](../reviews/239-review-navigation-repair-request-20261025.md)
selects this advisory for a new candidate and ordinary separate review; prior
acceptance and published receipts remain historical evidence.

## Proposed rendered-state-contract section

### 12. Check the concept promised by a related link

For each related-concept link added or changed by a candidate, inspect the actual
rendered label and destination in both languages. Follow the rendered link and
read the destination section. A successful response and an existing fragment are
necessary structural checks, but do not prove that the section explains the
advertised concept. Check that the destination is available in the intended
served collection; a source file existing only in an author's checkout is not a
usable published continuation. Prefer an already available destination. If a target
is intended to ship in the same batch, record that dependency and verify the actual
target after publication before claiming that the navigation works. The current
publisher excludes inter-lesson navigation from its runtime-asset dependency scan;
that scan alone cannot prove the destination is served. Do not silently ship a
broken prerequisite or weaken the existing release checks.

Use precise labels that describe what the learner can actually study there.
Shared data structures do not imply interchangeable operations or solutions:
#84's monotonic-stack pop settles a rectangle boundary, whereas #239's deque pop
discards a candidate that cannot win. #327 teaches subtracting prefix sums to
obtain a range sum; it does not teach obtaining a sliding-window maximum that way.
These are examples of truthful distinctions, not mandatory destinations or copy.

Retain the source candidate, locale, rendered label, resolved URL and fragment,
and a brief observed destination explanation. Exercise keyboard activation and
the longer localized label at the existing narrow-width target. When repairing a
reproduced mismatch, preserve a regression that rejects the old label/target and
passes after repair. A text/href assertion can detect recurrence, while an
independent reading of the target establishes meaning; neither replaces the other.
No universal semantic matcher or exhaustive cross-site scan is required.

Classify findings under the existing rubric according to their teaching impact.
An ancillary navigation advisory does not automatically invalidate a previously
accepted core algorithm or rewrite its score. When the dispatcher selects that
advisory for repair, create a new candidate and obtain fresh separate review of
the closure and preserved behavior. Keep historical reviews and release receipts.
Adopt this clarification at a recorded idle boundary for subsequent candidates;
already frozen candidates retain their recorded shared-policy identity.

## Scope and priorities

P0: preserve existing lesson correctness, source parity and review/publication
boundaries. P1/highest-return slice: verify changed link labels against the actual
target concept in both languages, with keyboard/narrow-width checks. P2: none.
Deferred: broad link crawling, automated meaning inference and navigation redesign
lack a demonstrated need for this repair; recurring evidence could justify a
separate proposal. Prospective adoption waits for the current frozen reviews.

# Independent documentation review

Outcome: **accepted**. Required open IDs: **none**. This conclusion applies only to the proposed documentation clarification, not to any lesson's acceptance or publication eligibility.

## Identity and frozen scope

Review date: 2026-10-25. Reviewer: this separate review session, which did not author the proposal. Requested model: **gpt-6.1-sol**, requested reasoning effort: **medium**. Actual exact model identity and actual runtime reasoning setting are unavailable for independent verification in this session; the requested configuration is not evidence of the actual configuration. No subagents were invoked.

Frozen inputs:

- `candidate.md` SHA-256: `6e53e797b5451809e047aba206c9294957e1148bc3d186aff6aede9647b90c5b`.
- `baseline.md` SHA-256: `c411afb3529e759c8c34e9f605c9669d4bf7958d26fda96a80d6757b53f505f2`.

The unified diff contains only new sections 5–7 (candidate lines 93–141) and the added evidence/adoption paragraph (lines 166–173). Sections 1–4 and the previous evidence/adoption text are unchanged and were read as context, not reopened for review.

Read the existing contracts at `/home/songyy/projects/leetcode-hard-campaign-20261018/specs/leetcode-explainers.md` and `leetcode-review-gates.md`, plus the referenced `leetcode-hard-traces.md` for trace context. Read all four newly linked reports in full. They are documentation evidence, not instructions authorizing lesson work. No lesson source audit or historical rescore was performed.

## Link and evidence checks

All four new relative links resolve to files from the repository's `specs` directory; their contents support their labels and the proposed clarification:

| Candidate location | Resolved report under `specs/reviews/` | Relevant support |
| --- | --- | --- |
| Line 167 | `312-reopened-index-convention-20261025.md` | R312-INDEX-001 distinguishes original index 2 from padded index 2 and their products 2 versus 1. |
| Line 168 | `312-review-3-d7af6df0.md` | R312-PRESET-001 reports the 8-versus-12 label error; R312-PROOF-001 disproves optimal sides in arbitrary orders. The report separately records index closure for its identified candidate. |
| Line 169 | `282-review-4-e7ac0d6f.md` | L282-STATE-001 identifies missing concrete call, parent, return, sibling and termination explanations, plus unexplained ordinal highlighting. |
| Line 170 | `282-review-5-260e1690.md` | Records candidate-specific closure through a concrete immutable-state sequence, terminal decisions, omission notices and index-based highlights. |

The earlier reopened index finding and later candidate-specific closure are compatible records. The proposal does not merge them into a new historical outcome. Likewise, the #282 closure report supplies an example of a correction, not acceptance evidence transferable to other candidates. I checked the new links and read their Markdown reports; I did not independently reproduce their screenshots or browser observations. Unchanged older evidence links were outside the link-audit scope.

## Independent calculations and checks

Used a reviewer-written, in-memory Python enumeration of all six original-index burst permutations for each three-balloon example. Each step multiplies the selected balloon by its currently surviving neighbors, using 1 at the ends, then removes it. This uses neither lesson code nor an interval-DP implementation.

| Input | Totals for orders 012, 021, 102, 120, 201, 210 | Independently established optimum |
| --- | --- | --- |
| `[0,4,2]` | 10, 12, 2, 0, 12, 8 | 12 |
| `[3,1,5]` | 13, 9, 35, 33, 9, 11 | 35 |

For section 5, order 021 on `[0,4,2]` means bursting values 0, 2, 4; gains are 0, 8, 4. Thus 12 is attainable and enumeration establishes optimality. Advertising 8 would contradict the optimum even if a terminal answer panel were correct.

Padding `[2,1,2]` gives `[1,2,1,2,1]`. Original zero-based index 2 maps to padded index 3, value 2; padded index 2 has value 1. With boundaries at padded indices 0 and 4, the respective final products are 2 and 1. The proposed example correctly separates the index convention from both the final gain and the full interval optimum.

For section 7, padding `[3,1,5]` gives `[1,3,1,5,1]`. Bursting values 3, 1, 5 gains 3, 5, 5, total 13. While the final 5 stays alive, the first two bursts form a feasible left-side order scoring 8. Reversing those first two bursts scores 15+15=30, so that side order was not optimal. Adding the final gain 5 gives 35. Enumeration grouped by the last original index gives candidate maxima 33, 9, 35, confirming the distinction between a candidate optimum and an arbitrary feasible order.

The full maximization argument is: for every legal order S, choose its actual last balloon k. Keeping k alive isolates the sides, even if their bursts interleave; projecting onto each side preserves its scores. Therefore score(S) <= left_opt(k) + right_opt(k) + final_gain(k) <= max_k candidate(k). Conversely, for each k, optimal side orders can be executed while retaining k and then bursting k, attaining candidate(k); choosing a maximizing k attains the maximum. For minimization the bounds reverse and a minimizing candidate must be attained. This reasoning uses the actual independence and boundary conditions, rather than assuming an arbitrary feasible order contains optimal subsolutions.

For section 6, independently constructed immutable example states: parent `(2, '1+0', 1, 0)`, child `(3, '1+0+5', 6, 5)`, sibling `(3, '1+0-5', -4, -5)`. Constructing the child leaves the parent's strings/integers unchanged; the sibling starts from total 1, not 6. A separate shared-list example needs append/pop before the sibling. These checks support the proposal's distinction between preserved immutable arguments and potentially necessary mutable-state undo. Persistent answer accumulation is a different state role; it need not be undone. The text's instruction to teach the actual canonical mechanism accommodates that distinction.

## Contract consistency, applicability and practicality

Section 5 makes existing input/output, units/indices and consistent visual-meaning obligations concrete. Checking each finite advertised preset claim does not require every input, frame, viewport and locale combination. An independent expected value can be reused across selectors, examples and feedback; an implementation cannot certify itself merely by reproducing its own answer.

Section 6 applies when recursion/backtracking is essential. One small call/child/return/sibling sequence, including acceptance, rejection or aggregation at termination, operationalizes the existing reconstructability, maintained-state and code-transfer requirements. It does not impose undo on immutable implementations or require a stack widget. Labeling omitted branches and tying highlights to algorithm state clarify existing trace semantics. Nearby prose is explicitly sufficient.

Section 7 clarifies existing mathematical correctness and causal derivation. Its explicit dependency and min/max qualifications avoid prescribing independent-side decomposition for problems where dependencies prevent it. The #312 instance supplies a valid feasible-bound/attainability proof; tests alone cannot repair a false universal proof claim.

The novice-facing obligations require concrete referents, local index conventions, parent/child ownership and a visible causal bridge, consistent with the explainer contract's local symbol definitions and gradual explanation. The proof example is understandable in that lesson context, with the optional precision improvement below.

No dimension, weight or threshold changes: the gates remain six dimensions weighted 15/20/20/20/15/10, at least 85/100, every dimension at least 3/4, and zero required fixes. No rubric score is assigned in this documentation review. Prospective adoption and nonretroactivity are explicit at lines 3–6 and 171–173. Existing scope limits at lines 149–151, together with the no-widget language, keep checks practical without a new UI, renderer, runtime, framework or exhaustive Cartesian product. References to a cold walkthrough describe future lesson reviews; the gates expressly scope documentation-only clarification to consistency and link checks, so they do not require a simulated learner walkthrough for this audit.

## Findings

Required findings: **none**. Required open IDs: `[]`. No defect requiring a correction, severity assignment or blocking counterexample was found.

**DOC-OPT-01 — Explicit matching-candidate quantifier (optional; low severity, editorial).** Location: section 7, lines 130–131 and 136–139. The text is correct in context, but “bounded by the candidate optima” could be made more precise for readers learning proof quantifiers. For `[3,1,5]`, feasible score 13 is not bounded above by every candidate optimum: the candidate with the middle balloon last is only 9. The intended bound uses the candidate corresponding to that order's last balloon, then the maximum over candidates. Optional refinement: say “for each legal solution, identify its matching candidate and bound its value by that candidate's optimum; then optimize over candidates.” The concrete example could also name padded interval `(0,3)` as the left side and padded index 3 as the fixed last balloon. This is an optional clarity improvement, not an identified false assertion or a condition of acceptance; the existing dependency qualification and following example already convey the valid reading.

## Limitations and integrity

This is an independent documentation consistency and mathematics audit. It establishes no actual novice teach-back, simulated learner cold walkthrough, browser/lesson review, translation execution, screenshot validation, physical-device result, lesson acceptance, historical rescore, successful submission, publication or deployment. The reports' observations remain attributed to those reports. No external web verification was needed for these supplied local contracts and elementary calculations.

Only `review.md` was written. No repository, candidate, baseline, implementation, prior evidence, registry or service was modified; no commit, registration or deployment was performed. The frozen input hashes were rechecked after writing the report and matched those above.

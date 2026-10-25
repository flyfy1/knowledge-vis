# Independent editorial refinement review

Outcome: **accepted**. Required open IDs: `[]`.

This result concerns documentation only. Adoption into the active campaign happens separately at a safe boundary after in-flight lane imports. It grants no lesson acceptance or publication eligibility.

## Scope, identity and frozen inputs

Review date: 2026-10-25. This review session did not author the revision. Requested model: gpt-6.1-sol; requested reasoning: medium. Actual exact model identity and runtime reasoning setting are unavailable for independent verification; the requested configuration is not proof of the actual configuration. No subagents were used.

| Input | SHA-256 |
| --- | --- |
| `baseline.md` | `6e53e797b5451809e047aba206c9294957e1148bc3d186aff6aede9647b90c5b` |
| `candidate.md` | `030ace4d159421e87948af998f42db698d9823dbc4a12aa0c6747e41143a2f31` |
| `prior-review.md` | `abacfd915f6ad602423d3193ee2519df2b964e1d8d7993252d0097cd64e97eaa` |

Read the supplied candidate and prior review, compared baseline and candidate, and independently checked the changed quantifier and the section 7 mathematics. The prior review records separate acceptance of the present baseline: its candidate hash equals the baseline hash above. Its conclusions are historical context, not a substitute for the calculations here.

## Actual diff and unchanged text

The unified diff has one hunk in section 7. Baseline lines 130–131 say:

> For an optimization recurrence, explain why every legal solution is bounded by
> the candidate optima and why a legal construction attains the chosen optimum.

Candidate lines 130–132 say:

> For an optimization recurrence, identify each legal solution's matching candidate
> and bound its value by that candidate's optimum. Then optimize over candidates
> and explain why a legal construction attains the selected bound.

A Python 3 byte-level assertion verified that the old passage occurs exactly once and that replacing only those bytes produces the entire candidate exactly. All other candidate text, whitespace and newline bytes are unchanged. Baseline has 173 lines; candidate has 174. In particular, the concrete example, dependency qualification, evidence links, scoring language and prospective adoption policy are unchanged.

## Independent bounds check

Let S be any legal solution, k(S) its matching candidate, and v(S) its value. Let C_k denote the candidate optimum with the actual feasibility and dependency constraints respected.

- **Maximization:** establish v(S) <= C_k(S) <= max_k C_k for every S. Thus OPT <= max_k C_k. A legal construction attaining a maximizing C_k proves OPT >= max_k C_k, giving equality.
- **Minimization:** establish v(S) >= C_k(S) >= min_k C_k for every S. Thus OPT >= min_k C_k. A legal construction attaining a minimizing C_k proves OPT <= min_k C_k, giving equality.

The candidate now explicitly states the matching-candidate step before optimization across candidates. It does not require an arbitrary legal solution to contain optimal subsolutions. The retained direction/dependency qualification is necessary: component optima can be combined only when that construction is legal under the real dependencies. The retained attainment requirement supplies the other inequality; a bound alone does not prove a recurrence. As written, the paragraph requires attainment rather than assuming it for problems where an optimum is unavailable.

## Independent #312 calculation

For input `[3,1,5]`, an in-memory Python 3 calculation enumerated all six original-index permutations. At each burst it multiplied the selected value by its surviving neighbors (boundary value 1), then removed it. This calculation used no lesson code or interval-DP implementation.

| Original-index order | Burst values | Successive gains | Total |
| --- | --- | --- | --- |
| 0,1,2 | 3,1,5 | 3,5,5 | 13 |
| 0,2,1 | 3,5,1 | 3,5,1 | 9 |
| 1,0,2 | 1,3,5 | 15,15,5 | 35 |
| 1,2,0 | 1,5,3 | 15,15,3 | 33 |
| 2,0,1 | 5,3,1 | 5,3,1 | 9 |
| 2,1,0 | 5,1,3 | 5,3,3 | 11 |

Padding gives `[1,3,1,5,1]`. In the example order, padded index 3 (value 5) is last. The left suborder within padded interval `(0,3)` bursts 3 then 1 for 3+5=8. With that same 5 retained, reversing the left order earns 15+15=30. The final burst earns 5, so the matching candidate optimum is 30+0+5=35, while the feasible order earns 8+0+5=13. The text's concrete claims are correct.

Grouped by the last original index 0, 1, 2, the maximizing candidate totals are 33, 9, 35. In particular, 13 is not bounded above by every candidate optimum, since 13 > 9. It is bounded above by its matching candidate optimum, 35, then by the maximum, 35. This directly verifies the quantifier issue identified in DOC-OPT-01.

For an additional direction check using the same feasible orders, the minimizing candidate totals are 11, 9, 13. Each order is bounded below by its own group's minimum, and those minima are all at least the global minimum 9. Both orders scoring 9 attain that bound. This is a check of minimization logic, not a change to #312's maximizing objective.

For the interval recurrence itself, fixing the last balloon keeps it alive as a boundary. Projecting an arbitrary order onto either side preserves that side's scores even when the sides interleave. Each projected order is feasible and bounded above by its side optimum. Conversely, executing optimal side orders while retaining the fixed last balloon, then bursting it, legally attains the candidate sum. This justifies both bounds without presuming optimal sides in arbitrary orders.

## Findings and disposition

**DOC-OPT-01: addressed.** The revision makes the requested matching-candidate quantifier explicit and puts optimization across candidates after the per-solution bound. The prior review's additional suggestion to name the padded interval in the example was optional; the unchanged example remains mathematically correct, as calculated above.

Required findings: **none**. Required open IDs: `[]`. No new mathematical or policy defect was identified in the refinement. It changes neither scoring dimensions, weights, thresholds, historical outcomes nor adoption authority. The baseline's separate acceptance is preserved; this is acceptance of the editorial refinement only.

## Limitations and integrity

This was a focused documentation-diff and mathematics review, not a full fresh lesson review or browser review. No cold walkthrough, rendered trace, locale execution, screenshot, canonical implementation, external contract or evidence-link audit was performed. No external web verification was needed for the supplied text and elementary calculations. Unchanged sections were read as context and confirmed byte-identical, not independently recertified. No active campaign adoption was performed.

Only `review.md` was written. No input, repository implementation, registry or service was edited; no subagent, commit or deployment was used. The three frozen input hashes were rechecked after report creation and matched the values above.

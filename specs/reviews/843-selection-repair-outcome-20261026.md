# #843 selection repair: round 3 accepted locally

**Accepted locally: 97.5/100, no required open findings.** Fresh independent review
closed `843-R2-SELECT01` and rechecked `843-BUDGET-R1` against the new frozen
candidate. This archive is separate from the [round-2 changes-required outcome](843-budget-repair-outcome-20261026.md)
and does not claim public delivery.

## Exact identity and history

- Candidate: `1997af1228f21cd85a3c7506928dc2587a0a7a9f`.
- Reviewer run: `843-review-455d52b6e77c`; session
  `01a17502-d81d-7aa2-a303-d3c27cab2908`.
- Review commit: `c7b2166e5186c3931365495685515646eacfa0b1`.
- Registration: `c3a389dcbaad4d2a2a5eb330772b9366dd3c426e`.
- Candidate/review/registered lesson tree, identical:
  `9854bf53c38cc6a38089ceb20fea434ebf10c51a`.
- Canonical SHA256, unchanged from round2:
  `51f9e29c91ca3ffe6238f13dfa0f0b632081274be4747ac67cfbf627b986dc05`.

The [original report](843-selection-repair-outcome-20261026/843-review-3-0fd20aa5.md),
[final result](843-selection-repair-outcome-20261026/review-final.json), run record,
compressed events, preceding fix record and original handoff receipt are retained.
Final/run/state results match. Native reviewer PID1713363 was observed during this
session; the completed run and terminal event establish completion. The historical
round1 accepted97.5 and round2 changes_required97.5 records exactly match the prior
archive, rather than being replaced by the new result.

At the [snapshot](843-selection-repair-outcome-20261026/snapshot.json),
2026-10-25T21:47:14 UTC, #843 was accepted_local/done with three review rounds and
the registration above. The ordinary runner had advanced to
`850-review-bd28f3e22dca`. No running agent or STOP was changed by this archival task.
The handoff receipt describes its earlier `completed-fresh843fix-running` stage,
not this subsequent acceptance.

## Selection finding closure

The small runtime change adds a wrapping complete `#presetSelection` readout
immediately below the native select, connects it with `aria-describedby`, and
updates it from the current localized scenario on render. The reviewer explicitly
accepts this alternative requested by the previous finding. Native English option
text still clips at320px; the adjacent full readout now preserves word count,
budget, secret where applicable and control purpose.

The [selection results](843-selection-repair-outcome-20261026/review-evidence/selection-results.json)
contain36 operations: scenarios6/8 × widths320/390/1280 × zoom1/2 × zh→en→zh.
These are24 distinct locale/width/zoom/scenario combinations, with Chinese revisited
in each roundtrip. The reviewer checked association, complete text, geometry and
retained one-round state. Archive checks verified the recorded complete expected
labels, wrapping geometry and matrix coverage. The
[320px normal capture](843-selection-repair-outcome-20261026/review-evidence/en-320-zoom1-preset8-4.png)
and [zoom2 capture](843-selection-repair-outcome-20261026/review-evidence/en-320-zoom2-preset8-10.png)
were additionally viewed here: both expose the complete budget10 control wording.
This is inspection of existing evidence, not a new browser run.

**843-R2-SELECT01 is closed for this candidate.** Historical non-required
`843-R1-A01` remains open: extreme narrow CSS zoom fragments some English readout
words. The report does not claim that advisory fixed or that physical devices and
browser-menu zoom were tested.

## Budget behavior retained

Canonical Python, mirror, core and localization bytes are unchanged from the
reviewed budget repair. The callable remains `findSecretWord(self, words, master)`;
there is no secret/budget parameter or private budget getter. A real reply6 is
required. The termination argument G≤n remains separate from a universal case-budget
guarantee, which the lesson and review explicitly do not claim.

Fresh reviewer execution of the exact source retained all-secret results:

| Family | Budget | Actual successes | Maximum calls |
| --- | ---: | ---: | ---: |
| 20 words | 10 | 20/20 | 10 |
| 22 words | 11 | 22/22 | 11 |
| 24 words | 30 | 24/24 | 12 |

[Recorded traces](843-selection-repair-outcome-20261026/review-evidence/green.json)
match the canonical hash and are marked non-diagnostic. Archive checks recomputed
positional replies, original-list membership, nonrepetition, full-history filtering,
budget counts and actual final secret/reply6 from every row. The bilingual browser
regression still distinguishes known-but-unguessed at10, found at11 and exhausted
unsuccessful budget10, with rewind and locale preservation. Source/mirror/render/
export/download/native-copy parity passed in the fresh review. **843-BUDGET-R1
remains closed**, without extending closure to universal hidden-test success.

## Coverage and evidence boundary

The reviewer saved a fresh cold walk before source inspection, then executed an
independently predicted three-word input and a raw-list browser oracle checking
56 calls across all nine presets. Retained JSON covers that independent evidence,
1,211 canonical cases,3,068 core frames,87 localization pairs, selection/budget/
focused browser checks and calibrated contrast. Literal “author self-check” labels
identify reused inspected harnesses; they do not represent another reviewer.

Seven focused screenshots are copied. The snapshot inventories hashes/sizes for
all original review evidence at the immutable review commit, marking copied files.
Initial unsettled table captures are acknowledged in the report; settled follow-ups
support table inspection. No human-comprehension, physical-device, online-submission,
universal-budget or publication claim is made.

[Validation and hashes](843-selection-repair-outcome-20261026/validation.json)
bind37 captured files plus the validation result. This task performed identity,
recorded-evidence arithmetic/geometry and source-parity checks only. It did not
rerun browsers or clipboard operations, mutate Pi state, restart/stop agents,
commit, push or publish.

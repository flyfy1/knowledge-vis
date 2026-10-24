# LeetCode 233 review-1 repair — author self-check

Date: 2026-10-24. Scope: `leetcode/233/` only. This is author evidence for a
separate re-review; it does not independently close the finding. The review
report, rubric, registry, shared assets, services and other lessons were not
edited.

## Finding mapping

| Stable ID | Repair and causal check | Evidence / status |
| --- | --- | --- |
| **233-I1** | Step 4 now keeps answer selection (`transfer`) separate from the explicit reveal state (`transferRevealed`). Selecting any answer clears feedback and contribution rows; `#transferReveal` alone sets the reveal state and renders the localized result/table. A changed answer clears the prior reveal. | `node leetcode/233/tests/evidence/transfer-reveal-regression.cjs` passed in English and Chinese at 390px; fixed awaiting independent re-review. |

## Reproducible checks

- `python3 leetcode/233/tests/test_solution.py`: oracle `n=0..999` and boundary calls passed.
- `python3 leetcode/233/tests/test_parity.py`: `solution.py` and embedded `python-code.js` parity passed.
- `NODE_PATH=/home/songyy/projects/integ-games/node_modules node leetcode/233/tests/evidence/transfer-reveal-regression.cjs`: passed for EN/ZH; feedback and rows stayed hidden until Reveal, then appeared, and changing the answer cleared them.
- `OUTPUT_DIR=leetcode/233/tests NODE_PATH=/home/songyy/projects/integ-games/node_modules node leetcode/233/tests/browser.cjs`: passed at 320, 390 and 1280px in EN/ZH, including the repaired sequence and source visibility.
- `python3 -B scripts/register_leetcode_lesson.py 233 --validate-only`: exit 0 with no validation errors.

The checks exercise the running preview at `http://127.0.0.1:18795/leetcode/233/`.
No LeetCode submission, independent acceptance, novice learning result, real-device
result, deployment or commit is claimed. Required next action: a separate reviewer
re-run the cold Step 4 sequence and close **233-I1** against the frozen rubric.

## Review-2 reset repair (2026-10-24)

The required finding **233-II1** reproduced with the reported sequence: enter `11` in
Step 2, click Reset experiments, and observe the stale visible input while the
formula had returned to internal `n=13`. The reset handler now synchronizes the
visible control (`#nInput.value = '13'`) in the same state transition that restores
the preset algorithm state. The regression seam checks the input value and the
`higher=1, current=3, lower=0` readout after reset in both English and Chinese.

Evidence and status: `NODE_PATH=/home/songyy/projects/integ-games/node_modules node
leetcode/233/tests/evidence/transfer-reveal-regression.cjs` passed for EN/ZH at
320, 390 and 1280px; **233-II1 fixed awaiting independent re-review**. This is author self-check
evidence and does not independently close the finding.

The required metadata preflight was run from this repository root:
`python3 -B scripts/register_leetcode_lesson.py 233 --validate-only` (exit 0,
no validation output).

Diagnostic loop: the pre-fix regression command failed deterministically with
`'11' !== '13'` at the reset input assertion. The competing render-staleness and
duplicate-event hypotheses were ruled out by the same post-fix checks across all
supported widths and both locale paths; the causal omission was the reset handler's
missing DOM-value synchronization.

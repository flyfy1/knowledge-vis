# Author self-check — #420

Candidate: see candidate.json for exact file hashes. Author run only; independent
teaching review remains pending. No commit, registration, deployment, platform
submission, or learner-results claim is made.

Official evidence: provenance/official.json retains the dated public GraphQL
statement, all observed code selector snippets, examples and Python3 interface.
The runtime uses no official capture as an asset.

## Causal walkthrough checked by the author

- Step 0: aaaB1 needs length +1. Appending x leaves aaa; inserting 0 inside gives
  aa0aB1, a one-edit valid witness meeting the lower bound.
- Step 1: disjoint triples require one change each; every third character gives
  a construction meeting floor(L/3). Range 3–8 shows the discontinuities. The
  short-input proof handles length five separately, including five equal symbols.
  The expanded Python baseline is executed independently of the greedy formula.
- Step 2: default length24 has runs 3,4,5 and twelve singletons. Initial R=3,
  compulsory D=4. Spend 1 on 3→2 (R=2), then 2 on 4→2 (R=1). The last deletion
  cannot buy a three-deletion saving; ledger lengths stay unchanged and the text
  explicitly calls this budget-only accounting. Result 4+max(0,1)=5. All snapshots
  preserve history and undo restores the earlier demand and budget.
- Counterexample: aaaaaaaBBB + aB0aB0aB0aB has n=21. Deleting in the length7
  run saves zero replacements; deleting in BBB saves one. Longest-run-first loses.
- Step 3: fresh lengths4 and8 with four compulsory deletions: two savings need
  at least 2+3=5 deletions (or six in the length8 run), so one saving is maximal.
  R=3→2 and final cost=6. Prediction/reveal/change and locale preservation checked.
- Step 4: scan→run demand and remainder counts, then one-/two-/three-deletion
  savings map directly to canonical Python. Submission storage is constant;
  teaching snapshot storage is explicitly separate. Boundary results are executed.

## Actual computational checks

`tests/evidence/solution-results.json`: 1,263 cases matched independent finite-state
edit-distance DP, including all 1..6 length strings over aA0, 160 seeded random/run
cases and explicit official/boundary/counterexample/transfer fixtures. Another
4,538 exhaustive length/budget allocations check the marginal-saving invariant.
Five fixtures also execute the Python baseline shown in the lesson, including the
50-character limit. Duplicate localization keys are rejected before overwriting.

`tests/evidence/core-results.json`: 1,263 simulated answers compared with independent
oracle results and 1,956 snapshots checked against deletion-allocation DP, budget
conservation, demand sums, and trace isolation.

## Actual browser checks and visual inspection

`tests/evidence/browser-results.json`: real headless Chromium using the provided
executable and existing preview. Both locales; all seven presets; forward/back/
reset/endpoints; all range values; prediction before reveal then changed choice;
locale preservation of preset, position and reveal; clipboard success and explicit
denial fallback; displayed/copied/fallback/downloaded canonical source equality;
keyboard activation and 3px focus; forced colors; reduced motion; local related
anchors; no external requests, local HTTP errors or page exceptions.

Viewport checks: 320/390/1440px in both locales, plus CSS zoom=2 at 1280px (effective
640px), with zero page overflow and readable 48px controls. Screenshots include run
cards, buttons, results, transfer feedback, fallback and zoom. Author visually
inspected en-320-runs, zh-390-runs, en-zoom200, zh-prediction and en-320-controls-result:
run lengths and demand values wrap fully; repeated runs remain prominent; singleton
runs share one compact summary; feedback shows the current answer. Additional
button/zoom/fallback observations are recorded with the final evidence below.

Measured exact token contrast: body text ≥13.39:1 across the three backgrounds;
muted/disabled ≥6.44:1; accent ≥10.91:1; focus orange ≥8.93:1. Disabled opacity is
locally restored to 1. The language group permits focus outlines outside its bounds.
The shared and local stylesheet byte total is recorded in browser-results.json and
is below 25,000. No external fonts/assets, timers, playback or online execution.

Limits: headless desktop emulation and CSS zoom, not real phone hardware or native
browser zoom. No independent novice walkthrough, independent acceptance, production
or public delivery verification. None is implied by these author checks.

## Metadata gate

Executed from repository root:
`python3 -B scripts/register_leetcode_lesson.py 420 --validate-only`.
See tests/evidence/preflight.json for the captured exit code/output. This gate is
read-only; no registration or campaign record is changed. Complexity is the single
string `O(n) time; O(1) auxiliary space`.

Final visual inspection: en-320-buttons shows all four allocation buttons with
wrapped full labels and visibly disabled endpoints; zh-zoom200-buttons shows the
same states without clipping at double scale. en-zoom200-runs retains each original
length and new demand side by side with complete text. zh-fallback shows the selected
exact source and a visible orange focus ring around the manual-copy textarea.
These are author observations of the saved final screenshots.

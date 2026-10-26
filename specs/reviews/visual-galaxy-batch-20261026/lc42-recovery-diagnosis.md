# LC42 native-control/model recovery mismatch

Independent cold reader reproduced: edit last height6, select i3, Next×3, follow collection link, Back. Native controls restore3/6 but model reinitializes i2/last4/phase0. A deterministic actual browser regression `leetcode/42/tests/wall-recovery.cjs` failed with2!==3. Red JSON records navigation typeback_forward and retained unrelated history sentinel. No formula change is justified.

Ranked falsifiable hypotheses before the repair:
1. Missing entry-state hydration: browser restores form properties while the closure reinitializes defaults. A validated per-entry snapshot plus pageshow reconciliation should restore both model and controls, and pass Back/reload without changing math.
2. Incorrect water formula after edits: an unchanged input would also fail before navigation. Existing independent unit-cell oracle and the pre-navigation depth3 contradict this; no math repair selected.
3. Parent/history state is overwritten: the foreign sentinel would disappear. It survives in the red case; preserve it explicitly in the selected fix anyway.

Chosen fix: validated current-entry history.state.visualLc42Wall only, containing selected preset/edited small array/index/phase. No tracking/global storage/new timer. Render syncs all controls; pageshow/popstate restore valid state and reconcile the view. If history is unavailable, keep an internally consistent in-memory/default view, without claiming persistence across reload. This is author-selected experiment state, not a learner profile.

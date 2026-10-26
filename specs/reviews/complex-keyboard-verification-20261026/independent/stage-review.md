# Round9 staged implementation static / pure-function review

**Static/model verdict: PASS, no must-fix finding in the inspected stage.** Actual browser task acceptance remains pending. No Chrome was started and no repository files were edited.

Read staged app/index/i18n/style and compared the coordinate wiring to the existing states/normalizers. There are three native forms, six number inputs, two target selects and explicit submit buttons. Forms are novalidate with custom finite/overflow checks; number fields use stepany and localized labels/help/error associations. The new CSS retains48px controls,3px focus and forced-colors outlines.

`prepareCoordinate` uses the same snap-and-limit functions as pointer interaction. Unchanged coordinates preserve their exact array values before normalization. Existing presets retain direct exact assignment; S4's unit-modulus trigonometric preset is not rounded through the pointer path. Successful submit updates only the selected property of the existing S1/S2/S4 object and calls its corresponding render function. Target changes only synchronize the form. Pointer and preset paths clear/synchronize only their affected form and select the appropriate point.

Draft fields are written only when the form is not dirty. Language refresh/resize redraws reuse the same inputs, so partially edited fields are not deliberately overwritten. Error/status state is transient localized UI copy with no new storage or learning inference. S3 trajectories and quiz states are not reset by coordinate commits. Actual cross-input/locale/resize behavior still needs browser confirmation.

## Independent VM checks

`stage-model.cjs` extracts the actual staged named helper functions into a VM, without DOM or application mocks.12 cases passed and verified no mutation of supplied raw/current arrays:

- Exact unit preset and an already projected off-grid point survive no-op Apply.
- S1±5 and actual S2±4.2 clipping.
- S4 raw(3,1) radial projection, and snapping before projection for(3.04,1.04).
- Zero factor.
- Missing/incomplete numeric input represented asNaN; Infinity; multiplication-by10 overflow.
- Large but computable finite coordinates retain finite radial output.
- Existing negative half-grid rounding behavior is preserved rather than silently replaced by a new rounding convention.

`stage-model.json` records inputs/results and the tested app SHA. This proves the selected normalization/precision cases, not all browser editing semantics or a new complex-number theorem.

## Optional diagnostics / not acceptance blockers

- Explicit invalid Apply can focus the first bad field to shorten keyboard recovery. The current visible localized status and aria-invalid fields still identify rejection and preserve state.
- A persistent empty live-region node is generally more robust than display:none on empty status. Real screen-reader speech is not certified by either source inspection or DOM presence.
- For extremely large finite drafts, adding0.1 can round to the same floating-point value. A next===current guard could report numerical range instead of a silent no-op. Submit already safely rejects uncomputable values or normalizes computable ones; this is not a model-corruption finding.

Later UI review must execute typed/partial input and real keyboard, not only programmatic setter calls. Keep the earlier design's exact-preset, draft/locale, pointer/touch, quiz-lock, focus/sticky-nav and doubled-text recovery cases.

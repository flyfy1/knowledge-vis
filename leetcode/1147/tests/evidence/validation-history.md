# Author validation history

- Initial numerical tests passed. Initial core-test harness selected the `use strict` expression rather than the copy assignment in its AST. It failed with `Cannot read properties of undefined (reading 'type')`. Corrected the harness to require AssignmentExpression; no runtime fix was involved. Rerun: 13,493 frames passed.
- Initial browser run failed its measured selector-text budget: `zh 320 2 preset 1`. The descriptive native-select option exceeded usable width at 200% CSS zoom. Candidate v2 uses compact preset names and retains the full string in the adjacent input readout. Copy asset reference bumped to v2. Full browser rerun required. This was an author-found defect, not an independent-review finding.

- Browser rerun then found English heading overflow at 320px / 200% CSS zoom (`Decomposition` in h1, `observations` in h2). Diagnostic retained in `en-320-zoom2-overflow-before.png`. Added local heading wrapping using the existing type scale; CSS asset reference bumped to v2. Candidate v3 requires a fresh full self-check. No independent review has occurred.

- Candidate v3 full browser run passed: 42 recorded checks and 28 screenshots, plus 40 supplemental keyboard deep-link positions. Visual proof inspection prompted a final wording clarification: define proper prefix/suffix as shorter than the whole string and explicitly omit an empty w in the refinement. Candidate v4 bumps copy to v3; numerical/localization and full browser checks are rerun, then proof screenshots re-inspected. Metadata is unchanged.

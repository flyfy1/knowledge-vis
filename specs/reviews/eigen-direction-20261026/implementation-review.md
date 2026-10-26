# Eigen direction: independent implementation review

Decision: **bounded PASS; zero remaining mathematical or implementation must-fix findings in the reviewed S1 change.** This accepts the feature source, not publication readiness or the whole eigen course.

## Actual scope and method

Reviewed the isolated checkout `/tmp/knowledge-vis-eigen-direction-20261026`, based on `93346e21`, including `eigen/app.js` directionProbe and S1 callbacks/rendering, S1 bilingual text/HTML/styles, the bounded BRIEF, affected tests and the atlas source-only change. This was source-first review, followed by independent VM calculation and inspection of parent-supplied images. I did not operate Chrome, rerun the parent's browser suite, or conduct a fresh UI-only learner walk. Other eigen steps and arbitrary matrix editing are outside this acceptance.

The linked textbook references are present beside the optional derivation; their pages were not independently fetched during this implementation review. Mathematical relationships were independently derived and checked.

## Science and architecture

- Projection `p=(v·Av)/(v·v)` and residual `r=Av−pv` use the existing matrix/vector helpers. The residual segment starts at `pv`, ends at `Av`, and is perpendicular to the input line. It does not represent another origin-based vector or motion in time.
- Positive and negative eigenvalues both qualify as same-line behavior. Zero image has no angle and valid λ=0 for a nonzero input. Zero input and nonfinite/overflowing calculations reject rather than fabricate an angle.
- Numerical collinearity is explicitly a floating-point tolerance, separate from the merely near (<1°) result. The old 45.5° false positive is removed: residual ≈0.0174524, angle ≈0.33333°, classified non-aligned. Projection coefficient p is not advertised as λ in the near case.
- The three unchanged presets are bounded symmetric, invertible matrices. Text restricts the two-direction observation to these presets. The existing canonical atlas eigen source now lands at `#step1`; no new nodes, trails, controller, clock, persistent state or duplicate matrix model were added.
- One angle setter owns pointer, native range and canvas keyboard state. Matrix changes retain the angle; locale/refit redraw; reset restores first matrix/20°. Range step=any preserves off-grid pointer values. Review confirms Alt/Ctrl/Meta early return and canonical curve modulo180 while the control retains 360. Curve samples and main readout now share directionProbe, with null-angle gaps rather than fabricated zero angles.

## Independent evidence

`independent-probe.cjs` / `independent-probe.json` exercise the actual helper against separately derived determinant-distance and scale-aware orthogonality, plus positive/negative, zero-output, perpendicular and invalid golden cases: **1,323 cases pass**. Maximum relative distance error 2.98e−16; orthogonality error 4.53e−16. These are numerical checks, not learner outcomes.

That probe records its original app hash before the final callback/curve fixes. The helper is unchanged; the final callback/curve changes were source-checked separately. `implementation-source-snapshot.json` records the final reviewed six-file hashes (app `74c0dbe3f87648c5990017aad63e9f61acf3650a61139c860e5c35a75f5e1d33`). `git diff --check` passed.

I viewed `after/en-1280-off-line.png`, `en-1280-aligned.png`, and `en-1280-negative.png`. These supplied canvas crops show the pink off-line residual, its disappearance at alignment, and opposite directions for negative λ. They do not independently establish surrounding text layout, focus, screen-reader output or mobile behavior.

Parent-executed `after/browser.json` reports PASS for EN/ZH at 320/390/1280, off-grid, keyboard/touch, locale/refit/reset, graph navigation/Back and 200% keyboard, with no recorded errors/failures. It explicitly excludes physical-device certification. This is reviewed parent evidence, not my own browser execution. The additional final shortcut/curve assertion rerun was still described as forthcoming in the latest message; this review does not claim that rerun completed.

## Release conditions and small follow-up

The planned shared Codex attribution header is not yet present in this feature checkout. Before publication, complete the explicitly planned second attribution commit using the exact feature revision and verify one header/source link; this is a release condition, not a scientific blocker to this bounded feature acceptance.

Optional small consistency cleanup: the non-initialized HTML fallback for the second preset still says `A 一般`; runtime i18n correctly replaces it with “another symmetric matrix.” Align the fallback when touching final HTML. No runtime mathematical error remains from this fallback.

No product files were edited by this reviewer. No push/deploy, live-user test, mastery inference or whole-course accessibility/science certification is claimed.

# Round 11 staged science and implementation review

**PASS for independent source, numerical, history-schema and bilingual-content review. Zero remaining findings in this reviewed scope.** This is not browser/whole-task acceptance: the parent is still resolving and testing an enlarged-font layout issue. No Chrome or real-repository edits were performed by this reviewer.

## Independent tests

`stage-model-check.cjs` is independent of the owner's test implementation. It evaluates the actual staged PURE functions and snapshot functions in an isolated VM. Recorded results are in `stage-model-check.json`.

- 26 signed boundary cases cover nextDown(CRIT), exact CRIT, nextUp(CRIT), ±1e−12/±1e−10/±1e−7 offsets, zero,30°,60°,80°. Both source sides classify identically by magnitude, preserving signed scalar angle output; TIR returns null direction/angle. The exact constant is48.753466631327235°, displayed48.8°.
- 32,002 actual S2/S3 rays across both sides agree with tangential Snell continuity: maximum residual4.44e−16. Geometrical atan2 angles from the drawn direction agree with reported theta2 within1.42e−14°. Reflected angles remain equal to incidence. Normal incidence transmits across the boundary, while mirror reflection reverses propagation; no zero vector occurs.
- Equal-index and lower-to-higher media have no critical angle. Invalid/nonfinite/nonpositive indices and angles outside the declared normal-angle domain return an explicit invalid state. No out-of-domain asin is evaluated for TIR.
- 321 eye positions preserve the S4 fixed vertical reference, have finite positive apparent depths below real depth and maximum sightline residual1.35e−13. This checks the stated illustration, not a complete virtual-image solution.
- Snapshot restore, version/owner/range/side mismatch rejection, unrelated history fields, unchanged quiz object and denied read/write fallbacks pass. The record contains only version/lesson/S2/S3; no quiz or learner state is stored.
- 114 language keys and their placeholders match. Atlas has38nodes/47edges/10routes.

The recorded source SHA identifies the exact staged app used. Ordinary VM checks do not exercise native range sanitization, actual pageshow event order, focus, real Back or browser paint.

## Scientific and teaching contract

The common scalar solver now uses the same criticalDeg threshold as the preset. Equality is the grazing limit; strictly above is TIR; there is no angular tolerance band. The legacy S4 vector solver has only a machine-roundoff root guard. S2/S3 ray direction, transmission angle and formula share one scalar result. Values extremely close below critical may round to90° while still classifying refract; this is floating-point/display resolution, not a new physical interval.

Both languages correctly define n=c/v (phase speed), normal-angle measurement and the dimensionless sine range; arcsin is explicitly distinguished from reciprocal sine. Nonzero bending and normal-incidence exceptions are local. S3 has the requested zero feedback, strict threshold wording, the exact unrounded preset distinction and no false inference from line brightness/thickness to energy fractions. TIR is bounded to propagating geometrical rays. S4 no longer claims lateral motion or a full many-ray focus. Trig links explain the different reference axis and do not transport numerical state. No new clock/controller or atlas inline experiment was introduced; the ordinary unit-circle→Snell route is sufficient.

The fixed30°/critical/60° prediction uses the existing controls. It is an explanatory self-check, with no scores, learning inference or answer persistence. Only S2/S3 angles/last side are reconstructed; other lesson and quiz initialization remains the existing policy. Native values are resynchronized after initialization/pageshow, and cross-course links flush the debounced snapshot. Actual browser confirmation remains necessary.

Primary source links in the implementation were opened and checked: [OpenStax1.3 Refraction](https://openstax.org/books/university-physics-volume-3/pages/1-3-refraction) supports the index/normal-angle law; [OpenStax1.4 Total Internal Reflection](https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection) supports the grazing limit and strict condition. This project's1.33 value is independently recomputed rather than replaced by a textbook's tabulated48.6°.

## Findings closed during review

The first staged CSS used a low-specificity `:where(...):focus-visible` rule beneath an older, more-specific2px button/input rule. The new declaration did not win the cascade. The parent changed the original selector itself to3px and provided matching-specificity Highlight in forced colors. Source reread confirms this must-fix is closed; computed browser verification is still the parent's responsibility.

The nonblocking deep-link suggestion is also implemented: both `#snell-bridge` and `#critical-proof` are explicitly opened by the same reveal helper. Rounded critical/TIR values no longer appear as a misleading `48.8 > 48.8`; the text classifies from unrounded state and identifies both displayed values as rounded, with an additional precise threshold explanation.

## Remaining acceptance boundary

At this writing the parent has identified an old layout overflow at320px/actual double font size and is performing the narrow browser repair. This report neither declares that UI passed nor treats owner test counts as independent operation. Final supplied-image review can follow after the UI results are frozen; the separate UI-first learner review should retain its actual method and findings.

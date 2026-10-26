# Existing-course signal-domain repair contract

Independent scope review and root adjudication precede this brief: [design](../specs/reviews/signal-domain-design-20261026.md). This brief amends only the audited existing steps; it does not claim to be the original full-course brief.

Known: reader has seen sample points and frequency-response plots. Question: when do samples identify a signal, and what does a digital frequency mean? Inputs: existing frequency/sample-rate/phase or MA length/frequency controls. Output/action: compare exact boundary presets, predicted values and same-state formula/plot/measurement. Scope: ideal uniform sampling and existing linear filters; no hardware/learning-outcome claims.

S1/S3/S4/S6 explanation repair only: exact uniform samples are distinct from line/hold display. Uniqueness requires known ideal bandlimit and ideal reconstruction; equality may hide arbitrary amplitude/phase even with nonzero samples. One-sided spectral plot is frequency-position illustration, not a full reconstruction. Two-pass finite box blur reduces rather than eliminates aliases.44.1kHz example is a bandwidth allowance, not historical derivation. Original alias,phase,clock,audio,image and reset routines remain existing.

New terms at repaired steps: t seconds vs n integer index; fHz vs physical angular frequencyrad/s and digitalrad/sample; known bandlimit, removable singularity and exact zero. Labels and conditions are bilingual; existing CSS tokens,source/atlas navigation and state semantics are reused. No new persistence, learner tracking or privileged operations. Acceptance and limits are in the indexed signal-domain verification record.

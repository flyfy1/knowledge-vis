# Existing-course signal-domain repair contract

Independent scope review and root adjudication precede this brief: [design](../specs/reviews/signal-domain-design-20261026.md). This brief amends only the audited existing steps; it does not claim to be the original full-course brief.

Known: reader has seen sample points and frequency-response plots. Question: when do samples identify a signal, and what does a digital frequency mean? Inputs: existing frequency/sample-rate/phase or MA length/frequency controls. Output/action: compare exact boundary presets, predicted values and same-state formula/plot/measurement. Scope: ideal uniform sampling and existing linear filters; no hardware/learning-outcome claims.

S1/S3/S4/S6 explanation repair only: exact uniform samples are distinct from line/hold display. Uniqueness requires known ideal bandlimit and ideal reconstruction; equality may hide arbitrary amplitude/phase even with nonzero samples. One-sided spectral plot is frequency-position illustration, not a full reconstruction. Two-pass finite box blur reduces rather than eliminates aliases.44.1kHz example is a bandwidth allowance, not historical derivation. Original alias,phase,clock,audio,image and reset routines remain existing.

New terms at repaired steps: t seconds vs n integer index; fHz vs physical angular frequencyrad/s and digitalrad/sample; known bandlimit, removable singularity and exact zero. Labels and conditions are bilingual; existing CSS tokens,source/atlas navigation and state semantics are reused. No new persistence, learner tracking or privileged operations. Acceptance and limits are in the indexed signal-domain verification record.

## Codex S2 sample-pair verification — 2026-10-26

[Scoped contract](../specs/sampling-pair.md), following independent gate. Existing model/figure and fs/f controls already showaliases; add only selectedintegern and pairedreadout/markers atsample n/fs versus nonsample(n+.25)/fs. Show signedg=f−kfs in[−fs/2,fs/2], then |g|; correct oldsignedintervalnote. Samepoint values sharealiasSigned and originalsin. Sample equality follows2πkn, not interpolation; nonsample mayalsocoincide, neverunique-reconstructionclaim. Knownbandlimit/fullsequence/equalitylimits from acceptedS3 retained. PassivecommitonlyS2f/fs/n history and reset, no newclock/audio/controller/graph. P0/P1/token/source/prevention details inlinkedcontract.

Accepted sampling-pair implementation source 752217ab5f3090fb306f9c7d06de4d978896728e; priorCodex1d90150 andMuse/Alberto0cdb1700/27eb5c4b contributionsretained. Publicationisaseparateverificationboundary.

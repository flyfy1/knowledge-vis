# Independent bounded sampling-pair design gate

**Proceed with this S2-only correction/comparison.** Actual source at `198b3338` already computes signed aliases correctly, but its nearby formula note wrongly says k places the signed result in the nonnegative interval. The existing static waveform and controls are sufficient; no new reconstruction engine, animation, audio, graph or route is justified. This is source-first review, not browser acceptance.

Required science:

- Keep the existing `aliasSigned` as sole authority: k=round(f/fs), g=f−kfs in [−fs/2,fs/2], followed by f_alias=|g|. State the implemented tie convention if needed; no new folding rule. Correct the first definition to a signal above fs/2, rather than only fs<f, without rewriting the already-correct S1/S3 sampling conditions.
- The plotted/read pair must use sin(2πft) and sin(2πgt), not a same-phase sine with |g|. At t_n=n/fs, their arguments differ by 2πkn, so sampled values agree. The absolute alias is a frequency magnitude; negative g carries the sine sign/phase information.
- The nearby t_q=(n+1/4)/fs is not a sample. Values MAY differ; do not force a gap, claim every nonsample differs, or infer uniqueness from a few additional coincidences. Required counterexample: f8/fs2 gives k4/g0 and quarter-offset values also coincide, despite the different original curve. The clean k0 state has identical full curves.
- Show Δt=1/fs in seconds, signed g/k, nonnegative alias magnitude, both actual times/values and numerical differences. Algebraic identities may use =; rounded numeric values/differences use ≈. A near-zero floating residual is not experimental measurement. Explain selected finite-point agreement as ambiguity, not recovery, interpolation or proof of bandlimited reconstruction.

Required state/UI:

One integer n indexes the existing two-second sample pool, with its actual supported bounds. On fs change retain n if still valid, otherwise clamp the integer and update its control/readout together. Mark sample and nonsample distinctly using ring/diamond or equivalent shapes and textual labels; coincident points must remain interpretable. Reuse original/folded curves and the exact same time map, including negative g. Native label, min48px target and 3px focus; 320px/actual 200% bilingual readouts must stay legible.

Bounded same-entry history may store only validated S2 f/fs/n on native commits/presets/pagehide, never every preview/frame. Merge foreign history fields, reject invalid/out-of-range/noninteger n, restore native controls together, gracefully handle denial, and preserve existing hash/locale/navigation. Do not restore/resume audio or other lesson state. No new clock, store or model is needed.

Minimum acceptance: default9/10 negative g; folding14/20; DC10/10; clean3/25; k4 coincident-quarter8/2; n0 and largest supported n; fs-decrease clamp; actual sample difference across all valid n and several frequencies; fixed-time cross-curve check and marker/values agreement. Protect aliasSigned/aliasFreq and all S1/S3/audio models. Browser/cold-review checks should cover native controls/presets, history Back/reload/denial, keyboard, mobile and doubled text; numerical tests are not learning-effect evidence.

Source scope: parent reports consulting TI AN236. The exact sample-pair identity above is independently derived from the actual original `aliasSigned` and sine formulas, not a new external-source claim or whole sampling-course audit. No product edits or Chrome session were performed.

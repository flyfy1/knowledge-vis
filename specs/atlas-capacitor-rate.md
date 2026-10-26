# Derivative → capacitor voltage rate

Read WORKFLOW, atlas/BRIEF.md, power-converters/BRIEF.md and the provenance spec before modifying this slice. [Independent design gate](reviews/atlas-capacitor-rate-20261026/design-review.md).

## Gap and smallest useful loop

Baseline227f37b6 has38nodes/48relations/11routes. Derivative and capacitor exist without a direct explanatory connection. The existing ±20mA/zero-current exercise plots voltage, but never identifies a measured rise/run with current. Build one sourced application edge and a two-stop `charge` route using existing stationTasks. No mandatory prerequisite, new concept, runtime model, store or clock.

Known: a derivative measures local change. Question: why can current be zero while voltage is not? Input: existing capacitor pulse buttons, C=100µF and Δt=0.5ms. Output: existing absolute voltage trace and latest-interval relative Δv diagram/readout from the same two stored endpoints. Try plus,plus,zero,minus; observe rise,rise,flat,fall, with zero-current interval holding0.2V. Reset clears history and the new diagram. This is an ideal prescribed current input, not exponential RC charging or switching-converter dynamics.

## Claim, sources and scientific boundary

[OpenStax8.1](https://openstax.org/books/university-physics-volume-2/pages/8-1-capacitors-and-capacitance) gives Q=CV, capacitanceF=Coulomb/Volt; [9.1](https://openstax.org/books/university-physics-volume-2/pages/9-1-electrical-current) gives current as dQ/dt. With constant positive ideal C and signed current entering the terminal marked+ for voltage, i=C dv/dt. No leakage/parasitics, no instantaneous voltage jump for these bounded finite currents. This is an application of differentiation, not a claim that calculus causes current or must be learned first.

For each constant-current segment, Δv/Δt equals dv/dt in the interior exactly under the existing analytic model. Arbitrary finite secants are only average rates; do not generalize exactness to other curves. At a genuine current discontinuity voltage is continuous but the two-sided derivative need not exist; repeating equal pulses is not a corner. A +20mA interval changes voltage by+0.1V, slope+200V/s (=0.2V/ms). Negative current decreases signed voltage throughzero; it is not always discharge/energyrelease. Fixed local axes:0..0.5ms and Δv−0.12..+0.12V, text gives both scales. The newest segment is a replay of the selected discrete pulse interval, not a wall-clock animation or measured hardware.

## UI / state / provenance

Reuse the existing full voltage trace and pulse array; a latest-interval diagram beneath it has fixed local scales, dashed run/rise and solid slope, DOM labels and accessible SVG summary. No invented interval or zero derivative after reset. Zero rise draws no fake vertical arrow. Plot and numeric start/end/current/slope use the same endpoints. Do not alter shared plot() or Buck/Boost/inductor behavior.

The route first revisits derivative#step2 x² (x=−1/0/+1 yields slopes−2/0/+2); then explicitly changes examples to capacitor v(t), with unitsV/s. No parameter transfer, no guarantee the previous capacitor sequence survives a new document; reload resets it. Native Back restores Atlas selected station/language/filters via existing ownership. Locale changes within the capacitor page preserve its sequence; reset, repeated pulses,16limit, resize and reduced motion remain supported. All21 page attribution records remain accurate; retain original flow source and new source revision in the updated edition.

## Recurrence acceptance

- Existing graph49valid unique relations/38nodes/12routes, no inferred prerequisite; exact real course links/anchors, bilingual task evidence and valid source claims.
- Independently verify all3^0..8 pulse sequences against accumulated charge Q/C, slope current/C and energy endpoints; positive/zero/negative/crosszero/16limit/reset.
- Real UI route→derivative controls→Back→capacitor plus/plus/zero/minus; last diagram geometry changes with sign while fixed axes remain; zero keeps nonzeroV; screenshot compare not only text.
- Both languages, mobile390,320actual200%text, keyboard≥48px/3pxfocus/forced colors, refresh reset and Back selection recovery; no JS errors. Source controls and quantitative model unchanged.
- Scoped existing Atlas/Galaxy and power flow lifecycle regressions. Independent cold task walk and scientific/code review; no claim of physical-device accessibility or learning gains.
- Actual main/push/origin installation and public verification are separate. Existing Cloudflare403/1010 blocks public reads: do not repeat/bypass; disclose server-only acceptance when publishing.

# Buck and boost: learn where the energy goes

Contract: ../specs/reviews/power-converters-design-review.md. Audience: curious beginner with arithmetic; outcome: explain both switching states, derive ideal voltage ratios, and reject free-energy intuition. Validation: a learner follows seven steps, changes drive and duty, predicts an input-current result, and traces complete loops.

| Step | Known | One question | Input → sought quantity | Action → observation | Scope |
|---|---|---|---|---|---|
|0 Power|Arithmetic|Can voltage rise without creating energy?|12 W, output voltage → output current|Move voltage → inverse current|Ideal constant power, no startup|
|1 Inductor|Voltage/current|What does voltage do to current?|±2/0 V, L10mH, 0.5ms → current|Apply pulse → signed current history|Ideal signed component, source may absorb energy|
|2 Capacitor|Current|What does current do to voltage?|±20/0mA, C100µF, 0.5ms → voltage|Apply pulse → signed voltage history|Ideal signed capacitor|
|3 Switch|Stored energy|How do we route and time current?|Diode polarity, D → conduction / on-time|Reverse diode, vary duty → path and timing|Ideal switch/diode|
|4 Buck|KVL, inductor, PWM|Why is output lower?|Vin,D → voltage/current/state|Play, seek or advance unequal subintervals → conducting loops and rising/falling energy|Periodic CCM, small output ripple|
|5 Boost|Same components|Why can output exceed input?|Vin,D → voltage/current/state|Play or inspect switch states → separate source and capacitor loops|Same model; capacitor ripple omitted|
|6 Budget|Power|What does boosting cost?|5→12V,1A,efficiency → input current/loss|Predict then reveal; vary efficiency|Separate loss budget, not nonideal converter solution|

First-use vocabulary: voltage=energy per charge; current=charge per time; conventional current=positive-charge direction; power=voltage×current; KCL=current conservation at node; KVL=signed voltage sum around loop=0; passive polarity=current enters positive voltage terminal; inductance L=current slope response; capacitance C=voltage slope response; diode=one-way ideal path; duty=ON fraction of period; CCM=current never reaches zero; steady state=state repeats each cycle; feedback=measure, compare, adjust.

Design tokens reuse atlas: canvas #0a0e14; surface #111826; secondary #0d1420; border #596d85; ink #e6edf6; muted #b1c0d2; cyan #67d7f9; amber #f5b04c; green #7ee2a8; on-accent #08131a. System font16px, body1rem/1.7, title clamp(2rem,5vw,3.5rem), section clamp(1.5rem,3vw,2rem), metadata.875rem. Spacing8/12/16/24/32/48px, content960px, gutters24px (16px phones), radius8/16px, no ambient motion; user-started, slowed current flow only. Controls48px, focus3px offset3, reduced motion omits moving dashes. All labels/diagrams/statuses EN/zh. The compact full circuit fits narrow screens; labels remain at least 14 CSS px at 320px.

States: component initial/history/full (16 pulses)/reset; converter initial/play/pause/seek/four intervals/two cycles complete/reset/new steady parameter case at held time; prediction pending/selected/revealed; locale changes preserve experiments. No network request, loading, reconnect, account or backend states. One requestAnimationFrame loop, at most one converter active; painting capped near 12.5 Hz. Rebuild locale markup only; state is separate. Locale changes pause playback and preserve time and inputs. Numeric model is a single pure module and tested through its public interface.

Sources: OpenStax electricity chapters; Analog Devices buck basics and boost-regulator explanation; TI SLVA477 and SLVA372. Equations and examples independently calculated. No external runtime assets.


## Codex flow revision — 2026-10-26

Page-owned development label: Codex. Acceptance and implementation contract:
`../specs/reviews/power-converters-flow-20261026.md`. This revision keeps model.js,
the pulse exercises and the loss-budget model unchanged. Current dashes are directional
illustrations, never electrons or discrete energy packets. Magnetic energy is model-derived;
capacitor charging/discharging is signed current, not an invented voltage/ripple animation.

## Integrated edition provenance

Use one shared static header disclosure per `../specs/visual-page-provenance.md`, with original flow source24a3d727246b05697d6b2cb65125cd9fc771a0a0 retained, the flow revision scope and retained original contributors. Do not also stamp the eyebrow. The original quantitative model remains unchanged; future Claude comparison must retain independent source/routes and the same bounded model.

## Capacitor rate bridge — 2026-10-26

Current incremental contract: [atlas-capacitor-rate](../specs/atlas-capacitor-rate.md). The prior flow revision's unchanged pulse/model statement is historical: this increment adds only a view over the latest capacitor interval and the graph connection. model.js, pulse recurrence, shared plot(), inductor and Buck/Boost remain unchanged. Relative Δv vs absoluteV, fixed0.5ms/±0.12V axes, signed200V/s and discontinuity conditions are mandatory; reset has no interval. Preserve all native buttons/limits/locale, do not introduce storage or claim reload retains pulse sequence. Update visible source revision while retaining24a3d727 as original flow contribution.

Current capacitor-rate implementation source:4791138bb6bf0e89dbb665c9268784e63b702216. The static current edition links this accepted increment and keeps the original flow source.

## Buck signed-voltage area — 2026-10-26

[Current incremental contract](../specs/atlas-volt-second.md) supersedes earlier unchanged-inductor-display statements only for this explicitBuckview. Preserve original model.js,flow.js,sharedplot(),Boost and capacitor view. One pure area companion reads existingBuckparameters, yields clippedconstantsegments/signedVs andΔi, not newcurrentstate. Existingseek/play owns time; optionallocalpresets dispatchsamehandler andkeepfocus. Periodnet0 meanscurrentreturnsinitialnonzero valley, notzero. Definevoltagepassivepolarity,Vµs→Vs conversion andvoltagearea≠energy. Existingsteadyassumption nottransientsimulation. Use sameCodexsourceeditioncontract and scopedtests.

Current Buck voltage-area implementation source:4f1992891a6996c1aaffedb78053ad2b538ebc7d. Static revised-edition source links this accepted increment; prior capacitor source4791138b and original flow source24a3d727 remain historical contributions.

## Codex feedback iteration — 2026-10-28

Step 0 keeps a reserved, bilingual feedback line below the 12 W readout. Moving the output
voltage slider now states the causal observation in plain language: lower voltage needs more
current at fixed power, higher voltage needs less, and 12 V corresponds to 1 A. The line is a
polite live region for this learner-controlled change; Buck/Boost playback readouts remain
quiet to avoid per-frame announcements. Its mobile height is reserved so the feedback does
not move deep-linked steps or disrupt the sticky step navigation.

Acceptance: at 320, 390, 768 and 1440 px in both locales, changing 12 → 6 → 24 V updates the
localized direction sentence and preserves the `#step4` anchor position and zero horizontal
overflow. The 12 W model, all converter paths, numerical state and existing reset/navigation
contracts remain unchanged.

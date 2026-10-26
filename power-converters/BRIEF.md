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

Use one shared static header disclosure per `../specs/visual-page-provenance.md`, with source24a3d727246b05697d6b2cb65125cd9fc771a0a0, the flow revision scope and retained original contributors. Do not also stamp the eyebrow. The original quantitative model remains unchanged; future Claude comparison must retain independent source/routes and the same bounded model.

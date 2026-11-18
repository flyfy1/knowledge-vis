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

## Switch phase bridge — 2026-10-28

The Buck/Boost path readout now begins with a localized ON/OFF phase sentence. It names the
switch state before the causal loop description, so a paused learner can connect the visible
switch position to the conducting path and energy direction. The model, sampled time, playback,
and diagram geometry remain unchanged.

## Change 2026-11-17: text in a key table (Claude Code, site template Phase 3 batch D)

The lesson's text moved out of `app.js` into the standard lesson shape, so `scripts/convert-essay.cjs` can
convert the page (specs/site-template.md §3c, §10 "Phase 3 batch D"). Reader-visible behaviour is unchanged;
this is not a content revision, and the edition stays the Codex revised edition.

- `i18n.js` holds `STR = { zh, en }` (180 keys, the same in both languages) and the runtime `t(key, vars)` /
  `applyLang(lang)`. Every value is a former `tr(zh, en)` pair or what the old template composed from those
  pairs; nothing was reworded (the en ` . This lesson` and the U+3000 spaces in the step-0 formula stay).
- `index.html` now carries the seven steps, the step nav and the footer as static markup with
  `data-i18n` / `data-i18n-html` / `data-i18n-aria`; `<main>` lost its `id="lesson"`. Every element id, the
  `#step0`…`#step6` anchors the atlas links to, `.step` / `.nav-step` / `data-nav`, and the initial control
  values are as the old `render()` wrote them. Range-label text and the three answer labels sit in a
  `<span>` because their text shares a parent with an `<output>` / `<input>`.
- `app.js` keeps the model wiring, playback, readouts, plots, path text and the language choice (stored
  choice, else the browser's; storage is written only on a click, as before). Strings come from `t()`.
  A language switch re-renders text only: the elements stay, so sliders, radios, `<details>` and the
  playback position need no rebuild. As before, it pauses playback, clears the lit step-nav item for
  the scroll spy to relight, keeps the top step in place and returns focus to the language button.
- `app.js` and `i18n.js` load with `?v=20261117` (same URL, new code; scripts are cached for four hours).
- Equivalence with the old page, zh and en at 1280/390/320 with reduced motion, over 35 control states
  (pulses up to the 16-pulse limit, capacitor rate, diode, PWM, Buck/Boost stepping, duty/Vin/seek
  changes, area presets, two-cycle completion, prediction, efficiency, language switch and back, resets,
  playback): page title, `<html lang>`, header, nav, footer, every step's text, every control's
  text/value/state/aria-label and every SVG plot and circuit diagram are equal string for string, and
  full-page screenshots are pixel-identical apart from one anti-aliasing flake the old page shows between
  its own runs. The only DOM difference: after a language switch the old page had rebuilt its inputs, so
  their `value` / `checked` *attributes* carried the state; now only the properties do (same rendering).
  Record: specs/reviews/power-converters-i18n-refactor-20261117.md.
- The page's seven tests pass unchanged (model 3660, browser, flow-browser 240, flow-lifecycle,
  review-accessibility, review-matrix 1160, review-responsive with its output in a scratch directory).
- The atlas generator now finds `id="stepN"` in the static page, so the seven atlas concepts it had
  recorded as unverified "legacy step anchors" keep their claimed steps (power 0, inductor 1, capacitor 2,
  switch-diode and PWM 3, buck 4, boost 5).

## Change 2026-11-17: English step-0 formula spacing (Claude Code, Phase 3 batch D review)

The English step-0 formula `P = V · I　　Ideal steady state: Pin = Pout` carried two ideographic spaces
(U+3000). They came from the old template's fixed text around one translated word, so the Chinese
typography leaked into English, and the page needed `enCjk: ["s0power"]` to pass the builder's
"no Chinese in English strings" check. `content.en.md` now uses two em spaces (U+2003): a gap that does not
collapse and is not CJK. `enCjk` is gone from `page.json` (version 20261117b). The Chinese formula keeps its
U+3000. Visible effect: in English the gap is narrower (about two monospace cells instead of four), and the
line wraps at the same point at 390 and 320 px. Record: specs/reviews/site-template-phase3d-review-20261117.md.

## 2026-11-19: pinned to this edition (`"defaultEdition": "original"`)

Since 2026-11-19 the site's page-level links open the Claude Code edition of a lesson when one exists
(`KNOWLEDGE_DEFAULT_EDITION` in pages.config.js; specs/claude-code-editions.md「默认版本」). This lesson is pinned
to its Codex edition at this address: the 2026-11-17 comparison kept it on purpose because 22 atlas deep links point
at this edition's specific steps (specs/reviews/lesson-version-choice-20261117.md, HANDOFF.md 1f/1g), and the
Claude Code edition at `variants/claude-code/power-converters/` has different steps. The pin is a registry field
only; the lesson itself is unchanged.

# Frozen bubble · implementation brief

Design review: ../specs/reviews/frozen-bubble-design.md (independent review and adjudication completed first).

MVP card: Junior-high learners who saw freezing-bubble footage need to distinguish what freezes and why ice travels. Risk: an attractive animation can imply that air freezes or that arbitrary branches are predictions. Loop: open from Physics index → seed and grow → play the matched-time environmental comparison → pause/seek/reset → explain optical limits → return. Proof: learner coldwalk and browser interactions; build success alone is insufficient. No new framework, credentials, deployment, or unrelated changes.

category physics; stage junior. Existing static lesson architecture, shared presentation shell, local bilingual dictionary. Source inspiration: KK.Dai, 又快到玩冰冻泡泡的季节, http://xhslink.com/o/6mL9ZIDCfO5 (video identified in parent conversation; no footage copied).

## Step contract (known / question / input and output / action and observation / scope)

0. Known: a bubble has a thin liquid shell around air. Question: what starts a frozen patch and why does it branch? Input: manually placed initial nucleus and relative undercooling ΔT = Tm − Tfilm, output: visibly accumulated six-direction branches. Place a nucleus, play, pause and compare larger ΔT at the same diagram time. Scope: a still patch of film; transport isolated out. Seeding is a manual intervention; branches and rate are qualitative. Temperature relative to mixture-specific Tm is not a natural nucleation probability.
1. Known: ice grows through liquid film. Question: why can ice move, and why can a freezing front stop? Input: two fixed paper-inspired boundary conditions with the same diagram clock. Output: transported crystals with trails in the cold scene, bottom front tending to a fixed diagram height in warm air. Play/seek at equal time; inspect both scenes; pause and reset. Scope: prescribed curves illustrate paper's contrasting regimes, not measured temperature, coverage, CFD or universal front height. Both scenes start at an icy base; no claim all cold bubbles follow identical paths. Step 0 and 1 are independent experiments; navigation preserves both.
2. Known: an icy shell and remaining film interact with light. Question: where do the colors come from? Input: explanatory diagram and source links; output: distinguish thin-film interference, scattering/reflection/refraction and illumination. Follow existing deep links. Scope: no spectral rendering or inference about source grading.

## First-use terms

Step 0: film = liquid shell; nucleation = first stable ice patch; anisotropy = different growth rates by direction; undercooling = Tm − Tfilm; diagram time = arbitrary playback units. Step 1 redefines latent heat = energy released during freezing; surface tension = interface's tendency to contract; gradient = spatial variation; Marangoni flow = surface-tension-driven liquid motion. Front height = diagram vertical distance above base divided by bubble diameter, not frozen area. Step 2: interference = reflected light waves reinforce/cancel, link to interference#step1; reflection/refraction = light returns/changes direction; the continuation links to reflection-refraction#step2 for basic interface refraction, not a full crystal-optics model. Reflection remains separately taught in that course’s step1.

## Model and evidence

Ahmadi et al., How soap bubbles freeze, Nature Communications 10,2531 (2019), DOI 10.1038/s41467-019-10021-6; author full text indexed at https://www.researchgate.net/publication/333866321_How_soap_bubbles_freeze and PMC6582157. Nature direct fetch redirected to inaccessible identity host; full original article text obtained through author-uploaded record. Their glycerol/water/soap mixture has Tm approximately -6.5 C; cold room approximately -18 C; warm air approximately +25 C. This lesson uses those settings as named examples. Qualitative transport and prescribed saturating warm front are not numerical reproduction of their experiments. No claims of exact dendrite shapes, onset time, flow velocity, freezing duration, or frozen area. Air does not freeze under these conditions.

Reset clears nuclei/time/trails/readouts and stops the respective clock; retains explicit undercooling setting. No autoplay. Manual time seek pauses. Moving the undercooling input preserves time/nuclei and redraws the hypothetical same-time growth comparison; this is not a live cooling history. Language and step navigation never reset. UI controls and fallback text work without color alone.

Endpoint recovery: new seeding is disabled at diagram time 24 through both button and canvas. Localized status instructs seeking backward or resetting. Existing birth times and seed positions are never rewritten.

## Teaching continuity revision — 2026-10-26 (Codex)

This revision supersedes the original presentation order above without changing `model.js` or its prescribed curves. Baseline is delivered commit `1d90150cf9c1db194769dff92dc4178ce7779fb0`; the shared checkout is not the source for this change. Implementation and test ownership stays inside this page plus page-specific review records. Shared attribution, integration and deployment belong to the integration task. No push/deployment is part of this delivery.

Before: “nucleation/anisotropy/undercooling” preceded the learner's first observation; the undercooling slider came before seeding/play; “under the paper's conditions” appeared before any paper was identified; heat/flow vocabulary preceded the comparison; mobile comparisons stacked two tall scenes with the controls below them.

After: visible patterns on a clear bubble → distinguish liquid shell from contained air → place a small piece of ice and watch growth → compare a colder film at the same time → name nucleation/directional growth → ask why ice moves → identify Ahmadi et al. and the actual experiment → inspect matched diagram moments → explain freezing releases heat, uneven temperature changes surface tension, and liquid carries ice → explain why a warm-air front can stall → retain the optical extension and model boundaries.

Acceptance criteria for future Codex/Claude comparison:

- Use exactly one visible bilingual Codex revised-edition disclosure following `../specs/visual-page-provenance.md`, naming this source revision and retained original contributions. Keep the3-section structure and existing URLs so variants remain comparable.
- No anonymous “paper conditions” claim. Before A/B, show title, authors, year, journal, DOI, recipe, temperatures, and original sections/figure references. Distinguish the selected −20°C example from the paper's broader base-temperature range.
- Plain observations must precede technical names. Explain that freezing releases energy without implying a temperature above 0°C; define surface tension before naming Marangoni flow. Orange arrow means liquid motion, not heat flow.
- A control has an observable outcome: seed makes a dot, playback/seek grows branches, undercooling changes branch length at a fixed time, and story moments pause both A/B at the same chosen time. Dynamic captions explain visible changes and limitations without claiming measured values.
- Phones can switch A/B while preserving the same clock. At 320/390×844, story controls and the active canvas are visible together; the growth canvas stays visible when adjusting undercooling. Short landscape screens do not use sticky experiment controls.
- Keep independent experiment state, language state, reset semantics, seed endpoint recovery, accessibility, reduced-motion initial pause and zero external runtime assets. Tests must use actual browser input and compare rendered canvas changes, not only text presence.
- Evidence must identify CSS viewport/touch emulation vs physical hardware. Do not label screenshot inspection as an independent learner study.

Source check: Original paper text retrieved through its author-uploaded ResearchGate record on 2026-10-26. Nature fetch redirected to an inaccessible identity host; PMC returned a bot-check page. Experimental setup/Figs. 2–4 support the two regimes; Methods gives approximately 79% water / 20% glycerol / 1% dish soap by volume. The cited −6.5°C is a formulation-specific reference adopted in the paper (its Methods neglect soap's effect when using the water/glycerol literature value), not our measurement. The page's time, six-branch geometry, transport and stop height remain deliberately prescribed, not reconstructed data. No newly invented quantitative physics was added.

See `../specs/reviews/frozen-bubble-learning-20261026.md` for the current verification and before/after evidence. The earlier verification report describes the baseline, not this revision.

Integration cold-reader correction: English storyboard directions must use the exact visible button label “Grow”, not “Growing”; include instruction-to-control label agreement in teaching acceptance.

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

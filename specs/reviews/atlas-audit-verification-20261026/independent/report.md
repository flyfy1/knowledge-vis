# Round8 independent static coverage and graph audit

## Verdict and scope

REUSE existing courses. Do not expand the spring lab or add nodes mechanically. Recommend two small data-only repairs below. This is a static/source/CLI audit; it is not a rendered accessibility, deployed-site or whole-course scientific certification.

Inspected actual `pages.config.js`, course directories/initial markup, atlas data and relevant source sections. HEAD at the audit snapshot is `4e261033`. No repository edits or browser processes. LeetCode was excluded before file traversal; no process inspection, push, deployment or new permission was requested.

## Directly established inventory

- 55 non-LeetCode registry entries overall. This independent lane selects the four explicit registry categories math, physics, signal and probability: **45 registered-live local entries**, including the atlas itself. Every target `index.html` exists. Categories: math22, physics9, signal10, probability4. Stages: primary8, junior11, senior7, university19. This proves local file availability and registry status, not public delivery.
- Actual atlas data: **35 nodes,45 relations,eight routes,five groups**. All relation endpoints, route stops and background IDs inspected are valid. Adjacent route stops have a relation when checked as an editorial connection, without requiring that its arrow follow route reading order.
- Relations:20 application,8 representation,9 foundation,8 connection. No directed cycle currently exists. That is an observation, not a proposed validation rule: these are explanatory relations, not a prerequisite DAG. For example work's route reads work-energy then net-force while the explanatory arrow goes net-force→work-energy; this is not a broken route. The UI explicitly says route order is suggested and map arrows do not impose prerequisites.
- 31 node sources point to16 distinct local courses; four point externally. The other registry entries are not thereby broken or required to become graph nodes. The atlas declares curated partial scope.
- 85 source references across nodes, relations, help and route notes:66 local,19 external. All66 local file/anchor targets were resolved statically or, for power-converters, by the actual generated `section(n)` constructor and explicit section0…6 calls. No confirmed missing local graph anchor.
-560 literal local href references in the selected courses' `index.html` / `i18n.js` resolve to existing files and supported anchors.182 literal local JS/CSS asset references exist. Dynamic URLs, browser redirects and external availability were not validated by those counts.

`inventory.json`, `local-links.json` and `assets.json` are the supporting machine-readable records. `coverage.md` enumerates the selected entries and their existing direct node sources.

## Highest-value minimal repairs

### P1: connect the existing complex node to its actual local interactive lesson

Evidence:

- Registry has `complex-numbers/`, status live, stage senior, category math; its actual `index.html` has step0…6.
- Atlas `complex` still uses external OpenStax10.5 as its sole node source. `app.js` consequently renders the external-reading/no-interactive-lesson message for this node, even though an appropriate local interactive course exists.
- Actual `complex-numbers/#step4` is titled multiplication = modulus multiplication and angle addition. It includes the modulus1,60° rotate-only preset and bilingual text that a unit-modulus multiplier rotates without scaling. This directly supports the current node's multiplication/rotation definition. Step1 separately establishes the unit-circle `(cosθ,sinθ)` correspondence.

Minimal proposal: change only the complex node source to `../complex-numbers/#step4`. Keep the unit-circle→complex relation's existing external OpenStax source as independent textbook support. No node, route, model, framework or course change is needed.

Acceptance: atlas selects complex, renders the local interactive action rather than the incorrect unavailable message, opens step4, and source-document Back preserves graph/route context. Check Chinese/English and the actual rotate-only preset. Merely changing the URL string is not final acceptance of the new user path. This review inspected destination source, not the rendered course behavior.

### P1: align the sine→oscillation relation with its physical model

Evidence: its Chinese reason still says "无阻尼、无外力", immediately followed by `x″+(k/m)x=0`. The actual English says "An undamped, unforced ideal spring"; **unforced is standard correct terminology for no applied driving**, so English is not independently a no-force error. It can be clarified for bilingual parity, not presented as a separate scientific defect. The canonical oscillation node now correctly says no sustained driving and explicitly keeps restoring force. Actual MotionModel at the default initial position has x=.6m and spring force−2.4N. Thus the Chinese absence-of-external-force wording contradicts both its own force law and the canonical clarification.

Minimal proposal: use "无阻尼、无持续外力驱动（回复力仍存在）" and "Without damping or sustained driving, with the spring restoring force still present". Keep the equation, relation type, source and graph topology. This is an existing explanatory-data correction, not more spring functionality.

Acceptance: inspect both rendered relation reasons, confirm the unchanged equation/source and no categorical claim that a free oscillator has no forces. This should not change model values or any interaction state.

## Scientific and boundary observations

Current relationship qualifiers inspected are generally careful: Laplace→Fourier requires an ROC containing the imaginary axis; covariance eigen-directions are scoped to covariance matrices; Bayes→Kalman states linear/Gaussian assumptions; sampling is band-limited; finite-variance iid assumptions accompany the mean/Monte Carlo statements. Response distinguishes continuous forced displacement from normalized bandpass and free transients. Work distinguishes block net work from block-plus-spring energy and does not invalidate the general net-work theorem when adding other forces.

Existing external sources are16 OpenStax references and three DSP Guide references. These are primary textbook/author references appropriate to the claims, but their current remote availability/content was not freshly fetched in this static-only lane. A local source anchor existing does not prove every pedagogical claim in the target lesson. Independent UI/model evidence from rounds1–7 remains bounded to those tests; README acceptance claims were not substituted for this audit.

## Interaction/accessibility baseline: what static evidence can and cannot say

All45 selected initial HTML documents contain language, viewport, H1 and bilingual-control hooks. The initial markup contains354 canvases;72 carry a literal role or naming hook counted by the conservative scanner. **This is not a count of 282 accessibility failures**: names may be set dynamically, adjacent numerical alternatives can matter, and the scanner does not establish usable keyboard operation or meaningful names. Power-converters also builds its lessons dynamically.

Rendered keyboard/focus, dragging alternatives, native labels, contrast,320px/200% wrapping, forced-colors, Back/reset and semantic alternatives need actual UI checks. Parent's serial global browser lane owns that baseline. Static results should appear separately from its outcomes in the night index, not be merged into an unsupported all-site accessibility pass.

## Deferred / next audit candidates

- P2 semantic deep-link refinement: eigen node currently opens eigen#step4 (orthogonality/diagonalization) rather than the basic eigenvector exploration atstep1. This is not a nonexistent anchor; any change needs a learner-entry decision rather than automatic URL repair.
- P2 catalogue alignment: atlas registry description still starts at waves/circuits/systems/measurement while atlas's actual introduction includes mathematics and motion. Update when editing that specific shared metadata entry under concurrency guards; no need to rewrite the registry.
- P2 model-domain clarity: the impulse node uses discreteδ[n] while the general frequency-response node writes continuousH(iω); the relation itself mentions integrable or summable conditions and links discrete DSP material. A future short distinction between H(eⁱω) and H(iω) could reduce domain confusion. No mathematical relation was disproved here, and a new z-transform node is not a mandatory remedy.
- The computing-category `gradient-descent` is also a mathematically relevant cross-category course with a local index; it is outside the four-category count, not absent from the site. Coverage opportunities such as local optics, standing waves, z-transform, entropy and school mathematics are real unrepresented subject areas, not broken map links. Choose one concrete learner task before adding concepts or routes. Avoid another cluster of spring views to compensate for unrelated coverage gaps.

The highest-return slice is to reuse the existing complex lesson and correct the one physically misleading relation sentence. Broader onboarding, new graph ontology and legacy-course repairs are deferred until their own evidence supports scope.

## Audit-fixture transparency

The first inventory draft resolved registry paths relative to atlas instead of the root, and treated dynamically generated power step anchors as missing in initial HTML. Both scanner errors were corrected before drawing conclusions; the final inventory reports all45 entry files and verified dynamic anchors. No missing-page/anchor claim from that draft is an application finding. No repository mutation occurred during the audit.

Final quote check: Chinese sine→oscillation is the force-wording defect. English actual wording is “unforced”, already technically correct; this distinction was communicated to the parent before implementation.

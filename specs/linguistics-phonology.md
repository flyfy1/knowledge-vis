# Linguistics Phonology visual spec

## Scope and model
`linguistics-phonology/` is a static, dependency-free bilingual lesson. Its single teaching arc is articulation → phonemic contrast → syllable constituency → contextual allophony. Pure model data lives at the top of `app.js`: `SOUND_DATA`, `PAIRS`, `WORDS`, `pluralSurface`; rendering is an adapter over those values.

The page intentionally uses English examples (`/p b m t s/`, pat~bat, cat/splash/spring, plural /s/). It is an introductory model, not a full phonetic transcriber. `/ /` labels phonemic categories; `[ ]` labels the displayed surface realization. Voicing means vocal-fold vibration, not loudness.

## Interaction contract

| step | control | derived visible result |
| --- | --- | --- |
| 0 | sound buttons | mouth diagram, tongue/lip posture, vocal-fold animation, feature rows, localized readout |
| 1 | minimal-pair tabs | two word/meaning cards, changed-feature readout and endpoints |
| 2 | word buttons + segment buttons | onset/nucleus/coda colored slots, selected segment outline, localized explanation |
| 3 | root/suffix selects + replay | underlying / / → assimilation arrow → surface [ ], plural word, rule readout |
| 4 | quiz options + new question | disabled answer set, correct/incorrect feedback, new question index |

Every state has a text readout in addition to color or motion. Language changes re-render all state while keeping selections. Navigation uses `#step0…#step4` deep links and an IntersectionObserver active state.

## Boundary and regression checks

- `featureSummary`, `minimalPair`, `syllableSlots`, `pluralSurface` must stay pure and deterministic.
- `pluralSurface('voiceless','s')` and `pluralSurface('voiceless','z')` surface `[s]`; voiced roots surface `[z]`; underlying suffix selection remains visible in the first node.
- Selected syllable segment must be within the chosen word; onset/nucleus/coda partition must cover every segment exactly once.
- Chinese and English must expose equivalent causal explanations; no essential step is text-only because the mouth, pair, slot, and rule visuals carry the state.
- Controls remain usable at 320px and keyboard focus; reduced-motion users still see static states.

## Deferred / excluded

No audio claims, dialect coverage, acoustic waveform, external assets, network fetch, learner telemetry, or production registration. `pages.config.js` is updated centrally by the integrating task.

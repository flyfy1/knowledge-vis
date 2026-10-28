# Action potential visual spec

## Learning contract

The learner should be able to say: “A stimulus is not encoded as a taller spike once threshold is crossed; Na⁺ positive feedback creates a stereotyped spike, K⁺ efflux repolarizes it, and the refractory period limits the rate.”

## Interaction contract

- Step 0 exposes stimulus, threshold, and time-window sliders. The waveform, peak voltage, response type, and threshold latency update together.
- Step 1 exposes a time cursor and leak control. The waveform marker and Na⁺/K⁺/leak state cards update together.
- Step 2 exposes input frequency and refractory period. The canvas shows input ticks and accepted spikes; the readouts expose counts and the theoretical ceiling.
- Step 3 provides a bilingual misconception check.

## Accessibility and resilience

- All sliders have visible labels and outputs, canvas elements have descriptive `aria-label`s, and buttons have keyboard-visible focus rings.
- All hit targets are at least 44–48 px on narrow screens. The layout keeps a single column below 680 px and has no intentional horizontal overflow.
- Pure model functions are exported from `app.js` so a Node smoke test can validate the biology without a browser.

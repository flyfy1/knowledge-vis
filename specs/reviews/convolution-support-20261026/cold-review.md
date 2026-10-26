# Convolution S2 independent cold UI review — completed

2026-10-26. Verdict: **no mustfix found in the bounded S2 walkthrough**. All owned Chrome instances closed (`CLOSED`, exit 0); root was notified before archival writing. No product edits, source/spec/BRIEF/test reads, app globals, external pages, or audio review.

Method: AI page walkthrough from rendered text, accessible names, native controls, actual keyboard/tap actions and viewport screenshots. This is not human learning research or a claim of learning effectiveness. Preview: `http://127.0.0.1:18949/convolution/#step2`.

## Prediction and observation

Before acting, I predicted from the displayed default f=[1,2,3,2,1], g=[1,0,−1]: y[0]=1, y[2]=2, y[3]=0, y[6]=−1. For fixed n, increasing k decreases j=n−k: that is the reversed kernel followed by translation. Valid pairs require both stored index ranges; outside them zero extension contributes zero, with no circular wrapping. Index overlap does not imply nonzero product or nonzero sum.

- Original Step using Space/Enter showed n0 multiplication, then its sum, then n1 flipped/aligned stage. Slider Home/arrows/End selected n0/2/3/6 and revealed the corresponding computed output. Default n2 had k0…2 products −1,0,3; n3 had k1…3 products −2,0,2. Its visible figure had three aligned cells and a selected zero output, matching the equation/list; it was not drawn as empty overlap. n6 had only k4→j2, product−1. Edges have one valid pair, these interior cases three.
- Before editing f[0], predicted n2=−1.2345+0+3=1.7655. Native number field accepted `1.2345`, Tab/blur retained the raw value. Editing reset the current calculation to n0; explicitly selecting n2 then displayed 1.7655, with −1.2345 in the numeric list. The page explicitly distinguishes approximately two-decimal canvas overview from up-to-nine-significant-digit detail; no precision contradiction found.
- Actual local Knowledge Index navigation → browser Back → explicit reload retained the decimal field and visible S2 state. A second check at selected n2 preserved the full S2 text and native input values on both Back and reload (including 1.2345 and y2=1.7655). Reset restored defaults and paused state.

## Bounded accessibility and visual observations

EN390: native named slider, Home/End/arrows, Step Space/Enter, Reset Enter. ZH320: translated field/slider names and text; native field tap, decimal entry, Tab and slider keyboard. EN390 and ZH320 had actual computed DOM font sizes and pixel line heights doubled, scoped to S2; each document width equalled the viewport (390 and 320). ZH used forced-colors active and reduced-motion reduce. Waited >200ms after text resizing for the debounced redraw.

Reviewed viewport captures: normal EN n3 figure clearly distinguishes reversed kernel, products and selected zero; doubled EN detail and doubled ZH decimal list wrap legibly without numeric truncation. ZH high-contrast figure retained visible aligned cells/output and focused slider. Canvas labels remain overview-sized; no claim that internal canvas glyphs doubled. Long text/list requires ordinary vertical scrolling at 2×.

## Evidence and limits

Own scripts/transcripts: [initial-ui.json](cold-ui/initial-ui.json), [tasks-ui.json](cold-ui/tasks-ui.json), [final-narrow-ui.json](cold-ui/final-narrow-ui.json); scripts alongside them reproduce only local UI actions.

Viewport screenshots (all visually inspected): [EN cancellation](cold-ui/EN390-cancel.png), [EN doubled list](cold-ui/EN390-2x-detail.png), [ZH doubled high-contrast figure](cold-ui/ZH320-2x-HC-figure.png), [ZH doubled decimal list](cold-ui/ZH320-2x-HC-decimal-list.png).

No full-course, continuous-play timing, exhaustive input validation, screen-reader speech, real device, OS/browser zoom, or complete locale/device/media cross-product certification. No source review was needed for an actual UI issue. No empirical learner claim.

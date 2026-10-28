# Photosynthesis scrolling and fallback acceptance · 2026-10-26

Scope: this page only. Developed by Codex; existing teaching model and six-step structure remain comparable to a future Claude version. No shared attribution, index, deployment or LeetCode changes.

## Root cause and delivery boundary

On 2026-10-26 the public `https://visual.integ.life/photosynthesis/app.js` differed from the fetched Codex delivery base `1d90150cf9c1db194769dff92dc4178ce7779fb0`. The public script still read `canvas.getAttribute('height')` on every fit, then wrote `canvas.height = height * DPR`. `height` is the same backing-store attribute, so a DPR-3 device grew the CSS canvas 300 → 900 → 2700 → 8100 px after three redraws. Android browser chrome resizing and the bubble animation can repeatedly trigger that path. This is a canvas sizing feedback loop, not a scroll reveal transition.

The delivery base already cached CSS height. This change makes CSS the explicit layout source, adds resilient reading/Canvas fallbacks, and hardens animation lifecycle. The integration owner must publish all four page assets together. Versioned page-local asset URLs avoid reusing older cached JS/CSS after the new HTML arrives. No deployment is performed by this task.

Downloaded public script SHA-1: `b1e27b2022333f53aae0398cf1dabc8f2ec48d28`.
Base app SHA-1: `fa402ee4f939e342ad2f0197bb839ab94d9fcf1b`.

## Required behavior

1. CSS fixes each educational canvas at 300 CSS px. Drawing measures its CSS rectangle; bitmap width/height never control layout. DPR 1/2/3 and repeated resize/input/animation draws must be idempotent. Canvas buffer height is 300 × capped DPR (maximum 3).
2. All six sections remain in normal document flow. No scroll-triggered hiding, pinned spacer, or viewport-height placeholder may hide a lesson. Full scroll at widths 360, 393, 412 and desktop 1440 must have meaningful text or diagram content in each sampled viewport and no horizontal document overflow.
3. One pending bubble animation frame at most. Reset cancels playback and clears count/bet; scrolling away (where IntersectionObserver exists), pagehide, hidden documents and reduced-motion preference changes pause playback. No autoplay, including reduced motion. Explicit Start remains available as a learner opt-in experiment; reduced motion also disables smooth anchor scrolling.
4. Animation does not rebuild bet buttons each frame or steal focus. Input controls, equation source selection, both quizzes/reset and zh/en switching stay functional.
5. Core Chinese lesson text, equation, summary and links are authored into HTML. No JS or a failed app script still yields a readable lesson; Canvas failures show explanatory text while rate sliders and quizzes keep working. Missing IntersectionObserver only disables optional navigation highlighting/visibility observation.
6. Refresh at a section anchor, navigation to a related lesson and Back must retain a usable page; orientation and mobile browser-height changes must not expand canvases.
7. Visible bilingual Codex attribution uses the shared [edition contract](../specs/visual-page-provenance.md) with one header disclosure, source revision3e1c2f43 and scope limited to scrolling/compatibility. Preserve and explicitly disclose prior Codex/Alberto/Claude Code contributions. Do not add a second badge. Preserve the prior model/formula.

## Verification

Run a static server at the worktree root, then:

```sh
NODE_PATH=/path/to/existing/node_modules node photosynthesis/tests/browser.cjs
```

`PHOTO_BASE_URL` overrides localhost port 18843. `PHOTO_EVIDENCE` overrides the evidence folder. The test uses installed Chrome through Playwright, with mobile touch/DPR emulation, not a physical Android device. It saves full-page scroll viewport screenshots, per-scenario finale screenshots, and measured results. It includes actual CDP touch swipes, resize/orientation, rendered readout assertions and fallback scenarios.

To replay the historical failure, supply the downloaded old public script as `DEPLOYED_APP=/path/to/app.js` and run `tests/reproduce.cjs`; the harness loads the exact delivery-base HTML/CSS/i18n with that old script. The saved reproduction is explicitly a local asset replay, not a physical-device result. Do not run an unbounded animation with that script; only three resize events are needed.

Independent review and physical Android validation remain with integration/review; current results are Codex self-check.

## Teaching-continuity follow-up (2026-10-28)

The repaired scroll path remains unchanged. A small Codex follow-up adds an explicit bridge
above the step-1 ledger: the step-0 bubbles are identified as oxygen, then the learner is told
to click `6 O₂` before `6 H₂O` to trace the product back to its source. The bridge is authored
in both languages, stays in normal document flow, and is covered by the page browser suite;
it does not change the equation, model, canvas lifecycle, or fallback behavior.

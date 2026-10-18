# Power converters and shared lesson shell verification

2026-10-18. Accepted design: power-converters-design-review.md and physics-ui-audit.md; implementation briefs archived. Independent reviewer acceptance: 56/60, no required open findings. No claims of physical hardware or measured learning outcomes.

## Local evidence

- Pure teaching model: 3,660 assertions across 192 allowed converter cases. Independent midpoint integration checks zero capacitor charge change and volt-second balance, periodic positive current, energy and input/output powers. Signed ideal component pulses cross zero without clamping.
- Independent fresh learner reviewer: 1,160 numeric/state assertions plus cold walkthrough, EN/zh, 320/390/640/1440 layouts, keyboard, denied storage, forced colors, CSS 200% zoom and diagram direction/geometry. Scripts and screenshots are archived.
- Root browser acceptance: 8 language/width combinations (320/390/768/1440), direct chapter anchors, parameter-reset notice, pulse history/reset, power-budget prediction/reveal/efficiency/reset, locale preservation, readable graph axes and map→lesson→map flow; no browser errors.
- Expanded atlas regression: 294 checks, 31 concepts, 40 sourced connections, 5 regions, four routes; EN/zh and320/390/768/1512; no external runtime requests. Counts and columns follow actual group data. Physics & Circuits is registered in the homepage category registry with its first lesson.
- Legacy shell independent audit: all 8 baseline symptom checks, 116 settled anchor cases, 78 locale/layout states, 64 hidden-tab/resize cases pass. Existing APIs and simulation state remain local to each lesson. All 13 routes retain their existing curriculum content.

## Confirmed UI diagnoses

Sampling's lazy canvas fit changed document geometry after native anchor destination calculation. Reserving each authored display height in HTML removes the cause. Fourier links inherited browser-default blue (2.01–2.06:1 contrast); shared accent styling restores contrast. Phone headers failed to shrink/wrap their title columns; both existing header structures now wrap. Active nav classes did not reveal their horizontally clipped item; shared observer scrolls the nav alone, preserving document position/hash/focus. Shared control sizing/focus makes the same interaction contract available on all 13 routes.

The screenshot's specific Fourier hash mismatch/right shift did not reproduce after layout settled. No speculative timer or forced hash scroll was added.

## Boundaries

These are browser simulations and an analytical ideal periodic CCM converter model. Output ripple, startup, DCM, switch losses and feedback dynamics are intentionally not solved. CSS zoom is not native browser zoom. No physical phone or screen-reader speech session. Deployment evidence is recorded separately after live checks.

## Production follow-through

Release 9806e40 deployed from a Git archive to the existing Pi static root. All 17 existing touched runtime files matched their pre-release committed baselines; six files were additive. Backups and a receipt live outside the served root under `/home/songyy/projects/.visual-releases/9806e40/`. All 23 public response bodies matched committed SHA-256 hashes. Public legacy symptom regression passed 8/8.

The initial public map-link browser check failed its fixed 150ms URL assertion once. A separate instrumented fresh browser confirmed 31 nodes, correct Boost detail/link, and correct destination immediately after click and after settlement. No reproducible product link defect was found. The acceptance test now waits for the requested navigation event rather than assuming network completion after 150ms.

Public static JS responses declare `Cache-Control: max-age=14400`. Atlas asset URLs and the homepage registry URL are therefore versioned for this release, so returning browsers request the changed content instead of retaining older data for four hours. This is a confirmed cache-lifetime release requirement, not a claimed diagnosis of the single transient URL assertion.

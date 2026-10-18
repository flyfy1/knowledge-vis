# Mathematics and physics atlas verification

Date: 2026-10-18. Implementation reviewed independently after the first learner walk.

## Findings and resolutions

- Complex rotation source did not teach the stated algebra: replaced with OpenStax
  polar complex numbers and DSP Guide chapter 31; external-reading labels are explicit.
- Pole/frequency-response source pointed to a different concept: replaced with DSP
  Guide chapter 32, page 18, and added the imaginary-axis convergence condition.
- DFT padding caveat exceeded the linked lesson explanation: removed from this slice.
- Map region filter was unclear: region selection switches to filtered List; a manual
  return to Map explicitly labels nonmatches and explains the retained context.
- Stacked Map selection hid the explanation below the viewport: now focuses and
  scrolls to the detail heading, matching List navigation.
- A long expanded sidebar obscured overview: native relation disclosures show one
  initial explanation and preserve expanded state on language switching.

Independent follow-up found no remaining blockers in those corrections.

## Evidence

Run: `NODE_PATH=<bundled node_modules> node atlas/tests/browser.cjs` against
`http://127.0.0.1:18769`. Chrome headless, 237 assertions plus equality checks passed:
24 concepts, 28 relations, 3 routes; every internal source responds and contains its
specified anchor; both locales; all node definitions; Fourier search -> theorem
source -> return -> convolution exploration -> browser Back restores search.

Also checked: 320/390/768/1512 widths; no page overflow; 200% text sizing;
120-character unbroken title; keyboard selection/disclosure; focus in forced colors;
reduced motion; language preserves disclosure/selection; invalid-node recovery;
blocked localStorage; no-JavaScript fallback. No observed page errors or remote
atlas runtime asset requests. Visible controls at 390 and 1512 meet 48px targets.

Screenshots and machine-readable results: `math-physics-atlas-evidence/`.
Human inspected Chinese desktop and English mobile renders. Core text contrast is
at least 9.47:1 across its specified backgrounds; action text 11.32:1; the control
border was raised to #596d85 to exceed 3:1 against the panel. CSS is below 10 KB;
no runtime dependencies, images, fonts, or trackers are fetched remotely.

## Boundaries

Browser success proves the navigation loop, not better comprehension or retention.
No physical-phone, screen-reader speech, or real learner comparison was performed.
External textbook links are evidence destinations and require network access.
The actual coverage is waves, systems and measurement, not a full physics course.
Unrelated pre-existing pythagoras modifications were preserved and excluded.

## Public release

Published clean tracked revision `ed48a98dc7fe2552eb89cfcb98f7253c5b0ea7e6` to
`https://visual.integ.life/atlas/`. Only the four atlas runtime files and the root
index/config were deployed. Before replacing root files, their live hashes matched
the previous tracked revision. Their previous bytes remain outside the served root
at `/home/songyy/projects/.atlas-releases/ed48a98/before`; receipt and release tar
are alongside it. No unrelated lesson bytes were deployed.

All six public asset SHA-256 values match the committed release. A public Chrome
walk verified homepage entry -> atlas -> search -> convolution -> supporting
`/convolution/#step6` -> Back, plus default mobile List at 390px with no horizontal
overflow or observed page errors. The first smoke script counted nodes before
navigation/deferred-script completion; waiting for the rendered node fixed the
harness timing, with no product change. Public evidence is in `public.json` and
`release.json`. Source and verification commits were pushed to origin/main.

Rollback: restore only `index.html` and `pages.config.js` from the retained backup
if their current hashes still match this release; the additive atlas directory may
remain reachable by direct link. Check current ownership before any later rollback.

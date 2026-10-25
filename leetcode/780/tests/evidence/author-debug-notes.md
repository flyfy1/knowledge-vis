# Author-only debug history

These are author observations, not separate review findings or acceptance.

- An early browser harness asserted fallback visibility immediately after the async clipboard click. It raced the completion. The final harness waits for the fallback to become hidden. Native clipboard and source equality assertions were retained.
- The harness used a URL string named URL, shadowing the constructor. Corrected the constructor reference to globalThis.URL.
- Early full-stage captures included the sticky nav painted over the top of a taller-than-viewport stage. Final stage-only captures suppress navigation only during capture; viewport screenshots retain it. Actual anchor geometry is separately checked.
- A subsequent meaningful geometry assertion exposed keyboard anchor scrolling: at 320px, focus the related #step1 link then Enter; URL became #step1 but target top ended at -4940.15625px (nav bottom 70px). Screenshot anchor-debug.png is PRE-FIX AUTHOR EVIDENCE, not the final UI. Waiting for focus and scrolling to settle did not repair it (top -6858.90625 in another run); mouse clicking #step2 landed at 99.9375px. Local html scroll-behavior:auto repaired the same keyboard sequence: #step1 top 100.09375px. Final browser.cjs asserts target geometry for both local related links over zh/en/zh at 320px.
- Native selector labels were shortened to coordinate pairs; scenario descriptions remain in full directly below them. Final checks measure every selected label in both languages at every tested width, including padding and a Chromium-specific 20px arrow allowance.
- Trace histories now use deep snapshots; the final numerical test mutates a nested coordinate in the last frame and asserts all earlier frames remain unchanged.

- Final visual inspection caught shared .btn.primary background taking precedence over the generic button:disabled rule. The lesson override now uses button.btn:disabled, with an endpoint background assertion rejecting the prior cyan appearance. Final large-number screenshots show the disabled Next control in the muted style.

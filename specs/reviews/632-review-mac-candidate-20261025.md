# Dispatcher Mac candidate verification — #632

Exact candidate: f9bf187027ca6851735c3b337e2ef39c8fee5545. This platform check is
separate from the currently running independent lesson review and does not record
acceptance. The frozen lesson and shared runtime bytes match the Git snapshot.
No candidate files or assertions were changed.

On native Mac Chromium 151.0.7922.34, the original browser and accessibility
scripts passed: 32 recorded interaction states, both languages, reversible traces,
prediction changes, source display/copy/fallback/download parity, keyboard controls,
offline source, blocked storage and local asset checks. All closed preset labels
fit at 320px, controls met measured minimum sizes, and the 390px plus 200% CSS zoom
checks passed. Combined CSS is 11,483 bytes. Canonical and core checks passed
8,744 inputs and 31,729 intermediate frames, including 7,239 exhaustive inputs,
1,500 seeded cases and maximum-shape [3500,50] fixtures.

Inspected the English 320px populated rows and selected preset and the Chinese
200% zoomed trace. Selected cells retain their value and visible selection text;
rows wrap, the selector label is complete, and candidate/best readouts remain
separate. These are sampled desktop-browser states with emulated widths/CSS zoom,
not physical-phone, novice teach-back or public-delivery evidence.

Evidence: [mac-candidate-f9bf187-20261025](632-evidence/mac-candidate-f9bf187-20261025/).
The original test_core.py, browser.cjs and accessibility.cjs ran in that order with
OUTPUT_DIR redirected and PREVIEW_ROOT pointing at a temporary frozen-archive
server. The archive and temporary server never replaced the active lane checkout.
A later candidate revision requires checking which of this evidence still applies.

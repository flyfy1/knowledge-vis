Unfrozen author test development: first numerical run used a manually typed expected
36 for [1,2,4,5]; the independent subset oracle reported 32 and canonical returned
32. Gap calculation 1*7 + 2*9 + 1*7 = 32 confirms oracle. Corrected only the test
fixture to 32; no runtime or learner claim had used 36. This is a harness correction,
not a canonical algorithm defect or independent review finding.
First browser harness run completed EN native manual clipboard transfer, then
asserted the fallback was hidden immediately after starting async clipboard copy.
The assertion raced the awaited clipboard receipt. Harness now waits for hidden
state before retaining the same assertion. No runtime change for this correction.
The second browser harness reached layout screenshots and related links, then timed
out trying to sample a role-group color after returning to the initial empty-role
frame. Harness now populates the middle frame before measuring that branch.
Visual author inspection also found stale sticky-navigation highlighting after
zoom. Before freezing, replaced section-entry-only observer with scroll/resize
selection from the actual section geometry. Button/select boundaries now reuse
--muted for visible contrast; shared assets and palette remain unchanged.
Before freeze, focus contrast sampling incorrectly treated pointer focus as a
visible keyboard ring: computed outline width was 3px but style was none and
color currentColor. Diagnostic Chromium run confirmed actual keyboard Tab gives
solid 3px #ffb454. Test now activates keyboard focus and asserts solid style before
measuring. The unchanged color/range threshold is retained. Focused access fixture
also corrected handwritten partial -19 to independent terms -7-4+8=-3 (before
third term -11). No runtime numeric change was needed.

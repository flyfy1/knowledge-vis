# Author development observations (pre-freeze)

1. Initial core harness selected the 'use strict' directive instead of the copy
   assignment AST node. Corrected the harness to find AssignmentExpression;
   duplicate-key checking then passed. This was a test defect, not a lesson defect.
2. Screenshot inspection found the disabled primary Next button retained the
   enabled primary fill. Added a local .btn:disabled rule with sufficient specificity.
3. Initial browser anchor test timed out: a rapid focus/Enter sequence combined
   with shared smooth scrolling left #step2 above the viewport after EN switching.
   Diagnostic: top=-4702.8125, nav bottom=70 at width320, hash=#step2. Local
   html scroll-behavior:auto removes the competing smooth-scroll lifecycle.
4. Added unchanged selected-text width predicate (text + 30px padding + 20px
   native-arrow reserve <=260px control at 320px). English hand example failed:
   225.3764+30+20 >260; official example2 measured 238.6245+30+20 >260.
   draft-long-select.png visibly shows the official-example2 label wrapping into
   a clipped second line. Shortened EN labels to retain preset identity, dimension
   and output while preserving the original width-budget predicate and 16px font.
   Rerun required before candidate readiness; draft capture is historical evidence.

5. Supplemental focused-screenshot harness initially advanced to the column-target
   frame rather than the first row-swap frame, then retained preset3 into its second
   locale. Corrected the harness to use frame7 and explicitly select preset0 per
   locale. Main browser suite had already passed all presets and locale preservation.

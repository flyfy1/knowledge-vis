# Author visual inspection — 936-r1

Inspected final headless PNGs using the image viewing tool after the complete
runner passed. This is an author self-check, not separate acceptance.

- trace-320-en, stage-zh, trace-390-en/zh: official example 2 after queue pop 1.
  Board a????ca shows four outlined erased cells; visible a,c,a retain values.
  todo=[0,0,1,0], queue=[0,3], productive erasures=[1], erased=4/7. Cell indices
  stay under their letters when wrapped. Label/value pairs remain readable.
- trace-736-en/zh and trace-1440-en/zh: same snapshot; full board on one row,
  current-window label separate from blocker state; full preset label shown.
- hand-en/zh at 320: initial ???, undo disabled, 0/2 stamps; explanation and
  controls wrap. All question marks here denote unwritten cells in forward mode.
- skip-en/zh: ab/abab after third pop, i=1 contains only erased cells; two outlined
  question marks are visibly distinct from the other erased question marks;
  no-op explanation, todo zeros and productive order [0,2] agree.
- zoom200-en/zh: final ab/abab, answer [2,0], empty queue, 4/4 erased; readable
  text and controls at 200% CSS zoom. This is not native browser-menu zoom.

Full stage captures can intersect sticky navigation at capture-dependent scroll
positions. Focused screenshots retain the board, operation label and readouts;
this is a capture artifact, not a claim that the sticky overlay is hidden.
Other screenshots of the equivalent locale/width states were inspected in the
same author pass. No physical-device or learner-understanding claim is made.

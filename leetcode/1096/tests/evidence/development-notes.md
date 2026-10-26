# Author development findings

Initial browser run failed at 320px / CSS200%: selected expression {a,b}{c,{d,e}} measured94.704px against46px available with unchanged20px arrow reserve. Before screenshot development-select-before.png captures the native control. This is an author-stage responsive defect, not an independent review finding. Repair: short numbered example choices; complete selected expression gets its own wrapping labeled line beside the input tokens. No expression information removed. Original width predicate retained.

Second run: 320px/CSS200% live stack card had scrollWidth108 vs clientWidth96. English label “alternatives” did not wrap within the card. Preserved development-card-before.png. Repair applies anywhere wrapping to stack headings/labels and min-width:0 to set cells; original card overflow assertion retained.

Visual inspection of the no-overflow repair still found English “completed” and “concatenation” broken within words at320px/CSS200%. development-label-wrap-before.png retains it. Repair uses concise per-card labels “U · prior words” and “T · current words”; adjacent paragraph still defines completed alternatives/current concatenation in full. Narrow padding uses existing12/10/8px spacing values. Added a longest-English-label-word fit assertion, rather than treating no overflow as proof of readability.

Third browser run completed all preset/state/layout transfers, then the contrast harness timed out because it queried a disabled button after advancing to a frame where no button was disabled. This was a harness setup error. Repair completes the independent hand-pairing control before measuring its actual disabled style. No runtime behavior was altered for that measurement.

Final visual inspection also found the English title “Expansion” stranded its final letter at320px/CSS200%. Narrow H1 now uses24px (the existing hand-value size) instead of28px, retaining readable hierarchy and the full ID/title. A final full browser rerun follows this presentation change. This is documented as a local type role exception; no color/token was changed.

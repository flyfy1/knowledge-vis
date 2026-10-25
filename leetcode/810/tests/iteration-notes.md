# Author iteration record

All iterations below preceded the frozen candidate and independent review.
No previous acceptance or campaign state was changed.

1. First numerical run: canonical Python PASS (22,097 cases). The localization
   regex counted 83 keys but JavaScript held 82; the extra match was `macOS:`
   inside clipboard guidance, not a duplicate key. Repair: constrain the matcher
   to keys followed by array literals, verify key uniqueness before evaluation,
   and check every resulting value has exactly two nonempty strings.
2. First browser width budget failed at 320px/200% CSS zoom on the preset control
   holding [1,1,2]. Initial select padding was 15px each side; the control's
   available client width was 96 CSS px. The conservative 24px arrow reserve was
   retained. Reduced local padding to the existing 8px spacing value. All 16
   locale/width/zoom combinations then passed the unchanged width predicate.
   `fit-diagnostic.png` preserves the pre-fix screenshot of the narrow select
   (default [1,2]); it is diagnostic evidence, not the final candidate view.
3. Next browser run reached its final no-console-errors assertion and found a
   /favicon.ico 404 after keyboard navigation to existing lesson #51. Diagnostic
   navigation confirmed #810 and #782 have favicon declarations, #51 does not.
   No out-of-scope assets were edited. The runner now separately records console
   events from related destinations, asserts only that specific inherited favicon
   error is permitted there, and still requires zero errors on the #810 page.
   Related content and anchors load successfully in both languages.
4. Added execution of the displayed baseline itself (1,364 exhaustive cases),
   in addition to the independently derived minimax oracle for the submission.
5. After candidate-1 freeze, author state inspection found Reset disabled at the
   initial frame even when a future branch was retained after Undo. Candidate 2
   enables Reset whenever a future exists. A browser regression erases the unsafe
   2 from [1,1,2], undoes to the root, resets, and checks that Forward now chooses
   the safe 1 rather than replaying the discarded unsafe move. Candidate-1 hashes
   remain archived; candidate 2 requires its own separate independent review.

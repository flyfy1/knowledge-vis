# Ranked hypotheses before differential tests

The focused original predicate ran on actual Mac Chromium and exited1 in1.13s.
Only English preset4 at320px fails among14 locale/preset combinations:
219.574px text versus210px budget, with260px control,15px side padding and
unchanged20px arrow reserve. Original closed-select screenshot retained.

1. Label exceeds actual native selected-text space: shortening only the English
   failure label while retaining four-corner failure and −1 semantics will expose
   the entire result with margin and pass the unchanged predicate.
2. Reserve alone is overly conservative: original screenshot already has every
   character visible, while DOM and canvas agree; a deliberately overlong label
   will clip but the original will not.
3. Font measurement is wrong: a DOM span with the same computed font/text styles
   will disagree materially with canvas, invalidating the numerical inference.
4. Stale locale state causes it: EN→ZH→EN changes the label or measurements without
   any style/copy intervention; otherwise this hypothesis is rejected.

All interventions are temporary DOM-only diagnostics; no candidate file edits.

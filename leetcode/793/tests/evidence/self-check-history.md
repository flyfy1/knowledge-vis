# Author test history

Initial browser run passed numerical UI, bilingual presets, predictions, source,
clipboard and responsive checks, then failed a related-link harness assertion.
The test incorrectly required the literal word `partition`/`mid` from #4 step2.
Actual destination says `i+j=half`, describes cross comparisons, and offers the
cut-direction experiment. Inspected destination text and fixed the test to assert
its actual `i+j=half` / `aL` terminology; no destination or product repair was
needed. Original failure retained in browser-failure.json. A full subsequent run
passed. No independent review result is implied.

Before freezing: made the Chinese locale button at least 48px wide, removed
outline clipping on its group, aligned the trace default with the worked k=5,
and clarified the next-operation label. Final full checks rerun below/alongside.

Supplementary disabled-state probe found that shared `.btn.primary` specificity
kept cyan/dark styling on a disabled primary button, despite the local generic
disabled rule. Text contrast was readable, but the intended disabled palette
was not applied. Raised the local selector to `.btn:disabled` to apply the
existing muted-on-panel tokens. The final probe measures native computed styles
at real disabled endpoints. Also renamed bound labels to “current” because
phase-start frames have no completed comparison. This is an author correction,
not independent-review closure.

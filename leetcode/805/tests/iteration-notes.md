# Author check notes, 2026-10-25

Before the final browser run, the initial harness selected native numeric options
with Playwright's string shorthand. Since labels 1…7 overlap option values 0…6,
that shorthand matched the prior label in some cases. A diagnostic printed the
selected description for all seven cases. The runner now explicitly selects
{value: ...}; the original advertised-result assertion remains intact. This was
a harness correction, not a production select failure.

The second browser run reached the deep-link assertion after source, copy,
interaction and layout checks, then failed a fixed 600ms scroll delay. A separate
browser diagnostic observed step2 top at −683.8, 10.2, then 90.2px at 300ms
intervals; the sticky navigation bottom was 66px. The final harness waits for the
actual settled target geometry in 85…95px and asserts it clears the navigation.
No focus/scroll CSS was changed to hide the failure.

An author wording refinement changes the no-check message to “This frame performs
no missing-sum check” in both languages, so early-exit/final frames do not imply
that they are construction frames. The final complete suite covers this candidate.
No metadata repair or prior independent review result is involved.

A later evidence rerun ended with Playwright “Target page, context or browser has
been closed” while clicking handReveal. The cause was not established; it is not
counted as a pass. A temporary syntax error while adding an explicit resize event
to the CSS-zoom harness was corrected before execution. The final full run then
passed all original assertions, including source transfers and both locales.
CSS style zoom does not itself emit the native resize event, so the harness emits
resize and waits 150ms before its zoom screenshots. This avoids stale navigation
highlights/capture timing artifacts; runtime navigation code was not changed.
Final evidence is from the successful complete run, not the interrupted attempt.

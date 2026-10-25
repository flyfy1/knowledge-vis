# LeetCode 710: frozen candidate Mac verification and native-keyboard gap

Candidate: `9e47442d7ecf090f7b8f1905d7de5917a50661b6`. Root host-verification evidence: [mac-candidate-9e47442-20261025](710-evidence/mac-candidate-9e47442-20261025/). This is separate from the independent cold teaching review and publication.

All 156 exported lesson/shared/related-HTML files matched immutable Git bytes before execution and their receipt hashes remained unchanged afterward. Results were written outside the frozen export. Chromium 151.0.7922.34 ran on macOS.

## Results and preserved failure

The original Python suite passed 2,528 independent mapping cases, maximum n=10^9 / blacklist length 100,000 and 20,000 forced canonical pick calls. Exact ticket coverage checks the bijection; the seeded histogram remains only a smoke check. The original JS suite passed 2,032 cases, 14,771 intermediate states, 93 duplicate-checked localization keys and exact source parity.

The original browser run **did not pass**. At line 98, from preset 3, focused Home → ArrowDown → Enter expected preset 1 but observed 3. The original assertion and log are preserved. Earlier sequential assertions had passed: both locales/all six presets/all construction events and ticket outputs, undo/replay/reset/end, source mirror/display/native copy/download, all prediction choices and feedback invalidation, locale preservation, real Meta+C fallback after verified non-source sentinel, 320/390/736/1440 layouts and the explicitly CSS-based 200% reflow check. No final `browser-results.json` was produced. Later keyboard activation, target sizes, links, contrast, forced colors, offline and storage assertions in that script were not reached; do not count them as a passing full Mac run.

Ranked hypotheses before diagnosis were host-native keyboard automation behavior, application event interference, then focus loss. The targeted probe used the actual lesson and a fresh page containing only the exact select's outerHTML, with no application scripts or handlers. It set both to 3, focused each, and recorded focus/value after every original key. Both remained focused and at 3 throughout. This rules out app-only interception and focus loss for the reproduced sequence. The underlying Mac headless native-control automation cause is unresolved. No replacement `selectOption` was used to waive the failing keyboard assertion, and no product fix or original-suite success is claimed.

The untouched `accessibility.cjs` was then run separately and passed: all 24 closed selected labels with a 24-pixel arrow allowance, disabled-state contrast, and actual keyboard scrolling of the cumulative ledger and Python source pane. A separate native supplement captured longest labels at 320/390 in both locales, checked all 24 label measurements, and verified the distinct clipboard sentinel immediately before actual Meta+C and exact full-source readback after it. These results do not close the separate select-keyboard gap.

## Actual screenshots inspected

Inspected original `320-en-skip.png`, `320-zh-complete.png`, diagnostic `focused-domain-en.png` / `focused-domain-zh.png`, and both native `*-320-longest-native-select.png` images. At the skip event, the English view says candidate 4 is blocked, high advances 4→5, and the mapping stays unchanged; ticket 0 already maps to 3 while ticket 1 remains pending. The Chinese terminal view shows mappings 0→3, 1→6, 2→2 and ticket 1's theoretical 1/3 probability. Domain labels distinguish low/high and allowed/blocked without colliding; strikethrough and text reinforce membership. Both longest closed preset labels and native arrows are readable.

This records successful numerical/source/layout checks and the precise unresolved native-select automation limit. It is not full Mac browser acceptance, a public release, judge acceptance, physical-device verification, or evidence of novice comprehension. Independent review and its Linux browser scope remain separate gates.

# LeetCode 732: Mac verification and required contrast-test repair

Frozen candidate: `5307111adcf48808992cac7f3f242bc9f5728ffa`. Evidence: [mac-candidate-5307111-20261025](732-evidence/mac-candidate-5307111-20261025/). Root host verification is distinct from the independent teaching review.

## Required finding 732-MAC-R1: contrast checker uses an incorrect coefficient

`leetcode/732/tests/browser.cjs` computes green luminance with 0.7322. The [WCAG 2.2 sRGB definition](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance) uses 0.7152; the complete weights are 0.2126, 0.7152, 0.0722. The externally extracted original `lum` function returns 1.017 for white instead of 1 and 0.7322 for pure green instead of 0.7152. The preserved calibration test exits 1 against the unchanged frozen candidate. For #747474 on black, the checker incorrectly reports 4.5523281903546 (pass), while the correct ratio is 4.492948073111701 (fail). This is a reproduced verification defect, not a demonstrated low-contrast defect in the lesson palette.

Recalculation of the twelve actual foreground/background pairs recorded by the original browser suite yields minimum text contrast 7.078851579017443; the recorded focus and border pairs also pass their applicable thresholds. This supplemental recalculation does not repair the original test or establish complete state coverage. Preserve the original evidence; correct the calculation, add calibration covering primary colors, white/black and a threshold-straddling negative control, rerun the candidate browser checks and regenerate contrast evidence. A fresh independent reviewer must verify closure before import/publication. Do not silently replace or relabel the original passing report as valid contrast evidence.

## Original execution and visual evidence

All 154 exported lesson/shared/related-HTML files matched immutable candidate bytes before execution and remained unchanged after it. Outputs were written outside the export. All five original checks passed unchanged: localized copy, Python solution, JS core, browser, and final-ledger capture. Their contrast success is qualified by R1 above. Python checked 1,314 sequences and 7,034 calls against direct event membership; simulation checked 13,210 frames. The browser checked 212 rendered states, 17 screenshots, bilingual controls, rewind/reset/end, prediction, exact source transfer, keyboard/focus, responsive widths and explicit CSS-based 200% reflow. CSS totaled 11,566 bytes.

The supplementary native Mac run measured all five closed selected labels in both locales at 320/390 (20 measurements with a 24px arrow reserve), captured the longest labels, read a distinct clipboard sentinel before the actual host shortcut, checked full selection/focus and verified exact source after Meta+C. No candidate files were changed.

Actually inspected `original/en-320-trace.png`, `zh-320-final-ledger.png`, `en-320-header.png`, and both `native/*-320-longest-native-select.png`. The header clearly shows #732 and its official link. The intermediate operation separates endpoint updates from a not-yet-started scan. The final Chinese ledger has active counts 1,2,2,1,0 and completed returns 1,2,2 for [2,5),[4,7),[5,6). Longest native labels and arrows fit at 320px. The ledger intentionally scrolls horizontally; its rightmost column is not fully visible in the initial left position.

This report does not overwrite prior independent review history, establish judge acceptance, prove real-device/native browser zoom behavior or claim public delivery. Required finding 732-MAC-R1 remains open pending repair and independent closure.

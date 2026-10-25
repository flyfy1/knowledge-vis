# Author self-check — #964

Status: complete author candidate; independent review **pending**. No independent acceptance, deployment, online submission or learner-study result is claimed. Author: Codex (exact model identifier unavailable). The approved product/design review is reused; it is not a review of this implementation.

Executed from repository root:

- `python3 -B leetcode/964/tests/check.py`: passed; 12,005 canonical-vs-independent-recursion cases, 199 exact legal-expression optima, 3,636 independent intermediate signed-power cost checks. Includes all official examples, every x boundary family, exact powers and target maxima; deterministic seed964. Exact Python mirror and localization AST/pair checks passed.
- `node leetcode/964/tests/browser.cjs`: passed on local preview, Chromium 156.0.8078.4 / Linux. Both locales, all six presets, every forward/back endpoint and replay, reset/end, all three prediction options, reveal/change, locale after interaction, exact H1 and document identity, native keyboard focus, forced colors, reduced motion, guarded storage and offline embedded source. The final rendered preset results are asserted against 3,5,8,3,1,113. Official501's p14/n5 row is explicitly checked in both locales.
- `python3 -B scripts/register_leetcode_lesson.py 964 --validate-only`: exit0; recorded separately in metadata-preflight.json. This command is non-mutating; no registration performed.

Browser artifacts: browser.json contains 16 locale × width × zoom geometry cases (320/390/736/1440, zoom1/2), all 12 locale/preset results, six prediction meanings, measured select budgets, four related-link label/section observations, and ten measured text color pairs. Solid-color contrast minimum 7.744:1. Calibration checks black/white=21, exact RGB primaries and near-AA #747474. Focus color contrast exceeds3. Combined shipped CSS 11,196 bytes. No lesson console errors, failed asset responses or external runtime requests. Synthetic CSS page zoom2 is used, not a physical-device claim.

Automatic copy instrumented to check full bytes. In **each locale**, fallback seeds and reads a fresh non-source sentinel, forces automatic API failure, invokes the real control, checks exact textarea selection, presses Linux Control+C, and reads the actual host clipboard back. Complete source including terminal newline matches solution.py; displayed source and both real blob downloads match too. The baseline display is separate from the canonical source controls.

## Visual inspection

Viewed rendered PNGs, not only DOM metrics: en-header; en-320-z2-trace; zh-390-z1-trace; en-1440-z1-trace; zh-320-z2-predict; en-390-z1-predict; en-320-z2-controls; zh-320-z2-controls. The settled zh-320-z2-settled-controls capture additionally confirms selected value, x/target readout and wrapped controls without overlap. Values and labels remain associated; ledger is vertically scrollable at the smallest effective width. Native selected labels fit the recorded 16px arrow reserve on this Linux Chromium/font environment (smallest measured remaining margin4.1279px). No claim about an untested Mac font environment.

Related destination reading: #956 step2 explicitly retains largest shorter height per gap; #920 step2 groups playlist prefix counts by length and used-song count. Labels in both locales describe those distinct concepts. Preview responses and target sections exist; production availability is outside this author run.

## Author findings and corrections (not independent reviewer closures)

1. Code-element selection omitted final newline. Replaced fallback with readonly textarea; exact host clipboard transfer now passes both locales.
2. 320px zoom2 header overflow. Enabled local header wrapping; full geometry matrix now passes.
3. Over-nested ledger padding squeezed words. Reduced narrow local padding and compacted headings to defined k/r/power/S values; inspected populated rows after correction.
4. Long selected label `Official 501` visibly clipped at320px zoom2 (author-finding-select-before.png retained). Shortened English preset names; full input remains in the readout. All preset-label budgets now pass unchanged 16px arrow reserve. Final rendered Ex.501 and Chinese 官方501 inspected.
5. A forced-colors test tried to focus disabled Next, reporting no outline. Corrected the test to focus an enabled control through actual keyboard traversal; no runtime focus-rule change was needed.
6. Clarified that p/n are minima **restricted to processed powers**, and included the target1 constant work in complexity. Added numerical 8 derivation before symbolic transitions. Final checks cover the updated candidate.

No open author-detected defect remains. These are author fixes awaiting independent review; a separate reviewer must perform the cold walkthrough and six-dimension assessment. Real devices, physical browser zoom, public delivery, actual novices and LeetCode submission acceptance remain unverified.

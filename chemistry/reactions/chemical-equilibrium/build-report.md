# build-report · chemical-equilibrium
构建：Codex（gpt-6-astra，M5 pipeline clone）写完全部四件套，会话被容量中断于收尾；Alberto 收回文件收尾。
Alberto 收尾修正（1 处，必须级）：常数 C.window 45→90。原值下页面自身的 summarize().balanced 对默认种子运行给出 false（尾段斜率 -0.34 超过 settleSlope 0.3）——判定窗比模拟噪声还窄，读数会与「曲线走平」结论矛盾；窗口加倍后斜率噪声约降一半，复测全过。
验证（Alberto）：node --check 通过；i18n 104/104；探针 8/8（固定种子：平衡达成、正逆速率收敛、B 占比≈0.40 与 pF/(pF+pR) 一致、催化剂同终点且更快、加料后总数 160 再平衡、升温 B 占比升、纯 B 起步收敛同占比）。/tmp/chem-assert.js。
内容：6 步（动态平衡 → 速率相等达成 → 加料移动 → 温度移动 → 催化剂对照 → 终章）。概率粒子模拟（120 粒子、种子化 RNG），计数与速率全部模拟实测。
待：Claude 独立复审（排队中，见 Overlord 批次卡）。

## Fix pass (independent review)
Fixer: Claude (Opus via Claude Code), against /Users/songyy/claude-reviews/pair3.md §1. app.js rewritten in readable form (same four files, same i18n mechanism); i18n zh/en 115/115.
New constants: pForward .02 / pReverse .03 (K share still 0.40), chartParticles 240 for steps 1–4 (step-0 grid stays 120), rateWindow 30, settleSlope .003·N per frame (LS slope), catalyst ×2.5, tempForward .6 / tempReverse .2, crossFrac .8, addAt 150, pushWindow 60, endWindow 270.
- M1: the two bet buttons record `s0Bet`; the reveal shows `trueGuess` / `falseGuess` (plain Reveal shows the neutral conclusion). The chosen bet is highlighted.
- M2: particles now have identities (per-particle state arrays plus a `flips[frame]` list). Dots sit in fixed spots and change colour in place. A white ring is drawn only on the particles that converted this frame, and the full-canvas border is gone. The step0note text is corrected (zh/en).
- M3: the step-1 balance readout uses `firstFlatFrame(sim, f)` and only looks at data up to the current frame, so it shows "flat since frame X" or "not flat yet".
- M4: step-1 rates are 30-frame moving averages ending at f, and the readout labels the window. The rate overlay plots the windowed curves.
- M5: base probabilities were slowed (the median approach to 95% now takes 50 frames, 11.9% of the width). The step-1 chart is drawn only up to the current frame, so Play grows the curve.
- M6: the net direction is now f−r over the 60 frames after the push, compared with the same seeded run without the push. The counter-based RNG gives every particle the same random history in both runs. The readout shows the injected N (S4), f−r for both runs, and the mean A/B levels before and after. A green marker shows the push frame.
- M7: warming multiplies pF by (1+0.6T) and pR by (1+0.2T), so both rise and forward rises more. The step3e wording is aligned with this.
- M8: `balanceFrame` is now a threshold-crossing time: the first frame where the 5-frame mean of B has covered 80% of the way to its final level, so it has no window floor. The canvas overlays both runs' B curves with crossing markers. The readout prints the difference once, and the "same endpoint" / "endpoints differ" wording depends on d < 3 pp. Endpoints are averaged over frames 150–419.
- M9: each frame's transitions are decided against the state at the start of the frame, with a per-particle draw, so there is no shrinking loop bound and no same-frame A→B→A. Large-N shares match pF/(pF+pR) within 0.2 pp. The catalyst endpoint shift is 0.15 pp.
- M10: `onLangRefresh` re-renders every step. The toggle buttons keep their `data-i18n` key in sync with their state (Play/Pause, Show/Hide rates), so `applyLang` no longer resets them.
- SHOULD-FIX done: S1 (B-rich 1/4-A start instead of the 72/48 mix, which was already at equilibrium), S2 (step-3 comparison of all three temperatures), S4, S5 (legends laid out by measureText), S7 (probe kept outside the page dir, see below). Skipped: S3 (badge idiom, structural), S6.
Verification: `node --check` passes on app.js and i18n.js. The parity probe reports 115/115 keys, none missing or empty. The fix probe `/Users/songyy/claude-reviews/pair3-fix-probes/chem-fix.js` passes **38/38**: multi-seed checks (100–200 seeds) plus DOM/canvas-stub checks of the readouts, rings, growing curve, overlay and language refresh. Headless Chrome shows no console errors.
Note: the reviewer's `pair3-probes/chem.js` hard-codes the old API (120 particles, addAt 50, `C.tempDelta`, end-of-run summary used as the frame-0 readout, 95% of 48). Its remaining FAILs come from those assumptions, not from page behaviour. chem-fix.js re-derives each claim against the current API.

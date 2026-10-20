# build-report · chemical-equilibrium
构建：Codex（gpt-6-astra，M5 pipeline clone）写完全部四件套，会话被容量中断于收尾；Alberto 收回文件收尾。
Alberto 收尾修正（1 处，必须级）：常数 C.window 45→90。原值下页面自身的 summarize().balanced 对默认种子运行给出 false（尾段斜率 -0.34 超过 settleSlope 0.3）——判定窗比模拟噪声还窄，读数会与「曲线走平」结论矛盾；窗口加倍后斜率噪声约降一半，复测全过。
验证（Alberto）：node --check 通过；i18n 104/104；探针 8/8（固定种子：平衡达成、正逆速率收敛、B 占比≈0.40 与 pF/(pF+pR) 一致、催化剂同终点且更快、加料后总数 160 再平衡、升温 B 占比升、纯 B 起步收敛同占比）。/tmp/chem-assert.js。
内容：6 步（动态平衡 → 速率相等达成 → 加料移动 → 温度移动 → 催化剂对照 → 终章）。概率粒子模拟（120 粒子、种子化 RNG），计数与速率全部模拟实测。
待：Claude 独立复审（排队中，见 Overlord 批次卡）。

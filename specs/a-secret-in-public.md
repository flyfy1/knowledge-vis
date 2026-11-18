# a-secret-in-public · 修复记录

页面：[`computing/systems/a-secret-in-public/`](../computing/systems/a-secret-in-public/)。写作背景和来源见该目录的 `BRIEF.md`，评审见 [reviews/a-secret-in-public-review-20261118.md](reviews/a-secret-in-public-review-20261118.md)，登记信息见 [essays.md](essays.md)，未解决的问题见 [essays-status-20261119.md](essays-status-20261119.md)。

- 2026-11-18 登记（registrar，Claude Code，claude-opus-5-5）：正文提交 `1bfc5702`；登记、子主题、KNOWLEDGE_ESSAYS 和首个署名标签在 `046b13df`。11 章、11 个概念（`#ch1…#ch10` 加 `#mod`），图谱区域 computing，浏览器测试用 `ESSAY_BASE_URL`。缓存键：copy 脚本 `?v=20261118a`。
- 别名（2026-11-18，原则是原主留词，除非 HANDOFF 说这个词要搬家；`tests/concept-search.cjs` 钉住了新页面的落点和留给原主的词）：拥有 Diffie-Hellman（#ch3）、椭圆曲线（#ch5）、HTTPS / TLS handshake（#ch6）。让出（HANDOFF：这些词归原主）：模运算 / 钟表算术 / 费马小定理 / 欧拉定理 / modular arithmetic / clock arithmetic / Fermat's little theorem / Euler's theorem 留给 rsa-encryption #step3；裸 ECC 留给 how-memory-talks #ch8；裸 chain of trust 留给 how-a-computer-boots #ch8；Shor 算法 / Shor's algorithm 归 what-quantum-computers-do #ch7。`tests/models.cjs` 的「模运算一级」检查改为查这一级的标题和它独有的词（同余、congruence、finite field），不再要求裸词「模运算」。
- 交叉链接（2026-11-18）：ch8.p1 链到 what-quantum-computers-do #ch7，ch11.links 链到 what-quantum-computers-do；量子那篇 ch12.links 链回本页。how-a-computer-boots ch8.p2 和 ch14.links 链到本页。《网页是怎么来到你手机上的》仍是纯文字（草稿未登记）；`tests/browser.cjs` 现在只禁止链到这篇草稿，并要求至少两条量子链接。图谱边：what-quantum-computers-do #ch7 → #ch8（基础），#ch4 → how-a-computer-boots #ch8（应用）。

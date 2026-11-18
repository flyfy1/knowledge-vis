# how-a-chatbot-writes · 修复记录

页面：[`computing/ml/how-a-chatbot-writes/`](../computing/ml/how-a-chatbot-writes/)。写作背景和来源见该目录的 `BRIEF.md`，评审见 [reviews/how-a-chatbot-writes-review-20261118.md](reviews/how-a-chatbot-writes-review-20261118.md)，登记信息见 [essays.md](essays.md)，未解决的问题见 [essays-status-20261119.md](essays-status-20261119.md)。

- 2026-11-18 登记（registrar，Claude Code，claude-opus-5-5）：正文提交 `5f65e9f3`；登记、子主题、KNOWLEDGE_ESSAYS 和首个署名标签在 `046b13df`。9 章、9 个概念（`#ch1…#ch9`），图谱区域 computing，浏览器测试用 `ESSAY_BASE_URL`。缓存键：copy 脚本 `?v=20261118a`（其余脚本 `?v=20261118`）。
- 别名（2026-11-18，原则是原主留词，除非 HANDOFF 说这个词要搬家；`tests/concept-search.cjs` 钉住了新页面的落点和留给原主的词）：拥有 ChatGPT、ChatGPT是怎么工作的、聊天机器人、Claude / Gemini / DeepSeek / 豆包（#ch8），什么是token（#ch1），为什么AI回答每次不一样（#ch6），AI 幻觉（#ch9）。让出：「推理模型是什么 / what is a reasoning model」移到 what-a-frontier-model-takes #ch7（HANDOFF 的决定）；裸词 temperature 不再是 #ch6 的别名（它原本打开 particles-states），#ch6 改名「采样温度、top-k 与 top-p」并加别名 采样温度；#ch5 改名「一个注意力头怎么算」，注意力 / attention 仍归 attention-mechanism。
- 交叉链接（2026-11-18）：ch9.links 链到 what-a-frontier-model-takes（续篇）；frontier 的 hero.lead 和 ch13.links 链回本页。`tests/models.cjs` 原来断言续篇「还没有链接」，改为要求 ch9.links 里有这条链接。
- 标签指向交叉链接提交 `3a4bbfb6`（previous `5f65e9f3`，original `5f65e9f3`），在随后的机械提交里重指。

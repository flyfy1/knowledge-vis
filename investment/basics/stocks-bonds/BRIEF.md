# BRIEF — stocks-bonds（股票与债券）

- 驱动问题：买股票和买债券，到底买到了什么？
- 阶段：junior；分类：investment。
- 步骤：0 筹钱的两条路（按钮切换两种凭证）→ 1 股票是所有权（份数/价格滑杆）→ 2 债券是借条（票息率/年数滑杆）→ 3 清偿顺序滑杆（债主先、股东后）→ 4 价格由买卖意愿定（买家/卖家滑杆）→ 5 总结表 + 模型假设 + 非投资建议 + 许可表。
- 数字：全部虚构示例（小店、100 份、票息示例）；无真实公司、行情与票据。
- 桥接：supply-demand（价格机制）、compound-interest（利息与时间）。
- 许可：定义本站原创；Investor.gov 仅术语对照（译文标注译自 Investor.gov，不代表 SEC 认可）；OpenStax / Saylor / Khan 原文零引用；Wikidata 仅结构化数据。

- 2026-11-09 canvas 文字修复（Claude Code，self-check）：共用的 `text()` 加了标注避让和限界（同一次绘制中重叠的标注错开一行，文字不伸出画布），见 specs/reviews/canvas-text-survey-20261109.md。第 0、5 步卡片内文字换行，窄屏改为上下排列；第 1、3 步金额标注避让。修后 `tests/canvas-text-overlap.cjs --sweep` 通过。

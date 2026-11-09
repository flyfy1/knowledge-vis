# 机制设计与拍卖 · build brief

四步双语切片：私有价值、第一价/第二价规则、赢家收益与激励。

- 核心 API：`winner`、`firstPriceOutcome`、`secondPriceOutcome`。
- 范围：单件物品、两位竞标者、独立私有价值；不模拟预算、联盟或多物品拍卖。
- 验证：`node tests/core.cjs`、`node --check app.js`，浏览器切换规则、报价和语言。

- 2026-11-09 canvas 文字修复（Claude Code，self-check）：页面加载 [`canvas-label-guard.js`](../../../canvas-label-guard.js)（说明见 specs/canvas-label-guard.md），重叠的画布标注会错开、文字不伸出画布。修后 `tests/canvas-text-overlap.cjs --sweep` 结果见 specs/reviews/canvas-text-survey-20261109.md。

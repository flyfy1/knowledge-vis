# 机制设计与拍卖 · build brief

四步双语切片：私有价值、第一价/第二价规则、赢家收益与激励。

- 核心 API：`winner`、`firstPriceOutcome`、`secondPriceOutcome`。
- 范围：单件物品、两位竞标者、独立私有价值；不模拟预算、联盟或多物品拍卖。
- 验证：`node tests/core.cjs`、`node --check app.js`，浏览器切换规则、报价和语言。

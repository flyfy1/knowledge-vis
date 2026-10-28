# 2026-10-29 · Genetics & Probability

## 目标

新增一个此前目录没有的遗传与概率入口，覆盖孟德尔分离、Punnett 方格、独立分配、表型比例和条件概率。

## 已完成

- 新建 `genetics-probability/index.html`、`style.css`、`app.js`。
- 实现五步教学链：配子分离 → 单性状方格 → 双性状/重组率 → 条件概率过滤 → 小测验。
- 关键读数由当前控件实时计算；无空 spec 占位。
- 添加双语文案、状态播报、响应式布局和 `knowledge-lang` 记忆。
- 添加 `BRIEF.md`、`specs/genetics-probability.md` 和聚焦测试。

## 验证

- `node genetics-probability/tests/core.cjs`
- `node --check genetics-probability/app.js`

## 阻塞

原始 checkout `/Users/songyy/Documents/Codex/2026-10-29/task-3/knowledge-vis` 对当前执行环境返回 `Operation not permitted`，因此本轮完整产物保存在可写隔离 workspace `/Users/songyy/Documents/Codex/2026-10-29/task-10`，尚未回写或 commit 到原始 checkout。

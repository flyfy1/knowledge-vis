# what-a-drive-is-made-of · 修复记录

页面：[`computing/systems/what-a-drive-is-made-of/`](../computing/systems/what-a-drive-is-made-of/)，存储系列 S1「硬盘里到底是什么」。写作背景和来源见该目录的 `BRIEF.md`，登记信息见 [essays.md](essays.md)。

- 2026-11-16 补静态示意图（STANDARD.md §4a；Claude Code，claude-opus-5-5）：8 张内联 SVG（`data-dg`：lba、hdd、stack、smr、cell、cw、ftl、layers），标签来自 `copy.zh.js` / `copy.en.js` 的 `dg.*` 键，图上的数字来自 `models.js` 并在 `tests/models.cjs` 里钉住，非按比例的图在图注里写明是示意。宽屏（≥ 1280）和窄屏各一套布局。脚本缓存键改为 `?v=20261116a`。
- 独立评审（specs/reviews/storage-diagrams-s1-s3-review-20261116.md）发现并已修复：图 7（FTL）窄版：改前面板的英文两行注释碰到「After…」标题，改后面板下移 12 单位（viewBox 高 580 → 592）。
- 测试：`tests/browser.cjs`：构建者在外溢视口检查里加的 `e.closest('svg')` 跳过把 `<svg>` 自身也排除了（比屏幕宽的 SVG 查不出来），评审改回只跳过 `<defs>`；裁切文字检查里从不生效的 SVG 豁免已删除。
- 未处理（不阻塞）：ECC 图注说再多一位错就丢整块，没提读重试和软判决（与正文、模型一致）。

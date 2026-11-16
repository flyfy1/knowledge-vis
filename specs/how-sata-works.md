# how-sata-works · 修复记录

页面：[`computing/systems/how-sata-works/`](../computing/systems/how-sata-works/)，存储系列 S2「SATA 为什么用了二十多年」。写作背景和来源见该目录的 `BRIEF.md`，登记信息见 [essays.md](essays.md)。

- 2026-11-16 补静态示意图（STANDARD.md §4a；Claude Code，claude-opus-5-5）：8 张内联 SVG（`data-dg`：stack、wires、enc、fis、seq、ncq、pwr、pm），标签来自 `copy.zh.js` / `copy.en.js` 的 `dg.*` 键，图上的数字来自 `models.js` 并在 `tests/models.cjs` 里钉住，非按比例的图在图注里写明是示意。宽屏（≥ 1280）和窄屏各一套布局。脚本缓存键改为 `?v=20261116a`。
- 独立评审（specs/reviews/storage-diagrams-s1-s3-review-20261116.md）发现并已修复：图 7（功耗状态）窄版：Awake 的说明压到纵轴箭头上，换行宽度缩小 16 单位。
- 测试：`tests/browser.cjs`：构建者在外溢视口检查里加的 `e.closest('svg')` 跳过把 `<svg>` 自身也排除了（比屏幕宽的 SVG 查不出来），评审改回只跳过 `<defs>`；裁切文字检查里从不生效的 SVG 豁免已删除。
- 未处理（不阻塞）：图 5 在 320 宽时「4 KiB」在数字和单位之间断行；图 8 在 320 宽中文下标题与条形之间空隙偏大；K28.5 只画了 RD− 形式（图上已注明）。

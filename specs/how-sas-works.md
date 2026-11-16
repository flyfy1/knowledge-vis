# how-sas-works · 修复记录

页面：[`computing/systems/how-sas-works/`](../computing/systems/how-sas-works/)，存储系列 S3「服务器硬盘为什么用 SAS」。写作背景和来源见该目录的 `BRIEF.md`，登记信息见 [essays.md](essays.md)。

- 2026-11-16 补静态示意图（STANDARD.md §4a；Claude Code，claude-opus-5-5）：10 张内联 SVG（`data-dg`：stack、cdb、ssp、conn、dual、exp、wide、plug、pi、spl），标签来自 `copy.zh.js` / `copy.en.js` 的 `dg.*` 键，图上的数字来自 `models.js` 并在 `tests/models.cjs` 里钉住，非按比例的图在图注里写明是示意。宽屏（≥ 1280）和窄屏各一套布局。脚本缓存键改为 `?v=20261116a`。
- 独立评审（specs/reviews/storage-diagrams-s1-s3-review-20261116.md）发现并已修复：图 4（连接）宽版：OPEN 标签第二行压在箭头上，标签改为在箭头上方 21 单位处垂直居中，并加背景色描边（`svg text.h`）挡住扩展器生命线；图 5（双端口）宽版：路径 A、B 共用 x=372 的竖线，路径 B 移到 x=382；`dg.ssp.note` RESPONSE IU「24 字节」改为「至少 24 字节」；`dg.plug.ok` 注明 STP 只在经过扩展器时才用（直连是原生 SATA）。`tests/models.cjs` 的 dg 占位符豁免收窄为 `^dg\.\w+\.(?!cap$|aria$)`，图注和 aria 仍受原检查。
- 测试：`tests/browser.cjs`：构建者在外溢视口检查里加的 `e.closest('svg')` 跳过把 `<svg>` 自身也排除了（比屏幕宽的 SVG 查不出来），评审改回只跳过 `<defs>`；裁切文字检查里从不生效的 SVG 豁免已删除。
- 未处理（不阻塞）：SAS 插头几何（S8–S14 在 SATA 缺口处）是示意，图注已说明没读 SFF-8482。
- 2026-11-16 模板迁移准备（Claude Code，claude-opus-5-5；specs/site-template.md §10 第 3 步，同批次 A 的 `9a470caf`）：`tests/models.cjs` 通过 `scripts/lib/prefill.cjs` 的 `unprefill(html, Z)` 读 `index.html`（含「index.html 里没有中文」检查），统计 S4/S5 链接和兄弟篇锚点时跳过生成的 `site.*` 键。手写页面上不起作用；转换后的完整构建上照样通过，手写的 `<p>手写</p>` 仍被查出。标签指向 `b44d5f06`（previous `9fcb9fac`），脚本没改，缓存键不变。

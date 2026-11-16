# storage-over-a-network · 修复记录

页面：[`computing/systems/storage-over-a-network/`](../computing/systems/storage-over-a-network/)，存储系列 S5「隔着网线的硬盘」。写作背景和来源见该目录的 `BRIEF.md`，登记信息见 [essays.md](essays.md)。

- 2026-11-16 补静态示意图（STANDARD.md §4a；Claude Code，claude-opus-5-5）：10 张内联 SVG（`data-dg`：level、nas、iscsi、fc、path、rdma、gbn、caps、mp、ec），标签来自 `copy.zh.js` / `copy.en.js` 的 `dg.*` 键，图上的数字来自 `models.js` 并在 `tests/models.cjs` 里钉住，非按比例的图在图注里写明是示意。宽屏（≥ 1280）和窄屏各一套布局。脚本缓存键改为 `?v=20261116d`。
- 独立评审（specs/reviews/storage-diagrams-s4-s5-review-20261116.md）发现并已修复：`caps` 宽版和 320 宽英文：NVMe/TCP PDU 包头标签溢出框，该行加高（`rowY`），标签去掉重复的 NVMe/TCP；`level` 宽版和 320 宽：「文件系统在你这边」溢出框，框加高、灰框延长；`path` 宽版英文：「Protocol stack (kernel or user space)」贴边，框改为 158 × 63；`dg.caps.cdb`「CDB 最多 16 字节」不对（RFC 7143 §11.2.2.3 用 Extended CDB AHS 承载更长的 CDB），改为「16 字节的 CDB 字段」；`dg.fc.credit` 英文句子改顺；`dg.rdma.cap` 英文链接标题改用站内引号格式。
- 测试：`tests/browser.cjs`：`lbox` 给每个居中标签加 `data-in="x,y,w,h"`，`diagramCheck` 要求换行后的标签留在自己的框内（2 单位余量），1280/390/320 中英文都查（评审新增，只加不减）。登记时把构建者在外溢视口检查里加的 `e.closest('svg')` 跳过改回只跳过 `<defs>`（`closest()` 会匹配 `<svg>` 自身，比屏幕宽的 SVG 原本查不出来），并删掉裁切文字检查里从不生效的 SVG 豁免，与 S1–S3 一致；改后浏览器测试仍通过，没有发现溢出。
- 未处理（不阻塞）：绿色在不同图里分别表示「存储端」「优化路径」「无需翻译」，单图内不矛盾；窄版 `iscsi` 省掉了「第 N 次往返」括注（图注保留）。
- 2026-11-16 模板转换后补链接（站点模板 Phase 1 批次 A 评审，specs/reviews/site-template-phase1a-review-20261116.md）：模板页不再跑运行时的《标题》自动链接，第 5 章 `ch5.p3`、`ch5.limit` 两处《NVMe 为什么这么快》在线上原是自动链接，改成 `[[why-nvme-is-fast#ch1]]`、`[[why-nvme-is-fast#ch2]]`（中英文同目标）。

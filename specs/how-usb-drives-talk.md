# how-usb-drives-talk · 修复记录

页面：[`computing/systems/how-usb-drives-talk/`](../computing/systems/how-usb-drives-talk/)，存储系列 S4「移动硬盘为什么跑不满」。写作背景和来源见该目录的 `BRIEF.md`，登记信息见 [essays.md](essays.md)。

- 2026-11-16 补静态示意图（STANDARD.md §4a；Claude Code，claude-opus-5-5）：9 张内联 SVG（`data-dg`：stack、mframe、pkt、bot、uas、chain、heat、tunnel、stick），标签来自 `copy.zh.js` / `copy.en.js` 的 `dg.*` 键，图上的数字来自 `models.js` 并在 `tests/models.cjs` 里钉住，非按比例的图在图注里写明是示意。宽屏（≥ 1280）和窄屏各一套布局。脚本缓存键改为 `?v=20261116d`。
- 独立评审（specs/reviews/storage-diagrams-s4-s5-review-20261116.md）发现并已修复：`stack` 宽版：桥接芯片和硬盘控制器的标签溢出 56 单位的框，框改为 168 宽、70/50/70 高，箭头和连线随之移动；`heat` 窄版：标签压到芯片的散热箭头上，箭头移到 x = 48 / 298 并给标签设换行宽度；`heat` 图注「右边的图」在窄版不对，改为「其中的电路图」；`uas`：data-out 生命线穿过「读时空闲」，生命线在标签处留缺口；`dg.stick.aria` 不再把「四通道、32 颗 die」当定数，改为「图上画的是四通道各八颗」。
- 测试：`tests/browser.cjs`：`lbox` 给每个居中标签加 `data-in="x,y,w,h"`，`diagramCheck` 要求换行后的标签留在自己的框内（2 单位余量），1280/390/320 中英文都查（评审新增，只加不减）。登记时把构建者在外溢视口检查里加的 `e.closest('svg')` 跳过改回只跳过 `<defs>`（`closest()` 会匹配 `<svg>` 自身，比屏幕宽的 SVG 原本查不出来），并删掉裁切文字检查里从不生效的 SVG 豁免，与 S1–S3 一致；改后浏览器测试仍通过，没有发现溢出。
- 未处理（不阻塞）：连字符在页面字体里显示偏宽（与正文相同，非示意图问题）；热阻用金色，而别处金色表示数据；窄版 `stack` 省掉了「芯片要会两种语言」标签（图注保留）。

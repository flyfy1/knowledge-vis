# Claude Code 平行版本 · 交接（2026-11-10）

- **负责会话**：Claude Code lead（claude-opus-5-5）。
- **分支**：`review/claude-pages-20261109`，未 push。
- **约定**：见 [claude-code-editions](claude-code-editions.md)。

## 进度

- **总量**：201 个 topic（排除 atlas、leetcode、investment/atlas 以及 4 页已有的 Claude 原创）。
- **已完成 201 / 201 页**：全部已提交、贴标并与原版互链。
  - 清单见 [`variants/claude-code/editions.js`](../variants/claude-code/editions.js)，汇总页见 `variants/claude-code/`。
  - 全部由 `claude-opus-5-5` 编写。
  - 每页都通过了以下检查：
    - core 测试；
    - 静态 id 去重；
    - `canvas-text-overlap --sweep`（1280/390/320 × 中英）；
    - 截图脚本：无横向溢出、无控制台报错。
  - 没有独立评审，标签里写的是「自查验收」。
- **没有新增主题**：子 Agent 都没有拆出新 topic。
- **全站检查**：`tests/page-provenance-core.cjs` 和 `tests/page-provenance-browser.cjs` 都通过，共 233 个页头。
  - browser 测试第一次跑时，atlas 页的 URL 状态断言偶发失败（`q=Fourier` 还没清掉）；重跑通过。和本轮改动无关。

## 下一步：评审

1. 逐页对照原版看教学质量，重点看各 BRIEF.md 里作者自己写的「已知不足」。
2. 排查正文里的方位词：「左图/右图」在窄屏上会变成上下排，前期页面没有逐页查过。
3. 改了已贴标的页面：
   - 先提交修改；
   - 再用 `repoint.cjs <新提交> <slug...>` 改指 `sourceRevision`：旧值写进 `previousSourceRevision`，`originalSourceRevision` 只写一次；
   - 然后单独提交这次改指（`mechanical`）。

## 工具

lead 工具已归档到 `~/Documents/archive/knowledge-vis/claude-editions-tools-20261110/`。使用时复制到 `/tmp/agent-tasks/claude-editions/`，因为脚本里写死了这个路径。

- `integrate.sh <slug...>`：
  - 修正 fmt 尾零写法；
  - 检查文件齐全、未用 guard、静态 id 不重复；
  - 跑 core、sweep 和截图检查；
  - 通过的页面依次做 authored 和 mechanical 两个提交：贴标、`cc-<slug>` 清单、原版对照链接、`editions.js`。
- `mkprompt.cjs <批号>`：按 `batches.json` 生成子 Agent 任务书。
- `repoint.cjs`、`label.cjs`、`link-originals.cjs`、`gen-editions.cjs`、`dupids.cjs`。
- `browser.sh`：浏览器检查的串行锁。

## 本轮发现的共性问题（已修）

- **数字去尾零**：`toFixed(0)` 的结果也被去掉尾零，90 显示成 9。已修 53 页并整体改指；`integrate.sh` 会自动修。
- **函数被遮蔽**：buoyancy-archimedes 里局部变量 `cap` 遮蔽了同名函数。已改名为 `beakerCap`。
- **重复 id**：markov-chains 的按钮 id `step2` 与步骤区块重名。按钮 id 已改为 `stepBtn2`，`integrate.sh` 也加了 `dupids` 检查。
- **偶发报错**：membrane-transport 偶发 `toFixed` of undefined。
  - 已在 fmt 里兜底：空值显示「—」。
  - 根因未找到，记录在它的 BRIEF.md。

## 已知局限

- 201 页都只有作者 Agent 自查加 lead 的自动检查，lead 只抽看了少数页面的截图。教学质量需要人工对照原版评审。
- 链到 Claude 版的入口有三个：
  - 首页「更多入口」一栏里的「Claude Code 平行版本」卡片（2026-11-11 首页改版前在简介下方）；
  - 汇总页 `variants/claude-code/`；
  - 每个原版页头下方的「对照 Claude Code 版 →」。

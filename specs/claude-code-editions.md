# Claude Code 平行版本 · 任务书与约定

- **目标**：Yangyu 于 2026-11-09 要求，每个课程 topic 都由 Claude Code 独立写一份自己的版本，标明是 Claude 的作品、由哪个模型编写。原版和 Claude 版要能互相跳转，方便对比两边的出品。
- **规则依据**：[visual-page-provenance](visual-page-provenance.md)「Parallel editions」。

## 模型选择（2026-11-09）

- 先用 `claude-sonnet-5-5` 和 `claude-opus-5-5` 各写同两个试点（convolution、fractions），由 lead 会话（claude-opus-5-5）对比。
- 两边单元测试和 canvas 扫描都通过。差别在图表可读性：
  - Opus 版每张图都有坐标刻度和图例；
  - Sonnet 版 convolution 第 1 步各行茎线被压得很矮，几乎读不出数值。
- Yangyu 要求挑「最能代表 Claude 质量」的产出，因此正式批次全部用 `claude-opus-5-5`。
- Sonnet 试点不进仓库，归档在 `~/Documents/archive/knowledge-vis/claude-pilots-20261109/`。

## 目录与链接

- **Claude 版目录**：`variants/claude-code/<slug>/`，层级与原版相同（三层），所以 `../../../` 就是站点根目录。
- **原版不覆盖、不改标签**：原版目录里只加一条指向 Claude 版的对照链接，见下文「原版侧链接」。
- **Claude 版指向原版**：页头放一条对照链接 `../../../<原版 path>`，链接文字写明「对照另一版本：<原版标题>」。
- **新增主题**：为讲清某个 topic 需要拆出的新主题，放在 `variants/claude-code/<new-slug>/`，并在本文件末尾登记。

## 署名

- **页头标签**：使用署名标注契约，写「Claude Code 开发 · 原创版本」。范围说明里写明精确的模型 id，例如 `claude-sonnet-5-5` 或 `claude-opus-5-5`。
  - 标签由 lead 在页面提交之后统一补上（标签里的 `sourceRevision` 必须指向已存在的提交）。子 Agent 不写标签，只在页头简介之后留一行占位注释 `<!-- page-provenance -->`，并在 `<head>` 里引入 `../../../page-provenance.css`。
  - 清单键用 `cc-<slug>`，`path` 写 `variants/claude-code/<slug>/index.html`。
- **页脚**：子 Agent 写一行双语署名：「本页由 Claude Code（<模型 id>）独立编写，是《<原版标题>》的平行版本」。
- **提交**：每个提交的 `Built-By` 写实际编写页面的模型。

## 子 Agent 的工作方式

**先读：**
1. 本文件；
2. [AGENTS.md](../AGENTS.md)；
3. [UI-I18N-SPEC.md](../UI-I18N-SPEC.md)，必须逐条满足，尤其是「解释清晰度」和「交互可理解性」两部分；
4. 结构参考：[engineering/control/step-response/](../engineering/control/step-response/)。这是一页经过评审的 Claude 原创课，学它的文件拆分、i18n、`fitCanvas` 和测试的组织方式，**不要照抄内容**。

**独立性：**
- 可以读 `pages.config.js` 里该 topic 的标题和简介，以及原版目录下的 `BRIEF.md`（了解教学目标和受众学段）。
- **不要读原版的 app.js、i18n.js、index.html**。用自己的结构、例子和交互讲清楚这个主题。
- 学段（stage）与原版一致。

**交付物**（全部放在自己的目录里）：
- `index.html`、`style.css`、`i18n.js`、`app.js`；
- 纯模型放在 `model.js`，同时能在 node 里加载；
- `tests/core.cjs`：用 node 跑，钉住页面上每一个数值结论，并检查双语键集一致；
- `BRIEF.md`：按 UI-I18N-SPEC 的 BRIEF 要求写，另注明作者模型、日期和与原版的关系。

**质量底线：**
- **结构**：5–8 步，每步先提出一个具体问题，再交互，再给读数。
- **双语**：中英文都是地道文案，不是逐字直译。语言切换后，canvas 里的文字也要重绘。
- **数值**：所有数值都由模型计算得出，不手写结论。
- **画布标注**：自己排好版，不靠 `canvas-label-guard.js`。1280、390、320 宽下都不能重叠、不能伸出画布。
- **兼容性**：
  - 窄屏不出现横向滚动，控制台零报错；
  - 支持减弱动态偏好，页面隐藏时停止动画；
  - 语言选择存在 `localStorage` 的 `knowledge-lang` 键里，读写都包 try/catch。
- **站内深链**：只链接确实存在的页面和步骤。

**自检**（浏览器检查必须经过串行锁）：
```sh
node variants/claude-code/<slug>/tests/core.cjs
/tmp/agent-tasks/claude-editions/browser.sh node tests/canvas-text-overlap.cjs --sweep variants/claude-code/<slug>/
/tmp/agent-tasks/claude-editions/browser.sh node /tmp/agent-tasks/claude-editions/shot.cjs <你的临时目录> variants/claude-code/<slug>/
```
- 本地服务器已在 18871 端口运行，不要自己再起，也不要停。
- 截图一定要实际打开看。脚本报出的问题要修完再交付。

**禁止：**
- 改动自己目录以外的任何文件；
- 执行任何 git 操作；
- push、部署；
- 在仓库根目录、`~` 或 `~/Documents` 放临时文件。临时文件放在 `/tmp/agent-tasks/claude-editions/<slug>/`。

## 原版侧链接

lead 在原版 `</header>` 之后加一行静态链接「对照 Claude Code 版 →」（样式在共用的 [`edition-compare.css`](../edition-compare.css)），指向 `variants/claude-code/<slug>/`（按原版目录层级写相对路径）。只给已经有 Claude 版的原版加。
- 这只是导航，不改动课程内容，提交标为 `Authorship-Impact: mechanical`。
- 带 Codex 署名标签的页面加了这条链接后，`sourceRevision` 不改指，因为署名标签只描述课程源码。

## 汇总页

- [`variants/claude-code/`](../variants/claude-code/index.html) 列出所有 Claude 版，逐行给出原版与 Claude 版的链接和编写模型；站点首页简介下方有入口。
- 列表数据 `variants/claude-code/editions.js` 由 lead 按 `page-provenance.json` 里的 `cc-*` 条目生成，不手改。

## 新增主题登记

（暂无）

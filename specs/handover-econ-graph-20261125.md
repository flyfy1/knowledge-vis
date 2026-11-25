# 交接：经济/投资知识图谱，第一轮（2026-11-25）

写给：Yangyu，以及下一个接手的 Claude Code 主会话（team lead）。
写的人：Claude Code team lead（claude-opus-5-5）。
仓库：`~/fast/knowledge-vis`。线上站点：https://visual.integ.life

## 1. 这一轮要做什么

Yangyu 的原话：「我的目标是要建立非常好的 knowledge graph……这一次主要 focus 在经济/投资的领域」。

分工：

- Fable（claude-fable-5-2）设计图谱。
- Opus 子 Agent 写稿。
- Haiku 翻译。
- 另一个 Opus 做独立评审。
- 一个登记 Agent 串行改共享文件。
- team lead 提交、部署。

一共派了约 25 个子 Agent，同时在跑的最多 18 个。

这一轮 Yangyu 给的规矩，之后也适用：

1. **内容优先，轻验收。**原话：「不要专注于文章的验收，主要专注于文章的内容输出；但是对于系统结构的话，该做检查还是要做检查」。
   - 不做：中英文 × 三种宽度的截图矩阵、逐个控件状态核对解说句。
   - 照做：`build-pages --check`、模型测试、registry / atlas / search / pagefind 的 `--check`、模型数字的正确性。
2. **只用看起来安全的命令。**原话：「尽量不要用任何可能会被判断为危险的命令」。
   - 子 Agent 不用 `rm`、`sed -i`、`kill`、`chmod`，也不做任何 git 写操作。
   - 改文件用 Edit / Write 工具。
3. **team lead 统筹，子 Agent 写。**原话：「你是 Team Leader……你要派子 Agent 去写。多派点」。
4. 草稿的 `page.json` **不写 `status` 字段**。`build-registry --check` 会拒绝 `"draft"` 这个值。

## 2. 结果

### 已上线（main 到 `dc9d0046`，已推送、已部署，线上抽查返回 200）

| 页面 | 地址 | 说明 |
|---|---|---|
| 期权定价 | `investment/derivatives/a-fair-price-for-a-bet/` | 新子主题「衍生品」。收尾时修了 4 处内容错误；评审又修了平价斜率的符号、图 6 的说明，并补了前沿一章的来源。 |
| 收益率曲线在说什么 | `investment/rates/what-the-yield-curve-says/` | 13 章、12 个模型。评审修了第 2 章写反的套利方向，以及第 4、11 章说过头的地方；补了实际利率与通胀预期一段。 |
| 看不清质量的时候：柠檬市场与保险 | `economics/markets/when-buyers-cant-see-quality/` | 新子主题「市场」。评审改了 7 处措辞和事实，所有模型数字都独立重算过。 |

图谱现在有 921 个概念、1,100 条边。首屏索引 `atlas-index.js` 约 118 KB，上限 160 KB。这一轮先把它从 152,887 字节压到了 115,425 字节，用的是格式 v3（见 `atlas/README.md` 和 `specs/atlas-search-index.md`）。

本轮在 main 上的提交，按时间顺序：

| 提交 | 内容 |
|---|---|
| `e1bb2b41` | 索引压缩 |
| `b5a86202` | 期权正文 |
| `1e9f9ef6` | 图谱规划 |
| `162af1f5`、`94c635a7` | 期权登记和标签重指 |
| `99352324`、`97a74985` | 两篇正文 |
| `95e7704f`、`b75aefb3` | 两篇登记 |
| `dc9d0046` | 标签重指 + HANDOFF |

### 图谱规划

`specs/essay-briefs/TASK-econ-series.md` 由 Fable 编写，约 2,250 行，内容包括：

- 181 个概念的地图：每个概念的前置概念，以及由哪一页负责。
- 学习路线。
- A–K 各篇的概念归属附录：负责哪些概念、必须链接哪些页、不能抢哪些搜索词。
- 下一批 N1–N8 的任务书。
- §5.1：现有经济页之间缺的 57 条边。

最大的发现：已有的经济文章在图谱里是孤岛。30 个经济概念一条边都没有，《央行调一个利率》和《稀缺》几乎完全没跟别的页连上。

### 草稿分支 `drafts/econ-20261125`（`c6720449`，已推送，未部署）

这 15 页都还没评审、没登记。主工作区里它们是未跟踪文件；why-a-few-firms-win 例外，它是已跟踪文件，改动还没提交。每页 `BRIEF.md` 末尾有「Status at wrap-up 2026-11-25」一节，写明做了什么、缺什么、哪些没核实，以及建议的概念和边。

| 状态 | 页面 |
|---|---|
| 中文写完，等翻译 + 评审 | `economics/public-finance/can-a-country-go-bankrupt` 国家会破产吗 · `economics/trade/who-pays-a-tariff` 关税到底谁付 · `economics/growth/why-some-countries-got-rich` 为什么有的国家富 · `economics/money/why-banks-run` 银行为什么会挤兑 · `economics/money/what-sets-an-exchange-rate` 汇率是谁定的 · `investment/basics/what-a-stock-is-worth` 一只股票值多少钱 |
| 中文写完，但**从没在浏览器里打开过** | `economics/money/what-makes-a-stablecoin-stable` 稳定币 · `economics/macro/what-makes-prices-rise` 物价为什么会涨 · `economics/macro/why-recessions-happen` 为什么会衰退 |
| 中英都有，等评审 | `probability/stochastic/random-walks` 随机游走与布朗运动 · `economics/markets/why-a-few-firms-win` 为什么少数公司赢家通吃（已转模板；英文从 Antigravity 的译本改来，提交时要加 Derived-From trailer） |
| 没写完 | `investment/portfolio/how-much-risk-is-worth-taking`（正文写完，缺 app.js 和图）· `economics/labour/where-wages-come-from`（只有模型和测试；有两个模型参数要先修）· `economics/public-finance/where-taxes-fall`（只有模型、测试和图的骨架）· `economics/money/how-a-crisis-spreads`（只有 BRIEF） |

## 3. 下一轮从哪开始（建议顺序）

1. **9 篇中文草稿走完流水线：** Haiku 翻译 → 另一个 Opus 评审 → 登记 → 部署。
   - 登记时按 TASK-econ-series §4 处理概念、别名和边。
   - 草稿之间互相引用的纯文本链接要改成 `[[...]]`。
2. **补 §5.1 的 57 条边**，解决孤岛问题。登记 Agent 读过原文后留了笔记，在 `/tmp/agent-tasks/econ-graph/registrar/`，重启后会丢；其中四条需要改动的边已经抄进了 HANDOFF.md。
3. **补完 4 篇没写完的。**
4. **开写 N6–N8：**养老钱能用多久、市场为什么会疯、电价怎么定。任务书在 TASK-econ-series §3.11。

## 4. 待定和已知问题

**别名归属要定：**

- 「节俭悖论 / 衰退」从 `spending-is-income` 移到 why-recessions-happen。
- SVB 的别名从 `bond-duration-convexity` 移到 why-banks-run 的利率风险概念。
- 「税负归宿」一组在 who-pays-a-tariff 和 where-taxes-fall 之间要定。
- 「影子银行」在 why-banks-run 和 how-a-crisis-spreads 之间要定。
- 「随机游走 / 布朗运动」从期权那篇第 5 章移到 random-walks。

**已知注意点：**

- market-failure 的四个别名（信息不对称、柠檬市场等）是在生成文件 `atlas/graph/lessons/scarcity-moves.json` 里手删的。重新导入 scarcity-moves 会把它们带回来，导入后要再删一次，或者直接改 `demos/scarcity-moves/REGISTRY.json`。
- 期权那篇的 `tests/browser.cjs` 在登记后报了一个 Node 错误，没查。这个测试不在部署检查里，线上页面正常。
- `atlas/tests/browser.cjs` 卡在 power-converters、kepler-orbits 两处旧锚点上，这是本轮之前就有的问题。
- 有几个文件要清掉，可以用 `git rm` 或手动删：who-pays-a-tariff 目录里多余的 `page.css.tmp`，以及 why-banks-run 里两个没有引用的 `figures/ch6-model.html`、`figures/ch8-model.html`。
- `tests/home-concept-search.cjs` 头部注释里的 `NODE_PATH` 写旧了，要用 `/Users/songyy/fast/integ-life/integ-games/node_modules`。

**这一轮的事实核查缺口：**每篇 BRIEF.md 都列了。最常见的是数据从搜索摘要或二手报道读来，没打开原文。评审时优先核前沿一章。

## 5. 环境状态

- 部署用的 git worktree 在 `/tmp/agent-tasks/econ-graph/deploy-wt`，当前是 detached HEAD，指向 `dc9d0046`。
  - 部署方法：先 `git -C <wt> fetch`，再 `git -C <wt> switch --detach origin/main`，然后在 worktree 里跑 `python3 scripts/deploy-pi.py`。
  - 为什么要单独开：主工作区里有写手未提交的草稿，部署脚本要求干净的工作区。
- 本地测试服务器已全部关闭，188xx 端口没有服务在监听。
- 子 Agent 的公共规矩在 `/tmp/agent-tasks/econ-graph/COMMON.md`；下一轮可以照抄成新的任务目录。`/tmp` 里的东西重启后会丢。
- 规矩执行情况：几个写稿 Agent 在新规矩到达前用过 `sed -i` 或 python 原地改文件，都只动了自己的目录。另有一个 Agent 跑过 `rm -f /dev/null`，它不会删任何东西。

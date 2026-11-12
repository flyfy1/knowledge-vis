# HANDOFF.md — 开工前先读

最后更新：2026-11-12，由 Claude Code 主会话（team lead）在食物分区第一篇长文上线后更新。

这份文件有两部分：

- **第一部分「约定」**：Yangyu 在 2026-11-11 的会话里和 team lead 定下的工作方式。它对之后接手的 Claude Code 主会话及其子 Agent 有约束力，改动需要 Yangyu 同意。
- **第二部分「现状」**：做到哪了、下一步从哪开始。每轮工作收尾时由 team lead 更新。

与其他文件的关系：署名规则仍以 [AUTHORSHIP.md](AUTHORSHIP.md) 为准；测试命令和页面标注规则见 [AGENTS.md](AGENTS.md)。本文件与 AGENTS.md 冲突的只有两条（分支、推送部署授权），见下面第 2 条，那两条以本文件为准，且只适用于 Claude Code 主会话这条线。

---

## 第一部分：约定

### 1. 分工

- **主会话是 team lead**：发现问题、定计划、评审、做决定。它不亲自写实现，把注意力留给判断。
- **实现交给 Opus 子 Agent**。**简单翻译交给 Haiku**（长文的 `copy.en.js`），翻译后跑机械检查。
- **评审在 Claude Code 会话内做**，由另一个会话的 Opus 担任评审，不交给 Codex（Yangyu 认为 Codex 的评审不稳定）。
- 可以并行开多个子 Agent 分头做不同方向。并发上限是 20（`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`）。

### 2. 分支、提交、上线

- **在 `main` 上工作**，提交、推送、部署都不用再问 Yangyu（纯前端站点）。这一条覆盖 AGENTS.md 里「在自己的分支上提交」和「push、部署要等授权」两条，仅限 Claude Code 主会话这条线；其他 Agent（Codex、Alberto/Muse）仍按 AGENTS.md。
- **只有 team lead 指定的 Agent 才提交**。其余子 Agent 只在自己的目录里写文件，不提交。
- 提交时写明路径：`git commit -m … -- <路径>`。不用 `git add -A`，不用 stash / reset / rebase / amend，不用 `git clean`（工作区里有未提交的草稿）。
- **阶段性进度都进 git**（Yangyu，2026-11-12）。任何工作做到一个阶段，就提交，不让它只留在工作区或 `/tmp` 里：
  - 已评审、可上线的内容提交到 `main`。
  - 未评审的草稿提交到草稿分支 `drafts/<主题>-<日期>` 并推送；评审通过后再并入 `main`。草稿分支不部署。
  - 简报、排队规格、审计结论这类工作文件放进 `specs/`。
- 提交 trailer 按 AUTHORSHIP.md，末尾加 `Co-Authored-By: Claude <noreply@anthropic.com>`。
- **部署方式**：从已提交的 HEAD 部署到 Pi，不从工作区部署，这样未提交的草稿不会被发布。
  ```sh
  git push origin main
  git archive HEAD | tar -x -C <临时目录>
  rsync -a --exclude='.git' --exclude='.github' --exclude='node_modules' --exclude='.agent' --exclude='.runs' \
    --exclude='worklog' --exclude='specs/reviews' --exclude='leetcode/*/tests' \
    <临时目录>/ songyy-pi:/home/songyy/projects/visual-site/
  ```
  不带 `--delete`。部署后用 curl 抽查线上 URL。
- GH Pages 迁移是以后的事，不阻塞：工作流已提交，等 Yangyu 在网页上启用 Pages。在那之前继续用 Pi。

### 3. 子 Agent 的行为

- **不发删除命令**（`rm`、清理步骤）。它们会弹权限确认让 Yangyu 审，他不想审。临时文件留在原地即可。
- 只动自己被分配的目录；临时脚本、截图、日志放 `/tmp/agent-tasks/<任务名>/`。
- 本地服务器用完要停；浏览器测试串行跑。
- 子 Agent 写不了名为 `REPORT.md` 的文件（被运行环境拦截），报告直接写在返回结果里。

### 4. 内容方向

- **选题由 team lead 自己定**，不用让 Yangyu 挑。
- **优先级**：较深的数学、物理、化学、计算机。目标是让读者能看懂主流科技和经济的最前沿（芯片、AI、量子、密码、能源、货币政策、金融）。日常好奇类的题目可以做，但不是重点。
- 深度长文的写法：从第一性原理搭梯子到前沿，用真实的方程和小规模的真实模型；最后有一章「前沿在哪」，每个事实带日期和来源，并把「已确立」「已演示」「某方声称」分开。
- 质量标准是 `demos/scarcity-moves` 和 [specs/essays.md](specs/essays.md)。未经独立评审的长文不上线。

### 5. 用量与汇报

- Yangyu 的 token 是按周算的。他说收敛就收敛：让在跑的写完，不开新题，已评审的登记上线，然后给阶段总结。
- 汇报要短。每个 Agent 结束时一两段话：结果、需要他知道的问题。
- 如实汇报：没验证的写明没验证，测试没跑的写明没跑。

---

## 第二部分：现状（2026-11-12）

### 已上线

线上内容到 `ffa1c21f` 为止（其后只有本文件的更新）（https://visual.integ.life），已推送到 `origin/main`。

- **长文 12 篇加《稀缺》**，都是中英双语、经过独立评审。清单见 `pages.config.js` 的 `KNOWLEDGE_ESSAYS`。
- **食物分区**（Yangyu 2026-11-12 提出）：新分类 `food`（饮食与风味）、子主题 `flavor`（味道从哪来），第一篇是 `food/flavor/why-fermented-tofu-tastes-good/`（酱豆腐为什么好吃，兼讲松花蛋）。图谱里归在 `matter` 分区，后续食物长文导入时继续用 `--region matter`。任务书在 [specs/essay-briefs/TASK-why-fermented-tofu-tastes-good.md](specs/essay-briefs/TASK-why-fermented-tofu-tastes-good.md)，可作为下一篇的模板。草稿分支 `drafts/food-20261112` 已被 `main` 上的版本取代。它的第 7 章有一张「谁来切、切什么、靠什么挡住腐败」的表（酱油、奶酪、火腿、鱼露、纳豆、臭豆腐），每一行都可以是这个分区的下一篇。
- **LeetCode**：登记表 204 条。2026-11-11 新增 12 课、修订 28 课，评审记录在 [specs/leetcode-review-2026-11-11.md](specs/leetcode-review-2026-11-11.md)。
- **搜索**：疑问句、比较式查询、一批别名（`9f4751c6`）。

### 未上线：17 篇中文草稿

已提交到草稿分支 `drafts/essays-20261111`（`4b192930`，已推送，基于 `main` 的 `ffd13a5a`）；在 `main` 的工作区里它们仍是未跟踪文件，内容相同。无英文，未评审。翻译和评审可以直接在工作区的文件上做，通过后提交到 `main`；也可以切到草稿分支做完再合并。每篇目录里有 `BRIEF.md`（来源、会过期的事实、调出来的参数）和 `REGISTRY.json`（登记信息）。

| 目录 | 评审时要重点看的问题 |
|---|---|
| `computing/ml/how-a-chatbot-writes/` | 登记后要补 ChatGPT 等搜索别名 |
| `computing/ml/noise-into-pictures/` | |
| `computing/ml/what-a-frontier-model-takes/` | 约 13 篇论文凭记忆引用；H100 合同价来自二手来源 |
| `computing/systems/a-secret-in-public/` | RSA-260 / RSA-896 纪录的日期与归属要复查；NSA、ANSSI/BSI、欧盟时间表没有原始来源 |
| `computing/quantum/what-quantum-computers-do/` | 三个数字凭记忆，部分只有新闻稿 |
| `physics/modern/why-fusion-is-hard/` | 模型算出 SPARC Q=3.2，设计值 11；NIF 耗电、2026-06 那一发、氚库存未核实 |
| `chemistry/reactions/why-batteries-hold-so-little/` | 外壳占 20% 是为落进文献范围而调的；ProLogium 无独立测试 |
| `tech/semiconductors/why-chips-are-hard/` | 八个物理参数未从原始来源核实 |
| `tech/energy/how-electricity-reaches-you/` | |
| `tech/networks/how-much-a-wire-can-carry/` | 浏览器测试改成了即时滚动，确认没掩盖真实问题；若干数字只有二手来源 |
| `tech/networks/how-a-web-page-arrives/` | |
| `economics/money/why-one-rate-moves-everything/` | CBO 债务数字未从 cbo.gov 核实；多个参数是调出来的 |
| `economics/markets/why-a-few-firms-win/` | 用了 Menlo（Anthropic 投资方）的份额数据，判断标注是否足够；两篇论文没打开 |
| `arts/music/why-notes-sound-good-together/` | |
| `psychology/cognition/why-we-forget/` | 七篇论文只读了摘要 |
| `earth/geo/what-magnitude-means/` | |
| `biology/body/why-we-get-sleepy/` | **模型在默认 τ=24.2 h 下给出的时差方向与实测数据相反**，评审要先判断这一点 |

登记时要新建的分类或子主题：`arts/music`、`tech/networks`、`tech/energy`、`tech/semiconductors`、`computing/quantum`、`economics/markets`。

### 下一步，按顺序

1. **先处理搜索索引上限**。`atlas/search-index.js` 是 186,074 / 200,000 字节（酱豆腐那篇用掉约 6,000），再登记两篇就超。要么压缩索引，要么提高上限并说明理由；不要为了过测试悄悄改上限。
2. **17 篇草稿走完流水线**：Haiku 翻译 → 独立评审 → 登记（[specs/essays.md](specs/essays.md)、`scripts/atlas-import-registry.cjs`）→ 推送部署。
3. **排队的深度长文**：规格在 [specs/essay-briefs/QUEUE-DEEP2.md](specs/essay-briefs/QUEUE-DEEP2.md) 第 1–6 节（经济怎么衡量、内存层级、电磁波、反应方向、化学键、衍生品定价），第 8 节之后是待写规格的清单。
4. **缺失的前置页面**。各草稿报告里重复最多的：模运算与有限域、吉布斯自由能与化学势、弹性与边际收益、麦克斯韦–玻尔兹曼分布、通胀怎么测量、Fick 扩散、互信息与 KL 散度。缺口审计的完整结论在 [specs/essay-briefs/GAP-AUDIT-NOTES.md](specs/essay-briefs/GAP-AUDIT-NOTES.md)。

### 给长文 Agent 的简报

原件在 `/tmp/agent-tasks/essays/`，重启会丢，所以在 [specs/essay-briefs/](specs/essay-briefs/) 留了副本，以这里的为准：

- `STANDARD.md`、`BRIEF-COMMON.md`：长文标准和通用简报。
- `BRIEF-BATCH3.md`：前几批的教训和硬规则。
- `BRIEF-DEEP.md`：深度方向的补充（梯子、真实模型、前沿章）。
- `REVIEW-COMMON.md`：评审简报。
- `QUEUE-DEEP2.md`：排队选题的规格。

这些文件里的路径还写着 `/tmp/agent-tasks/essays/…`，派活时把简报路径换成 `specs/essay-briefs/…`。

### 已知问题

- 提交 trailer 要写 `Built-By: Claude Code (…)`，不要写小写的 `claude-code`：`tests/page-provenance-core.cjs` 按 `Built-By: Claude` 区分大小写匹配。酱豆腐那篇的建页提交 `0ed6253b` 写成了小写，页面标签因此指向其后的 BRIEF 提交 `12a8511e`。
- 酱豆腐那篇：酶速率、蛋内扩散系数、表面碱浓度比例是调出来的（页面有标注）；香气一章用的是臭豆腐的数据；Yamaguchi 1971、Zhao 2014 和两篇松花晶体研究只读了摘要；`tests/page-provenance-browser.cjs` 没有对它跑。
- 搜索 "how does a phone work" 落到音素页面，是错的；搜索修复后有 49 个原本无结果的查询现在有结果，其中少数是噪声（如 "rent vs buy"）。
- 「群体免疫」落在 body-in-balance 第 9 章，没落在疫苗那篇，这是有意保留的。
- LeetCode：没有任何一课在 LeetCode 上实际提交过；SQL 课 1097 / 1127 / 1159 没在 MySQL 上跑过；772 假设没有一元负号；391、765、936、679、354、668、327、699 的浏览器测试原本就失败。
- 六节 LeetCode 新课（727、759、772、1127、1153、1183）的提交写的是 `Built-By: claude-code (model unavailable)`，实际是 2026-11-11 的 Opus 子 Agent。
- 房贷那篇的 BRIEF 里记了一条中国 2026-08-01 生效的综合融资成本披露规定，只见到报道，没有原文，没写进页面。
- 工作区里有未提交的杂项：`leetcode/1063/tests/evidence/*`、`leetcode/765/tests/evidence/zoom-profile/`、`leetcode/920/__pycache__`。

### 等 Yangyu 决定

- `wip/mini-20261030` 分支怎么处理。
- 内容单薄或重复的页面、`780` 与 `780-claude`、`-codex` 跳转占位页。
- LeetCode 登记表是 204 条还是 201 条（1159 / 1168 / 1192 是在 `38f476d7` 里单独登记的，可以回退）。
- 在 GitHub 网页上启用 Pages。

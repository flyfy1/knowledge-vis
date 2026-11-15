# HANDOFF.md — 开工前先读

最后更新：2026-11-15，由体系结构系列 A4、A5 登记 Agent（Claude Code）在 A4、A5 上线后更新第二部分。

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

## 第二部分：现状（2026-11-15）

### 已上线

线上内容到 `c79af41c` 为止（其后只有本文件和任务书的更新）（https://visual.integ.life），已推送到 `origin/main`。

- **长文 24 篇加《稀缺》**，都是中英双语、经过独立评审；另有 Antigravity 的 4 篇只做过自查（见 specs/essays.md）。清单见 `pages.config.js` 的 `KNOWLEDGE_ESSAYS`。
- **食物分区**（Yangyu 2026-11-12 提出）：新分类 `food`（饮食与风味）、子主题 `flavor`（味道从哪来），第一篇是 `food/flavor/why-fermented-tofu-tastes-good/`（酱豆腐为什么好吃，兼讲松花蛋）。图谱里归在 `matter` 分区，后续食物长文导入时继续用 `--region matter`。任务书在 [specs/essay-briefs/TASK-why-fermented-tofu-tastes-good.md](specs/essay-briefs/TASK-why-fermented-tofu-tastes-good.md)，可作为下一篇的模板。第二篇是 `food/flavor/how-soy-sauce-gets-its-flavor/`（酱油是怎么酿出来的），任务书 [specs/essay-briefs/TASK-how-soy-sauce-gets-its-flavor.md](specs/essay-briefs/TASK-how-soy-sauce-gets-its-flavor.md)。草稿分支 `drafts/food-20261112` 上的两篇都已被 `main` 上的版本取代。它的第 7 章有一张「谁来切、切什么、靠什么挡住腐败」的表（酱油、奶酪、火腿、鱼露、纳豆、臭豆腐），每一行都可以是这个分区的下一篇。
- **存储系列**（Yangyu 2026-11-14，任务书 [specs/essay-briefs/TASK-storage-series.md](specs/essay-briefs/TASK-storage-series.md)）：S1 `computing/systems/what-a-drive-is-made-of/`（硬盘里到底是什么）和 S2 `computing/systems/how-sata-works/`（SATA 为什么用了二十多年）已上线（`bb361d4b`），S3 `computing/systems/how-sas-works/`（服务器硬盘为什么用 SAS）已上线（`cfc408ab`），S4 `computing/systems/how-usb-drives-talk/`（移动硬盘为什么跑不满）已上线（`d3848685`），S5 `computing/systems/storage-over-a-network/`（隔着网线的硬盘）已上线（`d604470d`），都是中英双语、经另一个 Claude Code 会话独立评审，图谱归 `computing` 分区。S1 第 7 章已链接 S2、S3 第 7 章和 S4；S2 第 1、10 章链接 S3，第 10 章链接 S4；S3 第 1、11 章链接 S4；S4 第 6、11 章链接 S3 第 2 章。S5 上线时补齐了网络存储一条：S1 第 7 章、S2 第 10 章链接 S5；S3 第 1 章链接 S5 第 3、4 章，第 11 章链接 S5 及其第 3、4、7 章；S4 第 6、11 章链接 S5 第 3 章；S5 第 11 章链接 S4 及其第 6 章。S5 拿的词：NAS 和 SAN 区别、iSCSI、光纤通道、RDMA、RoCE、NVMe-oF、NVMe over TCP、多路径 / multipath、三副本、纠删码等；「多路径是什么」「multipath storage」留在 S3 第 4 章，副本一致性和网络延迟的词留在 distributed-systems 和 tcp-congestion。「SAS 和 SATA 能混用吗」「SAS 盘能插 SATA 口吗」2026-11-15 从 S1 第 7 章移到 S3 第 7 章；「移动硬盘盒怎么工作」留在 S1 第 7 章。「固态硬盘为什么比机械硬盘快」在 S1 第 8 章。NVMe 那篇仍是 Antigravity 原创版本，两次重指（别名、缓存键）的方式见 specs/visual-page-provenance.md（2026-11-14）和 specs/reviews/。这六页的脚本带日期缓存键（Cloudflare 把 JS 缓存 4 小时，HTML 不缓存），约定写在 specs/essays.md 第 7 步；S1、S2、S4 现为 `?v=20261115c`，S3 和 NVMe 为 `?v=20261115b`（同一天再次改动加字母），S5 为 `?v=20261115`（2026-11-15 总线系列上线后）。S1、S2 的 browser.cjs 偶发失败已修（平滑滚动中强制点击 1 px 单选框会点空）。系列 S1–S5 收尾，状态表在任务书「Status」一节；S6 `how-phone-storage-works`（可选）未开始，S1–S5 里没有等它的纯文本。
- **总线系列**（Yangyu 2026-11-15，任务书 [specs/essay-briefs/TASK-bus-series.md](specs/essay-briefs/TASK-bus-series.md)）：B1 `computing/systems/how-pcie-works/`（PCIe 为什么能一代一代翻倍，建页 `7174f8e4`）、B2 `computing/systems/how-a-computer-is-wired/`（电脑里的零件是怎么连起来的，`56d96c4c`）、B6 `computing/systems/how-thunderbolt-works/`（雷电接口是怎么工作的，`3954bb68`）已上线（`81155e94`），中英双语、经另一个 Claude Code 会话独立评审，每篇都有 STANDARD §4a 要求的静态示意图（12、8、9 张），图谱归 `computing` 分区。三篇互相链接（B2 → B1 第 1、2、11 章，B6 → B1 第 2 章，B1 → B2 第 5 章，结尾都链接其余两篇）；S4 第 8 章链接 B6 第 2、9 章和 B1 第 1 章，S1 第 7 章、NVMe 第 2 章链接 B1，S2 第 2 章链接 B2 第 2 章（NVMe 是 Antigravity 版本，重指证据 specs/reviews/why-nvme-is-fast-pcie-link-20261115.md）。别名：「USB4 和雷电区别 / Thunderbolt vs USB4」从 S4 第 8 章移到 B6 第 9 章；「主板上的 PCIe 是从哪来的」和 DMI/PCH/芯片组在 B2 第 5 章；通用的 PCIe 词归 B1，NVMe 保留存储专用的词（含 MSI-X 中断）；芯粒 / chiplets 只靠 B2 第 7 章标题落点，草稿 why-chips-are-hard 的 REGISTRY 里有这几个别名，它登记时要决定归属（见 specs/essays.md）。缓存键：三篇新长文 `?v=20261115`；S1、S2、S4 现为 `?v=20261115c`，S3、S5 仍 `?v=20261115b` / `?v=20261115`，NVMe `?v=20261115b`。B3 `how-memory-talks`、B4 `coherent-interconnects` 在写（未跟踪草稿），B5 排队未派。B3、B4、B5 在三篇里仍是纯文本，A5 第 11 章也以纯文本提到 B4，写好后要改成链接。
- **存储系列 S1–S5 没有静态示意图**：它们早于 STANDARD §4a（2026-11-15 起要求每篇至少六张），是补图的候选。
- **计算机体系结构系列**（任务书 [specs/essay-briefs/TASK-arch-series.md](specs/essay-briefs/TASK-arch-series.md)，A1–A6，状态表在「Status」一节）：A2 `computing/systems/how-cpu-caches-work/`（CPU 的三级缓存是怎么工作的，建页 `476c9f45`）已上线（`781c2db7`），中英双语、经另一个 Claude Code 会话独立评审，11 张静态示意图，图谱归 `computing` 分区，脚本 `?v=20261115`。别名：L1 L2 L3 缓存、缓存行、组相联缓存、cache line、set associative cache 从 why-compute-waits-for-memory 第 2 章移到 A2 第 1–3 章（那篇保留缓存命中率、cache hierarchy 和局部性的词，第 2 章末加了一句链接 A2；它是 Antigravity 版本，标签首次重指到 `88dafe9c`，证据 specs/reviews/why-compute-waits-for-memory-alias-move-20261115.md，脚本加了 `?v=20261115`）。缓存一致性 / cache coherence / MESI 协议 / MOESI 留给 A5，在那之前搜不到结果。switches-that-compute 第 11 章没加链接（那句是列表项，该页浏览器测试要求链接 48×48）。A1 `computing/systems/how-a-cpu-runs-a-program/`（CPU 是怎么运行一个程序的，建页 `0daab2e9`，8 张静态示意图）和 A3 `computing/systems/how-virtual-memory-works/`（虚拟内存是怎么工作的，建页 `df11763e`，9 张）已上线（`e41b1fe0`），中英双语、经另一个 Claude Code 会话独立评审，脚本 `?v=20261115`；两页标签指向 `c0cc5c40`（别名迁移、交叉链接、一键别名），登记 `601bf01c`。别名：指令集 / ISA / instruction set、CPU 怎么执行程序 / how a CPU runs a program、机器码 / machine code、流水线 / pipelining 从 switches-that-compute 第 9、11 章移到 A1 第 1、3、6 章（switches 保留程序计数器、取指 译码 执行、冯·诺依曼结构、关键路径；它是 Claude Code 版本，标签首次重指到 `c0cc5c40`，不需要评审说明）；停顿、转发、CPI 留在 why-compute-waits-for-memory 第 1 章。A3 拿 Belady 异常，A2 第 4 章保留 Belady 最优替换 / LRU；IOMMU 留在雷电第 8 章（那里没有讲页表的句子，没加回链），NUMA 在 B2，CXL 内存池在内存那篇。A2 第 7、10、12 章原来写「后续一篇讲虚拟内存的文章」的四处已改成链接 A3（A2 标签重指到 `c0cc5c40`，脚本 `?v=20261115b`）；A2 里 A5 仍是纯文本。A1、A3 里 A4 是纯文本，A4 `computing/systems/how-a-cpu-guesses-ahead/`（CPU 是怎么猜着往前跑的，建页 `50a4a3c2`，8 张静态示意图）和 A5 `computing/systems/how-cores-share-memory/`（多个核心怎么共用一块内存，建页 `445f4b67`，12 张）已上线（`c79af41c`），中英双语、经另一个 Claude Code 会话独立评审；标签指向 `d34e98bb`（交叉链接、别名、一键别名），登记 `1aa9a22f`；脚本 A4 `?v=20261115r`、A5 `?v=20261115`。A1（第 6、8、12 章）、A3（第 10、13 章）、A2（第 9、12 章）原来的纯文本都改成了链接，A4、A5 互相链接；A1、A3 脚本 `?v=20261115b`，A2 `?v=20261115c`，三页和 why-compute-waits-for-memory 的标签重指到 `d34e98bb`。别名：A5 拿缓存一致性 / cache coherence、MESI 协议、MOESI、MSI 协议、总线窥探；A2 保留伪共享、MESI 状态；单独的 MSI 留在 PCIe 第 7 章；推测执行 / speculative execution 在 A4 第 8 章（A3 从来没有）。「取指 译码 执行」已从 why-compute-waits-for-memory 第 1 章删掉（Antigravity 版本，证据 specs/reviews/why-compute-waits-for-memory-fetch-decode-alias-20261115.md），现在落到 switches 第 9 章。A1–A5 收尾；A6 `how-a-gpu-computes`（可选）和开机、显示、供电、网卡、操作系统与硬件几篇排队，规格派活时再写。另：A1/A3 登记（`601bf01c`）生成了 `search/chunks/computing-3.js` 并写进 manifest，却没提交，线上首页搜索从 `e41b1fe0` 起一直请求一个 404 的分片；`1aa9a22f` 已补上。以后登记跑完 build-search-index 要看 `git status search/`，把新分片加进提交。
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

1. ~~搜索索引上限~~：已解决。搜索在 `4afe29f3` 改为按分区分片（`search/chunks/*.js`，单片上限 60,000 字节），不再有 200 KB 总上限；2026-11-14 登记存储三篇后共 232,237 字节。
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

- **2026-12-01 之后要改酱油那篇**：GB/T 18186-2025 当天生效，页面上写「将于 12 月 1 日生效」「现行 2000 版」的句子要改成已生效（第 7、8 章；细节见该页 BRIEF）。
- 酱油那篇：第 4 章接力模型只用 Zhou 2019 的 14 个点里的 8 个拟合（均方根误差 0.08，全部 14 点是 0.15），页面已写明，重新拟合会改动四章的数字；变黑一章没有酱油专属的活化能；曲霉温度上下限是二手来源；2021 年市场监管总局公告和 GB/T 18186-2000 原文没读到。
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

# HANDOFF.md — 开工前先读

最后更新：2026-11-17，模板 Phase 3 批次 C 的独立评审 Agent（Claude Code）在第 1f 条加了评审结论；在此之前同日批次 C 的提交 Agent（Claude Code）在「模板迁移与示意图补齐」加了第 1f 条、改了第 1c 条 kepler-orbits 那一句；在此之前 2026-11-16，模板 Phase 3 批次 B 的独立评审 Agent（Claude Code）在第 1e 条加了评审结论；在此之前模板 Phase 3 批次 A 的独立评审 Agent（Claude Code）在第 1d 条加了评审结论、改了它的「遗留」；在此之前模板 Phase 3 批次 A 的提交 Agent（Claude Code）在「模板迁移与示意图补齐」加了第 1d 条；在此之前模板 Phase 2 的独立评审 Agent（Claude Code）在第 1c 条加了评审结论；在此之前模板 Phase 2 的提交 Agent（Claude Code）在「模板迁移与示意图补齐」加了第 1c 条、改了末尾「pages.config.js 仍手改」一句和第 2 部分「未上线：17 篇中文草稿」的登记说明；在此之前模板后续改进的提交 Agent（Claude Code）在「模板迁移与示意图补齐」加了第 1b 条、改了第 1a 条的「没转换」和第 3 条的遗留；在此之前 SIMD/浮点长文的登记 Agent（Claude Code）更新了「模板迁移与示意图补齐」第 1a、3 条（批次 A 已在线、SIMD 长文上线）；在此之前模板 Phase 1 批次 A 的提交 Agent（Claude Code）在「模板迁移与示意图补齐」加了第 1a 条；在此之前 SVG 视口检查的登记 Agent（Claude Code）更新了「模板迁移与示意图补齐」第 2 条的遗留项；在此之前存储 S1–S5 补图的登记 Agent（Claude Code）更新了「模板迁移与示意图补齐」第 2 条和存储系列的示意图状态；在此之前模板 Phase 0 的提交 Agent 更新了该节；第二部分其余内容仍是 2026-11-15 供电与网卡两篇上线后的状态。

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

线上内容到 `b38d9e07` 为止（其后只有本文件和任务书的更新）（https://visual.integ.life），已推送到 `origin/main`。

- **长文 30 篇加《稀缺》**，都是中英双语、经过独立评审；另有 Antigravity 的 4 篇只做过自查（见 specs/essays.md）。清单见 `pages.config.js` 的 `KNOWLEDGE_ESSAYS`。
- **食物分区**（Yangyu 2026-11-12 提出）：新分类 `food`（饮食与风味）、子主题 `flavor`（味道从哪来），第一篇是 `food/flavor/why-fermented-tofu-tastes-good/`（酱豆腐为什么好吃，兼讲松花蛋）。图谱里归在 `matter` 分区，后续食物长文导入时继续用 `--region matter`。任务书在 [specs/essay-briefs/TASK-why-fermented-tofu-tastes-good.md](specs/essay-briefs/TASK-why-fermented-tofu-tastes-good.md)，可作为下一篇的模板。第二篇是 `food/flavor/how-soy-sauce-gets-its-flavor/`（酱油是怎么酿出来的），任务书 [specs/essay-briefs/TASK-how-soy-sauce-gets-its-flavor.md](specs/essay-briefs/TASK-how-soy-sauce-gets-its-flavor.md)。草稿分支 `drafts/food-20261112` 上的两篇都已被 `main` 上的版本取代。它的第 7 章有一张「谁来切、切什么、靠什么挡住腐败」的表（酱油、奶酪、火腿、鱼露、纳豆、臭豆腐），每一行都可以是这个分区的下一篇。
- **存储系列**（Yangyu 2026-11-14，任务书 [specs/essay-briefs/TASK-storage-series.md](specs/essay-briefs/TASK-storage-series.md)）：S1 `computing/systems/what-a-drive-is-made-of/`（硬盘里到底是什么）和 S2 `computing/systems/how-sata-works/`（SATA 为什么用了二十多年）已上线（`bb361d4b`），S3 `computing/systems/how-sas-works/`（服务器硬盘为什么用 SAS）已上线（`cfc408ab`），S4 `computing/systems/how-usb-drives-talk/`（移动硬盘为什么跑不满）已上线（`d3848685`），S5 `computing/systems/storage-over-a-network/`（隔着网线的硬盘）已上线（`d604470d`），都是中英双语、经另一个 Claude Code 会话独立评审，图谱归 `computing` 分区。S1 第 7 章已链接 S2、S3 第 7 章和 S4；S2 第 1、10 章链接 S3，第 10 章链接 S4；S3 第 1、11 章链接 S4；S4 第 6、11 章链接 S3 第 2 章。S5 上线时补齐了网络存储一条：S1 第 7 章、S2 第 10 章链接 S5；S3 第 1 章链接 S5 第 3、4 章，第 11 章链接 S5 及其第 3、4、7 章；S4 第 6、11 章链接 S5 第 3 章；S5 第 11 章链接 S4 及其第 6 章。S5 拿的词：NAS 和 SAN 区别、iSCSI、光纤通道、RDMA、RoCE、NVMe-oF、NVMe over TCP、多路径 / multipath、三副本、纠删码等；「多路径是什么」「multipath storage」留在 S3 第 4 章，副本一致性和网络延迟的词留在 distributed-systems 和 tcp-congestion。「SAS 和 SATA 能混用吗」「SAS 盘能插 SATA 口吗」2026-11-15 从 S1 第 7 章移到 S3 第 7 章；「移动硬盘盒怎么工作」留在 S1 第 7 章。「固态硬盘为什么比机械硬盘快」在 S1 第 8 章。NVMe 那篇仍是 Antigravity 原创版本，两次重指（别名、缓存键）的方式见 specs/visual-page-provenance.md（2026-11-14）和 specs/reviews/。这六页的脚本带日期缓存键（Cloudflare 把 JS 缓存 4 小时，HTML 不缓存），约定写在 specs/essays.md 第 7 步；2026-11-16 补图后 S1–S3 为 `?v=20261116a`、S4/S5 为 `?v=20261116d`（同一天再次改动加字母）。S1、S2 的 browser.cjs 偶发失败已修（平滑滚动中强制点击 1 px 单选框会点空）。系列 S1–S5 收尾，状态表在任务书「Status」一节；S6 `how-phone-storage-works`（可选）未开始，S1–S5 里没有等它的纯文本。
- **总线系列**（Yangyu 2026-11-15，任务书 [specs/essay-briefs/TASK-bus-series.md](specs/essay-briefs/TASK-bus-series.md)）：B1 `computing/systems/how-pcie-works/`（PCIe 为什么能一代一代翻倍，建页 `7174f8e4`）、B2 `computing/systems/how-a-computer-is-wired/`（电脑里的零件是怎么连起来的，`56d96c4c`）、B6 `computing/systems/how-thunderbolt-works/`（雷电接口是怎么工作的，`3954bb68`）已上线（`81155e94`），中英双语、经另一个 Claude Code 会话独立评审，每篇都有 STANDARD §4a 要求的静态示意图（12、8、9 张），图谱归 `computing` 分区。三篇互相链接（B2 → B1 第 1、2、11 章，B6 → B1 第 2 章，B1 → B2 第 5 章，结尾都链接其余两篇）；S4 第 8 章链接 B6 第 2、9 章和 B1 第 1 章，S1 第 7 章、NVMe 第 2 章链接 B1，S2 第 2 章链接 B2 第 2 章（NVMe 是 Antigravity 版本，重指证据 specs/reviews/why-nvme-is-fast-pcie-link-20261115.md）。别名：「USB4 和雷电区别 / Thunderbolt vs USB4」从 S4 第 8 章移到 B6 第 9 章；「主板上的 PCIe 是从哪来的」和 DMI/PCH/芯片组在 B2 第 5 章；通用的 PCIe 词归 B1，NVMe 保留存储专用的词（含 MSI-X 中断）；芯粒 / chiplets 只靠 B2 第 7 章标题落点，草稿 why-chips-are-hard 的 REGISTRY 里有这几个别名，它登记时要决定归属（见 specs/essays.md）。缓存键：三篇新长文 `?v=20261115`；S1、S2、S4 现为 `?v=20261115c`，S3、S5 仍 `?v=20261115b` / `?v=20261115`，NVMe `?v=20261115b`。B3 `computing/systems/how-memory-talks/`（内存是怎么和 CPU 说话的，建页 `d165655d`，11 张静态示意图）和 B4 `computing/systems/coherent-interconnects/`（芯片之间怎么共用内存，建页 `0f6572c0`，10 张）已上线（`922cad5c`），中英双语、经另一个 Claude Code 会话独立评审；标签指向 `52df5521`（交叉链接、别名、一键别名），登记 `011e6f9b`；脚本都是 `?v=20261115r`。B3、B4 互相链接；A5 第 11、12 章、B2 第 9 章、B1 第 11 章链接 B4，A2 第 12 章、why-compute-waits-for-memory 第 5 章链接 B3（这几页标签重指到 `52df5521`，脚本 A2 `?v=20261115d`，A5、B1、B2、内存那篇 `?v=20261115b`）。别名：「CXL 内存池 / CXL memory pooling」从内存那篇第 10 章移到 B4 第 6 章，「NVLink 带宽 / NVLink vs PCIe」从第 9 章移到 B4 第 8 章（Antigravity 版本，证据 specs/reviews/why-compute-waits-for-memory-cxl-nvlink-alias-move-20261115.md）；B3 拿 DDR 专属的词和「ECC 内存」，单独的 ECC、ecc memory 留给未登记的草稿 a-secret-in-public、how-much-a-wire-can-carry，它们登记时再定；纯 CXL、NVLink 落在 B4 第 3、8 章，内存、内存条、DRAM 打开 B3 页首。B5 `small-buses`（可选）未开始，B2 第 8 章仍以纯文本提到它。
- **存储系列 S1–S5 的静态示意图 2026-11-16 已上线**：共 45 张（S1 8、S2 8、S3 10、S4 9、S5 10），提交 `9fcb9fac`，标签重指 `b2d49a1c`，脚本键 S1–S3 `?v=20261116a`、S4/S5 `?v=20261116d`；评审见 specs/reviews/storage-diagrams-s1-s3-review-20261116.md 和 storage-diagrams-s4-s5-review-20261116.md，各页修复记录在 `specs/<slug>.md`。
- **计算机体系结构系列**（任务书 [specs/essay-briefs/TASK-arch-series.md](specs/essay-briefs/TASK-arch-series.md)，A1–A6，状态表在「Status」一节）：A2 `computing/systems/how-cpu-caches-work/`（CPU 的三级缓存是怎么工作的，建页 `476c9f45`）已上线（`781c2db7`），中英双语、经另一个 Claude Code 会话独立评审，11 张静态示意图，图谱归 `computing` 分区，脚本 `?v=20261115`。别名：L1 L2 L3 缓存、缓存行、组相联缓存、cache line、set associative cache 从 why-compute-waits-for-memory 第 2 章移到 A2 第 1–3 章（那篇保留缓存命中率、cache hierarchy 和局部性的词，第 2 章末加了一句链接 A2；它是 Antigravity 版本，标签首次重指到 `88dafe9c`，证据 specs/reviews/why-compute-waits-for-memory-alias-move-20261115.md，脚本加了 `?v=20261115`）。缓存一致性 / cache coherence / MESI 协议 / MOESI 当时留给 A5，A5 上线后归它。switches-that-compute 第 11 章没加链接（那句是列表项，该页浏览器测试要求链接 48×48）。A1 `computing/systems/how-a-cpu-runs-a-program/`（CPU 是怎么运行一个程序的，建页 `0daab2e9`，8 张静态示意图）和 A3 `computing/systems/how-virtual-memory-works/`（虚拟内存是怎么工作的，建页 `df11763e`，9 张）已上线（`e41b1fe0`），中英双语、经另一个 Claude Code 会话独立评审，脚本 `?v=20261115`；两页标签指向 `c0cc5c40`（别名迁移、交叉链接、一键别名），登记 `601bf01c`。别名：指令集 / ISA / instruction set、CPU 怎么执行程序 / how a CPU runs a program、机器码 / machine code、流水线 / pipelining 从 switches-that-compute 第 9、11 章移到 A1 第 1、3、6 章（switches 保留程序计数器、取指 译码 执行、冯·诺依曼结构、关键路径；它是 Claude Code 版本，标签首次重指到 `c0cc5c40`，不需要评审说明）；停顿、转发、CPI 留在 why-compute-waits-for-memory 第 1 章。A3 拿 Belady 异常，A2 第 4 章保留 Belady 最优替换 / LRU；IOMMU 留在雷电第 8 章（那里没有讲页表的句子，没加回链），NUMA 在 B2，CXL 内存池在内存那篇。A2 第 7、10、12 章原来写「后续一篇讲虚拟内存的文章」的四处已改成链接 A3（A2 标签重指到 `c0cc5c40`，脚本 `?v=20261115b`）；A2 里的 A5、A1 和 A3 里的 A4 原来是纯文本，现已改成链接（见下）。A4 `computing/systems/how-a-cpu-guesses-ahead/`（CPU 是怎么猜着往前跑的，建页 `50a4a3c2`，8 张静态示意图）和 A5 `computing/systems/how-cores-share-memory/`（多个核心怎么共用一块内存，建页 `445f4b67`，12 张）已上线（`c79af41c`），中英双语、经另一个 Claude Code 会话独立评审；标签指向 `d34e98bb`（交叉链接、别名、一键别名），登记 `1aa9a22f`；脚本 A4 `?v=20261115r`、A5 `?v=20261115`。A1（第 6、8、12 章）、A3（第 10、13 章）、A2（第 9、12 章）原来的纯文本都改成了链接，A4、A5 互相链接；A1、A3 脚本 `?v=20261115b`，A2 `?v=20261115c`，三页和 why-compute-waits-for-memory 的标签重指到 `d34e98bb`。别名：A5 拿缓存一致性 / cache coherence、MESI 协议、MOESI、MSI 协议、总线窥探；A2 保留伪共享、MESI 状态；单独的 MSI 留在 PCIe 第 7 章；推测执行 / speculative execution 在 A4 第 8 章（A3 从来没有）。「取指 译码 执行」已从 why-compute-waits-for-memory 第 1 章删掉（Antigravity 版本，证据 specs/reviews/why-compute-waits-for-memory-fetch-decode-alias-20261115.md），现在落到 switches 第 9 章。A1–A5 收尾。A6 `computing/systems/how-a-gpu-computes/`（GPU 是怎么算的，建页 `e844143c`，11 张静态示意图）和开机那篇 `computing/systems/how-a-computer-boots/`（电脑是怎么开机的，建页 `509b4d6e`，13 张）已上线（`9b09a7f7`），中英双语、经另一个 Claude Code 会话独立评审（评审记录 specs/reviews/how-a-gpu-computes-review-20261115.md、how-a-computer-boots-review-20261115.md）；标签指向 `4e4585ca`（交叉链接、别名、一键别名），登记 `0f111cc4`；两篇脚本 `?v=20261115r`。链接：内存那篇第 6 章（Antigravity 版本，证据 specs/reviews/why-compute-waits-for-memory-gpu-link-20261115.md）链接 A6 第 3 章，A5 第 12 章链接 A6 第 10 章；B3 第 7 章、B1 第 6 章、B2 第 8 章、S1 第 1 章分别链接开机第 5、6、3、7 章（这六页标签重指到 `4e4585ca`，脚本 B3 `?v=20261115s`，S1 `?v=20261115d`，其余 `?v=20261115c`）。A1、A3、A4 查过，没有可链接的纯文本；A6 和开机两篇不互链。别名：开机第 8 章用「安全启动信任链 / Secure Boot chain of trust」，单独的 chain of trust 留给未登记的 a-secret-in-public 第 6 章；开机第 3 章保留 SPI 闪存 / quad SPI read，单独的 SPI / SPI bus 仍在 B2 第 8 章；A6 保留「GPU cache coherence」「GPU shared memory」，单独的缓存一致性仍落 A5，单独的 shared memory / 共享内存原来无主，现在靠 A6 第 6 章标题落点；单独的 BIOS、TF-A 原来落到生物页和 B3 tFAW，现在落开机第 6、12 章。开机那篇第 8 章和结尾以纯文本提到《当着所有人的面约定一个秘密》，那篇登记时改成链接。另：B3 的 tests/models.cjs 自登记（`011e6f9b`）起有两项检查失败（禁止页面标注、CJK 检查没剥掉标注），已在 `4e4585ca` 修好；B4（coherent-interconnects）的 tests/models.cjs 原来也有同样一项「no provenance label yet」失败，2026-11-15 已在 `888856c4` 改成要求恰好一个标签。操作系统那篇 `computing/systems/how-the-os-talks-to-hardware/`（操作系统是怎么和硬件说话的，建页 `20a942e2`，10 张静态示意图）和像素那篇 `computing/systems/how-pixels-reach-a-screen/`（像素是怎么到屏幕上的，建页 `3e6bf23d`，12 张）已上线（`26daf4af`），中英双语、经另一个 Claude Code 会话独立评审（评审记录 specs/reviews/how-the-os-talks-to-hardware-review-20261115.md、how-pixels-reach-a-screen-review-20261115.md）；标签指向 `e916a267`（交叉链接、别名、一键别名），登记 `863f6b5f`；脚本操作系统那篇 `?v=20261115`、像素那篇 `?v=20261115b`。链接：A3 第 10 章（limit）、第 11 章分别链接操作系统那篇第 3、8 章，B1 第 6、7 章链接其第 4、5 章，NVMe 第 7 章（Antigravity 版本，证据 specs/reviews/why-nvme-is-fast-os-link-20261115.md）链接其第 11 章，开机第 11 章链接其第 9 章，雷电第 8 章链接其第 8 章，S5 第 6 章链接其第 12 章；雷电第 6 章链接像素那篇第 2、7 章，A6 第 9 章链接其第 1 章（这七页标签重指到 `e916a267`，脚本 A3、NVMe `?v=20261115c`，B1 `?v=20261115d`，开机、A6 `?v=20261115s`，雷电、S5 `?v=20261115b`）。B3 第 9 章、S4 第 8 章、inside-a-phone 屏幕一节查过，没有讲这个话题的句子，没加。别名：操作系统那篇不拿 RDMA（S5 第 6 章），DMA 只拿「DMA 是什么 / what is DMA」，单独的 DMA 无主（在操作系统那篇第 7 章和 B1 第 7 章之间同分，没钉；未登记的草稿 why-a-few-firms-win 用它指《数字市场法》）；「kernel bypass / 内核旁路」落操作系统那篇第 12 章，S5 的「kernel bypass zero copy」仍落 S5 第 6 章；单独的中断 / interrupt、io_uring、操作系统 / operating system 原来无主或同分，现在落操作系统那篇第 5、11、1 章。像素那篇不拿「显示流压缩 / Display Stream Compression」，它们原来无主、搜不到东西，现在和单独的 DSC 一起归雷电第 6 章；像素那篇第 7 章保留「DSC 有损吗 / is DSC lossy / 视觉无损 / visually lossless」；像素那篇的页面标签「显卡」会抢走单独的「显卡」，所以「显卡 / graphics card」加到 A6 第 1 章。操作系统那篇第 14 章以纯文本提到《网页是怎么来到你手机上的》，tech/networks/how-a-web-page-arrives 登记时改成链接。雷电第 6 章原来说 8K60 30 位用 DSC 能放进 HBR3 的 25.92 Gb/s；2026-11-15 已改（`93d7b195`）：8b/10b 的 DP 用 DSC 必须开 FEC（2.4016%，见像素那篇评审记录），HBR3 四条线只剩 25.31 Gb/s，按 CVT-RB2 时序要压到每像素 12.2 位以下（像素那篇按 CTA 时序是 10.63，时序不同，不矛盾）；模型对 Alt Mode 和雷电 4 隧道里的 DSC 流扣掉 FEC，UHBR 不扣；雷电标签指向 `93d7b195`，脚本 `?v=20261115c`。供电那篇 `computing/systems/how-power-reaches-the-cpu/`（电是怎么送进 CPU 的，建页 `e8b05fa7`，10 张静态示意图）和网卡那篇 `computing/systems/how-a-nic-moves-packets/`（网卡是怎么搬运数据包的，建页 `230d5aac`，8 张）已上线（`b38d9e07`），中英双语、经另一个 Claude Code 会话独立评审（评审记录 specs/reviews/how-power-reaches-the-cpu-review-20261115.md、how-a-nic-moves-packets-review-20261115.md）；标签指向 `d0821bc1`（交叉链接、别名、一键别名），登记 `3539c70a`；两篇脚本 `?v=20261115b`。链接：开机第 1 章链接供电那篇第 4 章，A6 第 11 章链接其第 10 章，内存那篇第 5 章（Antigravity 版本，证据 specs/reviews/why-compute-waits-for-memory-power-link-20261115.md）把原有的「动态功耗公式」链接到其第 2 章；操作系统那篇第 6、7 章的局限说明链接网卡那篇第 5、3 章，S5 第 6 章链接其第 11 章，B4 第 10 章链接其第 12 章（这七页加 B1 的标签重指到 `d0821bc1`，脚本开机、A6 `?v=20261115t`，内存那篇 `?v=20261115d`，操作系统那篇 `?v=20261115b`，S5 `?v=20261115c`，B4 `?v=20261115s`，B1 只改了 REGISTRY，脚本不变）。power-converters、雷电第 7 章、B1 第 10 章、A2 查过，没有讲这个话题的句子，没加。别名：供电那篇按评审用「防掉压」，不拿单独的 LLC（会被当成末级缓存）；第 3 章加「电源怎么选 / PSU wattage」。网卡那篇第 1 章拿「网卡 / network card / NIC」；它的页面标签从「网络 / Networking」改成「网络硬件 / Network Hardware」，否则会抢走 tcp-congestion 的单独「网络」。为了让原主人保住词：S5 第 6 章加单独的 RDMA（原来和网卡那篇第 11 章同分 80），B1 第 3 章加「PCIe 开销 / PCIe overhead / PCIe bandwidth」，内存那篇第 10 章加 CPO（它差一个字母匹配到供电那篇的 CPU power formula），tcp-congestion 加 packet。单独的 TSO 仍落 A5（total store order）。供电那篇以纯文本提到《芯片为什么越来越难做》《按下开关的那一刻，电是从哪儿来的》，网卡那篇提到《网页是怎么来到你手机上的》《一根线到底能传多少信息》，那几篇草稿登记时改成链接。另：`scripts/test_index_pagination.cjs` 原来钉着一张 2026-11-13 的长文清单，此后每次登记都失败；`dc85cae0` 改为按 REGISTRY.json 推出成员、只钉顺序（specs/index-pagination.md）。内存那篇第 5 章仍链接未登记的草稿 why-chips-are-hard（线上是 404），留给那篇登记时处理。另：A1/A3 登记（`601bf01c`）生成了 `search/chunks/computing-3.js` 并写进 manifest，却没提交，线上首页搜索从 `e41b1fe0` 起一直请求一个 404 的分片；`1aa9a22f` 已补上。以后登记跑完 build-search-index 要看 `git status search/`，把新分片加进提交；B3/B4 登记（`4c9542bb`）起 `build-search-index.cjs --check` 会对 manifest 列出的每个文件跑 `git ls-files --error-unmatch`，没 `git add` 的分片直接报错。
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

**登记方式（2026-11-16 起）：** 每篇在自己目录写一个只有登记字段的 `page.json`（标题、描述、标签从它的 `REGISTRY.json` 抄；不写 `layout`），跑 `node scripts/build-registry.cjs`，不要往 `pages.config.js` 的 KNOWLEDGE_PAGES 里加行；见第 1c 条。

登记时要新建的分类或子主题：`arts/music`、`tech/networks`、`tech/energy`、`tech/semiconductors`、`computing/quantum`、`economics/markets`。

### 课程现状（2026-11-15）

- 已上线：体系结构 A1–A6、开机、操作系统与硬件、像素到屏幕，总线 B1–B4、B6，存储 S1–S5。
- 已上线：供电（电怎么到 CPU）、网卡（网卡怎么搬数据包）。体系结构任务书里排队的题目都写完了。
- 候选（未写规格）：B5 小总线（I²C、SPI、UART）；S6 手机存储；A6 作者建议的 CPU SIMD 与浮点格式一篇（IEEE 754、FP16 / BF16 / FP8、AVX-512 与 SVE）。

### 模板迁移与示意图补齐（2026-11-16 起）

三条线，按提案 [specs/proposals/site-template.md](specs/proposals/site-template.md) 第 7 节：

1. **Phase 0 基础：2026-11-16 完成**（没有转换任何页面）。
   - **提交：**
     - D3（`Derived-From:` trailer，AUTHORSHIP.md §4 与 §9）在 `c94da8d5`；
     - 工具在 `003feed0`：`scripts/build-pages.cjs`、`scripts/lib/template.cjs`、`scripts/convert-essay.cjs`、`templates/layouts/essay.html`、`tests/site-template.cjs` 和夹具 `tests/fixtures/site-template/`；
     - `site-nav.js` 跳过 `data-template` 页面在 `8bbed67c`。
   - **规范：** [specs/site-template.md](specs/site-template.md)（已采纳，含转换流程和 agent 怎么改已迁移页面）。
   - **命令：** `node scripts/build-pages.cjs --all --check` 只查带 `page.json` 的线上页面，目前 0 个；`node tests/site-template.cjs`。
   - **round trip**（在 /tmp 的镜像里用 HEAD 副本做）：
     - 硬盘（S1）317 键；
     - 内存（B3）459 键、11 张示意图；
     - 开机 608 键、13 张示意图。

     三篇都关掉 chrome 和预填后 `index.html` 逐字节一致，中英 copy 逐键相等，各页 `models.cjs`、`browser.cjs` 照原样通过。
   - **Phase 1 要先定的一件事：** 内存、开机两篇（估计 2026-11-15 那批计算机长文大多如此）的 `models.cjs` 禁止 `index.html` 里出现中文，打开预填就会失败。每页二选一，写进 authored 提交：
     - `page.json` 设 `"prefill": false`；
     - 或者让检查跳过 `data-i18n*` 元素的内容。

     不要放宽别的断言。
1a. **Phase 1 批次 A：2026-11-16 转换了 computing/systems 的 19 篇 Claude Code 长文**（经独立评审 specs/reviews/site-template-phase1a-review-20261116.md 后已推送；SIMD 登记 Agent 2026-11-16 用 curl 看到线上 how-a-gpu-computes 已是 `data-template` 页面、`sn-20261116`，即已部署）。评审留给 team lead 的两件事仍未决：只改了生成的被引用行的 11 页要不要重指标签；批次 A 的 `page.json.version` 要不要整体升一个字母。
   - **页面：** what-a-drive-is-made-of、how-sata-works、how-usb-drives-talk、storage-over-a-network、how-memory-talks、coherent-interconnects、how-a-cpu-runs-a-program、how-a-cpu-guesses-ahead、how-cpu-caches-work、how-a-computer-boots、how-the-os-talks-to-hardware、how-pixels-reach-a-screen、how-power-reaches-the-cpu、how-a-nic-moves-packets、how-cores-share-memory、how-virtual-memory-works、how-a-gpu-computes、how-a-computer-is-wired、how-thunderbolt-works。每篇一个提交（`fca24bb5` … `8b2dac73`；`Built-By: script`、mechanical、`Derived-From:`），细节见 specs/site-template.md §10「Phase 1 batch A」。每篇的 models.cjs、browser.cjs、画布扫描都在完整构建上通过。
   - **预填一律打开**（不用 `"prefill": false`）：页面测试改为通过 `scripts/lib/prefill.cjs` 的 `unprefill(html, Z)` 读 `index.html`，按 copy 表数链接和数字时跳过生成的 `site.*` 键（authored 提交 `9a470caf`，标签重指 `42fba818`）。准备提交 `bb10f897` 只规整了五页的空白、补了 B2 缺的 `</head>`、合并了 A6 的两个 `<style>`。
   - **缓存键：** S1、S2 `?v=20261116b`，S4、S5 `?v=20261116e`，其余 15 篇 `?v=20261116a`（copy 文件多了 `site.*` 键）。
   - **没转换：** how-sas-works、how-pcie-works 当时缺转换器变体，已在第 1b 条转换；why-nvme-is-fast、why-compute-waits-for-memory、switches-that-compute 按计划留到后面的批次。
   - **注意：** 迁移后 site-nav.js 不再在这些页面上把《标题》自动变成链接（D10）。`build-pages` 的 lint 列出了 19 处原来靠自动链接的提及（如 S5 第 5 章的《NVMe 为什么这么快》），要不要写成 `[[slug]]` 留给页面主人决定。how-a-computer-boots 的 models.cjs 读未提交的 a-secret-in-public/copy.zh.js，只能在工作区跑。
1b. **模板后续改进 + SAS、PCIe 转换：2026-11-16 提交，未推送、未部署，等独立评审**（规范 specs/site-template.md §3a、§7、§9a、§10「Template follow-up」）。
   - **模板（`d54606f9`，authored）：** 按 SIMD 长文 BRIEF 和评审记下的摩擦做了六件事，各有夹具测试（tests/site-template.cjs 104 → 155 项，新测试在旧库上失败）：
     - `page.json` `"languages": {"en": "stub"}` 声明英文待译（`<html data-lang-en="stub">` 给 app.js 用）；默认 native，英文里留中文或 `[EN pending]` 构建失败；
     - SVG 示意图标签宽度：构建按字符估宽，超出 viewBox 留给它的位置、或同一基线上两个标签相撞就失败；`--print-budgets <dir>` 给译者看每个标签的余量。SIMD 评审改过的 7 个英文标签能抓到 5 个，压在线上的 2 个抓不到（仍要截图）；
     - `page.json` `generators`：生成的 partial 第一行带 GENERATED 头，`--check` 在临时副本里重跑生成器比对；
     - `--print-bindings <dir>`；
     - REGISTRY.json、pages.config.js 的标题和 desc 必须等于正文；
     - `page.json` `dynamicKeys`：声明 `t('x.' + v)` 用到的键（声明了才对脚本做全量检查，批次 A 不受影响）。
     另加键控页脚、`---` 分栏、`place=wide` 示意图、`legacyLayout` 的 compactSections / compactToc / afterProvenanceCss，旧页面输出逐字节不变。
   - **SIMD 页（`79d42caa` authored，标签 `96958c09`）：** 去掉页内 `meta.en`，改用 `languages`、`dynamicKeys`、`generators`；版本 20261116b。
   - **SAS、PCIe：** 测试适配 `b44d5f06`（authored）、标签 `3259a4fd`；SAS 转换 `0c3676fa`、补回 3 处运行时链接 `b5cdc9bd`（authored；标签在 `21a4c2c8` 指向它）；PCIe 转换 `50e7421e`。没有规整 HTML 的提交。线上 `SiteNav.report()`：SAS 3 处（都已改成 `[[…#ch7]]`），PCIe 0 处。缓存键：SAS、what-a-drive-is-made-of `20261116c`，PCIe `20261116a`。
   - **遗留：** 部署前要独立评审；d54606f9 的提交说明里「47 项新断言在旧库上失败」数字不准，实际是 41 项断言失败，另有转换器 4b 段在旧库上直接崩溃（未逐项计数）。
1c. **Phase 2 登记表：2026-11-16 提交，未推送、未部署，等独立评审**（规范 specs/site-template.md §3b）。
   - **规则变了：登记一个页面 = 在页面目录写 `page.json`（有 `"status": "live"`），再跑 `node scripts/build-registry.cjs`。** `pages.config.js` 的 `KNOWLEDGE_PAGES` 一段夹在 GENERATED 标记之间、由脚本生成，手改会让 `--check` 失败（报错里写明怎么办，`--adopt` 能把手贴的行搬进 page.json）。分类、子主题、FEATURED、ESSAYS 顺序仍手改。步骤写在 AGENTS.md「登记页面」和 specs/essays.md「Registering an essay」第 4 步。
   - **提交：** `75228954` 工具（authored；`scripts/build-registry.cjs`、`scripts/lib/registry.cjs`、`tests/build-registry.cjs`，template.cjs / build-site-nav / convert-essay 改为「page.json 有 layout 才是模板页」）；`71144070` 种子（mechanical，`--adopt` 生成 227 个新 page.json、给 22 个模板页的 page.json 加登记字段，pages.config.js 换成生成段；求值后与 `356de782` 逐项相等，重新生成逐字节一致，site-nav-data.js 和 22 个模板页都没变）；`c51930a1` `[[concept:…]]` 走搜索的别名表（squash 归一，仍是精确匹配，两个概念共有的词报错），`languages.en: "stub"` 在已登记页面上是错误、草稿上是警告，英文里属性中的中文和小写 `[en pending]` 也报错，tests/site-template.cjs 失败时也清理临时目录；`5de49541` 「被这些页面引用」一行开头的标题改成 inline，320 宽下冒号不再单独换行（site-nav.css，include 键 `sn-20261116b`，249 个页面的 include 行跟着变）。
   - **新生成物：** `site-registry.json`（页面、锚点、概念、ref / seeAlso 边、被引用、LeetCode 适配行）、CONCEPT-MAP.md 末尾的「页面 → 概念 → 锚点」表（生成段；以后登记不再手写逐页概念表）、`specs/atlas-edge-todo.md`（D9：有链接但没有图谱边的页面对，335 对待人工判断，脚本从不写边）。
   - **署名缺口（不能用提交修复）：** `71144070` 的 Built-By 里写了「run by Claude Code」，authorship.cjs 因此把 227 个新 page.json 记成 `created: claude-code`（应为 script；内容不受影响）。要改得由 Yangyu 确认 `authorship/overrides.json`，见规范 §3b。Pages 工作流还没跑 `build-registry --check`（稀疏检出不含 specs/，原因见 §3b）；`site-registry.json`（约 750 KB）不在部署排除表里，要不要排除由 Yangyu 定。
   - **独立评审（2026-11-16，specs/reviews/site-template-phase2-review-20261116.md）：结论是修完即可部署（推送仍需授权）。** 修复 `e0c9483b`：手贴行时普通运行不再悄悄丢掉它（改为拒绝并指向 `--adopt`），`--adopt` 先全部校验再写，`build-pages` 对只有登记字段的 page.json 给出明确报错；§3b 补了两人同时登记的合并办法。待 Yangyu 决定：`5de49541` 标为 authored 却改了 227 个手写页的 include 行，使 earth/astronomy/kepler-orbits/index.html 的 primary 从 unattributed 变成 claude-code（无标签受影响）。（2026-11-17 更新：这一页已换成 Claude Code 版本，`408201ac` 是 Claude Code（claude-opus-5-5）的写作提交，现在 primary 为 claude-code 是真实的，这一例不用再决定；见第 1f 条。）
   - **没做 / 推迟：** page.json 取代 REGISTRY.json（概念仍在 REGISTRY.json，`atlas-import-registry.cjs` 已能读 page.json 的 `concepts`；理由见规范 §3b）；手写页面上不显示被引用列表（registry 里有）。
1d. **Phase 3 批次 A（课程页，lesson-shell 那一批）：2026-11-16 提交，未推送、未部署，等独立评审**（规范 specs/site-template.md §3c、§10）。
   - **工具：** `8a781839`（authored）：`scripts/lib/lesson.cjs`、`templates/layouts/lesson.html`，convert-essay.cjs 认得课程页（有 i18n.js、没有 copy.zh.js）。键名原样保留，生成的文件仍叫 `i18n.js`，app.js 和各页测试不用改。转换过的课程页改字：改 `content.zh.md` / `content.en.md`（步骤里不是普通段落的标记在 `figures/stepN-K.html`），然后跑 `node scripts/build-pages.cjs <目录>`，升 page.json 的 `version`；**不要再手改 index.html 或 i18n.js**（`--check` 会报漂移）。
   - **转换（各一个 mechanical 提交，Built-By 为 script）：** 17 页：linear-transform、central-limit-theorem、monte-carlo、bayes-updating、eigenvectors、plate-tectonics、climate-energy、thermodynamics、frozen-bubble、sampling、laplace、fourier、frequency-response、lti-systems、convolution、kalman、inverted-pendulum。每页在父提交上关掉页面外框和预填后重建，index.html 逐字节一致，两张字符串表逐键相等；然后 version 20261116a。提交号见规范 §10。
   - **跳过：** trigonometry（zh 表里 `s4bridge` 写了两次，后一行是英文，所以中文页那里显示英文，en 表缺这个键；它自己的 tangent-core 测试在 HEAD 上就失败。要由页面作者单独修，修完即可转换）；power-converters（没有 i18n.js）。
   - **遗留：** 页面上已有的手写旧文字（eigenvectors 23 处等）留着，清掉会改变无 JS 时的显示，应单独提交；大多数课程的运行时不翻译 `data-i18n-aria`，静态面包屑的 HTML 因此不带 aria-label（评审后由 site-nav.js 按语言补上，见下）；frequency-response 指向 atlas 带查询串的链接被报为「不是线上页面」（只是警告）。其余约 164 个课程页还没转换（试转结果和估算见规范 §12）。
   - **独立评审（2026-11-16，specs/reviews/site-template-phase3a-review-20261116.md）：结论是修完可以部署。** 17 页在 HEAD 上逐字节往返、字符串表逐键相等。修了三处读者会觉得变差的地方：载入时第 0 步按钮不再亮（原因是线上 site-nav.js 晚挂面包屑造成的竞态，`86e430f0` 在 lesson-shell.js 里补了默认值）；步骤里 `figures/` 片段中的链接没有算到该步（`12bc4310`，重建 `afc4d75e`，11 页 version 升到 20261116b）；14 页面包屑没有无障碍名称（`7d9e15fb`，site-nav.js 补上）。lesson-shell.css/js 的缓存键改为 `?v=20261116`（`aeeae125`）。评审中曾误删四个课程目录的工作区文件，已从 HEAD 恢复，没有进任何提交（见评审文件）。页面作者要处理的旧问题列在评审文件第 8 节。

1e. **Phase 3 批次 B（不带 lesson-shell 的课程页）：2026-11-16 提交，未推送、未部署，等独立评审**（规范 specs/site-template.md §3c「Batch B shapes」、§10「Phase 3 batch B」）。
   - **先修读者看得到的错（authored，每页一个提交）：** 六页 zh 表把 `sNbridge` 写了两次、后一行是英文（trigonometry、parabola、circle-angles、lever-pulley、pinhole-camera、reflection-refraction）；phonemes 缺 `next4`、coordinate-plane 缺 `reset`（按钮显示键名）。Codex 页面的证据记录在 specs/reviews/lesson-string-table-fixes-20261116.md，三个有标签的页面在 `df2524f1` 重指。particles-states 英文第 4 步唯一一处运行时自动链接改成真链接（`2a57bec4`，登记表重建 `d9bebc9f`）。
   - **转换器 `6f70a65a`（authored）：** 保留 `<html lang>`、包在 partial 里的步骤标题、`page.json` `runtimeKeys`、`placeholderRepeats`；tests/site-template.cjs 216 → 234 项，新夹具在旧代码上失败。
   - **外框：** `site-nav.css` 给不加载 lesson-shell.css 的课程页居中被引用块（`c2905d2b`，include 键 `sn-20261116c` 单独在 `d150036e`）；`site-nav.js` 在这些页面上载入时点亮第 0 步（`67a0a991`，没有滚动监听的页面滚走后撤掉）；trigonometry 的 lesson-shell 缓存键 `009c48b3`。
   - **转换：160 页**，各一个 mechanical 提交（Built-By: script），`git log --grep 'Phase 3 batch B'`；每页在父提交上逐字节往返、字符串表逐键相等，然后 version 20261116a。所有共享测试、页面 node 测试（除 HEAD 上就失败的两项）、8 个页面浏览器测试中的 7 个（pinhole-camera 的 atlas 测试在转换前就超时）通过；160 页全部做了 Playwright 对比。
   - **没转换：** photosynthesis（`<main>` 里有 `<noscript>`）、acid-base-equilibrium 和 kepler-orbits（没有 STR 表）、bayes-diagnostics（运行时不处理 `data-i18n-html`，被引用行对英文读者会是中文）、power-converters、`variants/`。
   - **遗留：** 390/320 宽下 44 页被引用块比步骤多缩进 4 px；lever-pulley 的 `#step2/#step3` 深链接在构建上落点偏短；c2905d2b 提交说明里的数字不准（见规范 §10）。
   - **独立评审（2026-11-16，specs/reviews/site-template-phase3b-review-20261116.md）：结论是 `e92e2ac8` 之后可以部署（推送仍需授权）。** 160 个转换提交的 trailer、Derived-From、改动范围逐个脚本核对；160 页全部在 HEAD 上逐字节往返、两张表逐键相等；作者沿用原作者。修了两处（`e92e2ac8`，site-nav.js，include 键仍是未上线的 `sn-20261116c`）：第 0 步按钮在 40 % 处被撤掉，和 84 页滚动监听的判定线重合，滚轮滚动时 0 和 1 之间有一帧没有亮的按钮——改成第 0 步完全离开窗口才撤；被引用块在 390/320 宽下比步骤多缩进 4 px（实测 45 页）——改成照抄步骤的左右内边距。lever-pulley 深链接「偏短」不是缺陷：页面用平滑滚动，构建的 `load` 早约 0.9 秒，测量时滚动还没结束，4 秒后两边落点一样。溢出（rsa-encryption、fractions、coordinate-plane）、16 条 `stale:`、`atlas/?trail=` 链接都是转换前就有的。小问题留给页面作者：pinhole-camera 被引用行显示 `本页#geometry-bridge`；particles-states 英文「noted here in text only」现在包着链接。

1f. **Phase 3 批次 C（批次 B 跳过的五课）：2026-11-17 提交，未推送、未部署，等独立评审**（Yangyu 2026-11-17：「请你把他们分别手工处理一下 而且多agent写同一篇的话 默认用更好的那个版本。做完直接部署上线」；规范 specs/site-template.md §10「Phase 3 batch C」）。
   - **先选版本：** 五课都有 `variants/claude-code/<slug>/` 的 Claude Code 版。按读者看到的样子逐对比较（科学与数学、步数与深度、交互、中英文、各自的测试、画布扫描、截图、站内指向它的链接），结论和理由在 specs/reviews/lesson-version-choice-20261117.md。kepler-orbits（原来只有一步，画布扫描在 320 失败）、acid-base-equilibrium、bayes-diagnostics、photosynthesis（原为 Codex 改进版）**换成 Claude Code 版**（`408201ac`、`b383c6dc`、`a3a44e7d`、`5f94f8bc`）；**power-converters 保留 Codex 版**：两版质量相当，而图谱 circuits 分区约二十处概念、边、问题和电容速率、伏秒两座桥都建在它的具体步骤上，换掉会让这些链接落到讲别的东西的步骤。
   - **署名：** 搬过来的提交写 `Built-By: Claude Code (claude-opus-5-5)`、authored，因为内容就是这个 Agent 和模型写的，而这些路径已存在，`Derived-From` 用不上（AUTHORSHIP.md §4）；`node scripts/authorship.cjs` 给出 primary claude-code（`created` 仍是旧文件的首个提交）。标签（`1eec3614`）：三页新登记、photosynthesis 由 Codex · 改进版改为 Claude Code · 原创版，旧 sourceRevision 进 previousSourceRevision；不设 originalSourceRevision（理由见 specs/visual-page-provenance.md「Promoting a parallel edition」）。原版地址去掉了「对照 Claude Code 版 →」（会指向同一课）；`variants/claude-code/` 下没动，那四个变体和汇总页仍指向原版地址。
   - **其他页面：** bayes-diagnostics 的旧锚点 `#step-posterior` / `#step-likelihood` / `#step-prior` 不存在了，图谱片段和 numbers-lie 第 6 章改到 `#step3` / `#step2` / `#step1`（同一提交；numbers-lie 标签重指，copy 首次加 `?v=20261117`）；photosynthesis 的 `#step2` 入链（cell-structure、energy-pyramid、carbon-cycle）落在「糖的重量从哪来」，仍在题内，没改。
   - **转换前的提交：** 生成物 `81f8ff07`；acid-base 字符串表里 12 处 `a()` 展开成纯字符串 `5ac069a2`（展开前后深度相等）；四页 app.js、model.js、style.css 加 `?v=20261117` `2afe5d0c`（同一地址换了代码，JS 缓存 4 小时）；photosynthesis 链接测试去查询串 `2d6f3d5a`；标签重指 `4a4db6ea`、`167973f2`、`58df5b17`；登记表 `d011a06c`。
   - **转换（mechanical，Built-By script）：** kepler-orbits `c95ef919`、acid-base-equilibrium `5ac22d79`、bayes-diagnostics `0e474801`、photosynthesis `c95ff8f9`。转换器没改，四页都在父提交上逐字节往返、两张表逐键相等，然后 version 20261117a。
   - **检查：** 四页各自的 `tests/core.cjs` 在完整构建上通过；画布扫描（1280/390/320 中英）kepler 7776、acid-base 450、bayes 3276、photosynthesis 2006 个状态全过；Playwright 在 1280/390/320 中英下无横向溢出、无页面错误，英文页除语言按钮外没有中文（被引用行也随语言切换），面包屑名称为 页面位置 / Breadcrumb，标签在；power-converters 原版测试（model 3660、browser、flow-browser 240、flow-lifecycle、review-accessibility、review-matrix 1160）通过（review-responsive 会写 specs/reviews 下的证据，没跑）；共享检查 build-pages --all --check（203 页）、build-registry --check、site-template 234、build-registry 测试 60、page-provenance-core 275、build-site-nav --check、site-nav 2275、atlas / 搜索 --check、data-quality、concept-search 1752、registry-import 22、authorship-derived-from、test_index_pagination 全过；浏览器测试串行：site-nav-browser 389、page-provenance-browser 275、lesson-shell 8/8、home-concept-search 31。leetcode 和 photosynthesis 的 tests/evidence 没有变化（旧的 photosynthesis browser.cjs 只在 /tmp 的 HEAD 副本里跑过，证据写到 /tmp）。
   - **遗留：** power-converters 没转换：没有字符串表，`app.js` 用 162 对内联 `tr(中, 英)` 在运行时生成每一步，转换等于重写一个经过评审的 Codex 页面和它的七个测试，应单独立项并评审。四个被换掉的页面的规格（specs/orbital-motion.md、bayes-diagnostics.md、acid-base-composition.md、photosynthesis 的 SCROLL-SPEC）都记了「已被取代」；新页面只有作者自查，没有独立评审，部署前要评审。`variants/claude-code/` 汇总页把这四课仍列为「原版 vs Claude 版」两栏，两边现在是同一课，要不要改汇总页留给 team lead。
   - **独立评审（2026-11-17，specs/reviews/site-template-phase3c-review-20261117.md）：结论是修完即可部署（推送仍需授权）。** 五课的选版都同意（power-converters 保留 Codex 版也同意：图谱有 22 条深链指向它的具体步骤）；四篇换上来的页面逐项核过数字（开普勒数据与凌日、Ka 与 pH、贝叶斯各例、93% 的糖来自 CO₂、范·海尔蒙特、模型里的 50% 光饱和 / 672 ppm 等），都对；搬运与变体一致、署名与标签处理符合规范、四次转换在父提交上重做往返逐字节一致。修复：`06000bd8` 酸碱第 1 步 pH 图标题在英文页画的是「pH · 横轴：pKa」（变体带来的，转换器把它记进了 enCjk；改 content.en.md、删 enCjk、测试加「英文字符串无中文」），标签重指 `b8b27b51`；`67bc6af9` 细胞、能量金字塔终章「叶绿体 / 生产者怎样把光能变成有机物」原指光合作用 `#step2`，换版后那一步是质量账，改到 `#step1`（碳循环那条对得上，没改），光合作用标签重指 `db93b57e`。另改了三处过时文字：CONCEPT-MAP 手写的 numbers-lie 一行里的 `#step-posterior`、AGENTS.md 里已不存在的 photosynthesis 证据目录、visual-page-provenance 里 photosynthesis 的旧例外说明。留给 team lead：`variants/claude-code/` 下这四课的「对照另一版本」现在指向同一课（未动 variants）。

2. **S1–S5 补示意图：2026-11-16 完成并上线**（`9fcb9fac` 内容、`b2d49a1c` 标签重指）。沿用旧格式（内联 SVG，标签来自 copy 文件），走了 构建 → 独立评审 → 登记。现在转换器可以处理这五篇了。
   - 外溢视口检查的 `e.closest('svg')` 跳过：其余 16 篇也已改为只跳过 `<defs>`（`c3cef443`，标签重指见下一个提交），全部通过，没有页面需要改版式；switches-that-compute 没有逐元素的视口检查，探测过 320 宽下不溢出。
3. **CPU SIMD 与浮点一篇：2026-11-16 上线**。`computing/systems/how-a-cpu-does-math/`（CPU 是怎么算小数的，又怎么一次算一排），第一篇直接用 Markdown 模板写的长文，14 章、14 个模型、13 张静态示意图，中英双语（英文 Haiku 翻译），经另一个 Claude Code 会话独立评审（specs/reviews/how-a-cpu-does-math-review-20261116.md）。
   - **提交：** 建页 `b6dcadc4`；登记与交叉链接 `c7795a74` + `1ef6c3b9`（图谱片段因 shell 失误单独进了前一个提交，两者同一说明）；标签与缓存键 `3a15d04b`；浏览器测试修正 `3d2b65c8`，本页标签指向它（original `b6dcadc4`，previous `1ef6c3b9`）。
   - **链接：** how-a-gpu-computes 第 1 章（宽向量 → 第 9 章）、第 8 章结论（FP8/FP4 缩放 → 第 7、8 章），how-a-cpu-runs-a-program 第 11 章 e2（→ 第 9 章）和第 12 章结尾（→ 页首），switches-that-compute 第 10 章新加的 `ch10.see`（→ 第 1 章）；这三页标签重指到 `1ef6c3b9`。缓存、猜测执行、供电三页只多了生成的被引用行，`page.json.version` 升到 `20261116b`，标签没重指（同批次 A 评审的处理）。GPU、A1 也是 `20261116b`；switches 第一次给四个脚本加 `?v=20261116`。
   - **别名：** 单独的「浮点数」「IEEE 754」从 switches 第 10 章移到新页第 1 章（另加 floating point、浮点、浮点数格式）；第 3 章拿四舍五入，第 7 章拿单独的 FP8/E4M3/E5M2，第 8 章拿单独的 FP4；A6 第 8 章保留「FP8 E4M3 E5M2」「FP4 格式」「FP8 formats」。别名前后扫描只有浮点数、IEEE 754 和标签 Floating Point 三处换主。
   - **遗留：** 第 14 章以纯文本提到草稿《造出并运行一个最前沿的大语言模型，需要什么》（what-a-frontier-model-takes），那篇登记时改成 `[[…]]`。评审记下的模板摩擦除「控件内溢出检查」外已在第 1b 条进模板（控件内溢出仍靠页面的 browser.cjs）。

图片生成只作后备：示意图一律用 SVG；确需插画时经 Pi 网关（`ssh -N -L 8111:127.0.0.1:8111 pi`，`/v1/images/generations`，别名 `default-image`），不在 Mac 上起网关。登记仍串行；2026-11-16 起登记写 page.json、由 `scripts/build-registry.cjs` 生成 `pages.config.js` 的 KNOWLEDGE_PAGES（第 1c 条），不再手改那一段。别人正在写的 17 篇草稿不转换，等它们登记后再说。

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
- ~~站点模板提案~~：**2026-11-16 Yangyu 批准**（原话：「OK，就按照你的方案来吧。补设计图的话，你可以先通过 SVG 生成的方式去；如果需要画图的话，你可以通过我的 LLM proxy 去调用其他的 API 做图片生成」）。按提案推荐取 D1–D10，含 D3（`Derived-From:` trailer，AUTHORSHIP.md §9 记录）。执行见下方「模板迁移与示意图补齐（2026-11-16 起）」。

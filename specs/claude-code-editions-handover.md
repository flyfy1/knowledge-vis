# Claude Code 平行版本 · 交接（2026-11-10）

- **负责会话**：Claude Code lead（claude-opus-5-5）。
- **分支**：`review/claude-pages-20261109`，未 push。
- **约定**：见 [claude-code-editions](claude-code-editions.md)。

## 进度

- **总量**：201 个 topic（排除 atlas、leetcode、investment/atlas 以及 4 页已有的 Claude 原创）。
- **已完成 68 页**：已提交、贴标并与原版互链，清单见 [`variants/claude-code/editions.js`](../variants/claude-code/editions.js)，汇总页见 `variants/claude-code/`。
  - 全部由 `claude-opus-5-5` 编写。
  - 每页都通过了 core 测试、`canvas-text-overlap --sweep`（1280/390/320 × 中英）和截图脚本（无横向溢出、无控制台报错）。
  - 没有独立评审，标签里写的是「自查验收」。
- **半成品 18 页，未提交**：在工作区里，不在 git 中，下表。
- **未开始 115 页**：见文末。

### 未提交的半成品（工作区，未跟踪）

子 Agent 因用量上限中断。

| 状态 | slug |
|---|---|
| 文件齐了，只差 BRIEF.md 和作者自己的截图复查 | doppler-effect、double-slit、electric-fields、kinetic-theory、lever-pulley、magnetic-force、magnets、pressure、resonance |
| 只有空目录或刚起头 | carnot-cycle、electromagnetic-induction、float-sink、newton-laws、ohms-law、photoelectric-effect、projectile-circular、quantum-tunneling、simple-circuits |

- **第一类**：可以让一个 Agent 补写 BRIEF、看截图、修问题后，按下面的流程提交。
- **第二类**：建议删掉目录重做。

### 未开始

- **signal**：fourier、inverted-pendulum、sampling、laplace、z-transform、lti-systems、frequency-response、modulation、kalman、wavelets
- **probability**：monte-carlo、bayes-updating、central-limit-theorem、entropy、bayes-diagnostics、genetics-probability、probability-distribution、statistical-inference、bandit-arms、mean-median-mode、probability-frequency、binomial-normal、counting-permutations、expected-value、hypothesis-testing、markov-chains、poisson-process、regression-correlation、risk-pooling
- **computing**：gradient-descent、sorting、binary-search、graph-algorithms、tcp-congestion、distributed-systems、robot-kinematics、computer-graphics、attention-mechanism、backpropagation、decision-trees、embeddings、llm-sampling、overfitting、pagerank、recursion-divide、hashing、cnn-feature-maps、rsa-encryption、shortest-path
- **chemistry**：全部 18 页
- **earth**：全部 16 页
- **biology**：全部 15 页
- **physics**：sound-vibration、chaos-threebody、eye-vision、mechanical-energy、relativity、series-parallel、sound-waves
- **engineering**：pid-control
- **language**：phonemes
- **psychology**：memory-attention、ethics-decisions
- **investment**：全部 6 页

## 怎么继续

lead 工具已归档到 `~/Documents/archive/knowledge-vis/claude-editions-tools-20261110/`。使用时复制到 `/tmp/agent-tasks/claude-editions/`；脚本里写死了这个路径。

1. **启动本地服务器**：`python3 -m http.server 18871 --bind 127.0.0.1`。
2. **派子 Agent**：
   - 先跑 `node mkprompt.cjs <批号>`，生成任务书 `p<批号>.txt`，按 `batches.json`，每批 3 个 topic。
   - 已经做完的 topic 要先从批里剔掉。
   - 子 Agent 用 opus，提示词只写一句「读取 p<批号>.txt 并照做」。
3. **提交**：子 Agent 交付后跑 `integrate.sh <slug...>`。它会：
   - 修正 fmt 尾零写法；
   - 跑 core 测试、sweep 和截图检查；
   - 通过的页面依次提交 authored 和 mechanical 两个提交：贴标、写 `cc-<slug>` 清单、给原版加对照链接、重新生成 `editions.js`。

   没通过的会列在 `BAD:` 里。
4. **改已贴标的 Claude 版**：
   - 先提交修改；
   - 再用 `repoint.cjs <新提交> <slug...>` 改指 `sourceRevision`，旧值写进 `previousSourceRevision`，`originalSourceRevision` 只写一次；
   - 然后单独提交这次改指。

## 本轮发现的共性问题（已修，后续批次的任务书已提醒）

- **数字去尾零**：`toFixed(0)` 的结果也被去掉尾零，90 显示成 9。
  - 已修 53 页，并整体改指了一次。
  - `integrate.sh` 会自动修。
- **方位词**：正文写「左图/右图」，窄屏上图是上下排的。
  - 已提醒后续批次。
  - 已完成的页面没有逐页排查，留给评审。
- **函数被遮蔽**：buoyancy-archimedes 里局部变量 `cap` 遮蔽了同名函数，页面报错。已修。

## 已知局限

- 68 页都只有作者 Agent 自查加 lead 的自动检查，lead 只抽看了少数页面的截图。教学质量需要人工对比原版评审。
- 链到 Claude 版的入口有三个：首页简介下的「Claude Code 平行版本」链接、汇总页 `variants/claude-code/`，以及每个原版页头下方的「对照 Claude Code 版 →」。

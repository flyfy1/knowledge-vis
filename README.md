# visual.integ.life — 知识索引站（原 knowledge.integ.life，已改名）

把难懂的知识点做成可以上手玩的交互页：每页一个主题，由浅入深，一步一交互。

## 结构

### 链接格式

知识页的 URL 统一为 `/<分类>/<子主题>/<页面>/`，跨页深链加 `#stepN`，例如 `/physics/circuits/ohms-law/#step2`。

- 分类 id 见 `pages.config.js` 的 `KNOWLEDGE_CATEGORIES`，子主题 id 见 `KNOWLEDGE_SUBTOPICS`；目录结构与 URL 一一对应。
- 页面 slug 用完整英文单词、小写连字符，不缩写，也不重复上层的分类名或子主题名。
- 入口页例外：`/atlas/`（知识地图）、`/investment/atlas/`（投资图谱）、`/leetcode/<id>/`、`/demos/<slug>/`（演示：不讲知识点、只展示效果的独立页面，如 `/demos/fable-flight/`）。
- 每个分类目录的 `index.html` 只是跳转到首页对应的分类视图（`/?category=<id>`），该视图按子主题分组列出全部页面。

| 分类 | 子主题 |
| --- | --- |
| `math/` 数学基础 | arithmetic 数与运算 · algebra 代数与函数 · geometry 几何 · calculus 微积分与分析 · linear-algebra 线性代数 · data 统计图表 · applied 数学应用 |
| `physics/` 物理与电路 | mechanics 力学 · matter 物质与流体 · thermal 热学 · waves 波与声 · optics 光学 · circuits 电路 · electromagnetism 电磁 · modern 近代物理 |
| `signal/` 信号与系统 | transforms 变换 · systems 系统 · sampling 采样与调制 · control 控制与估计 |
| `engineering/` 工程与控制 | control 控制工程 |
| `tech/` 技术原理 | devices 身边的设备 |
| `probability/` 概率与统计 | basics 概率基础 · everyday 日常里的统计 · statistics 描述统计 · inference 统计推断 · stochastic 随机过程与信息 |
| `computing/` 计算与智能 | algorithms 算法 · ml 机器学习 · systems 系统与安全 · graphics 图形与机器人 |
| `chemistry/` 化学 | matter 物质构成 · reactions 化学反应 · solutions 溶液与酸碱 |
| `biology/` 生物 | cells 细胞与分子 · body 人体与神经 · ecology 生态与进化 |
| `earth/` 地球与太空 | astronomy 天文 · geo 地理与地质 · climate 大气与气候 |
| `investment/` 投资 | basics 入门 · rates 利率与成本（另有 `investment/atlas/` 投资图谱） |
| `psychology/` 心理与认知 | cognition 认知 · ethics 伦理 |
| `society/` 社会与公共选择 | civics 投票与规则 |
| `economics/` 经济与金钱 | money 货币与银行 |
| `language/` 语言与语言学 | phonology 语音与音系 |

跨主题的入口与站点文件留在根目录：

- `index.html` — 索引首页，由配置自动渲染（无构建、无后端，纯静态）：默认显示 `KNOWLEDGE_FEATURED` 里的精选页、`KNOWLEDGE_ESSAYS` 里的长文和「更多入口」；`?category=` 按子主题分组，`?stage=` 按分类分组，`?s=` 全站搜索。约定见 [specs/index-pagination.md](specs/index-pagination.md)
- 长文（一篇讲透一个领域、每章配一个模型的单页）的标准、文件布局与登记步骤见 [specs/essays.md](specs/essays.md)
- `pages.config.js` — **索引配置**：新增知识页 = 在此数组加一条（填 `category`、`subtopic`、`path: "<分类>/<子主题>/<slug>/"`）+ 把页面放进同名目录
- `atlas/` — Bilingual mathematics and physics map with sourced relations, editorial routes and integrated teaching experiments. See [current development/handoff index](atlas/README.md) for verified scope, iteration evidence and next work. Lesson links in the graph are atlas-relative: `../<category>/<subtopic>/<slug>/#stepN`.
- `leetcode/` — Interactive algorithm lessons, with a dedicated collection and Python solutions. Register new problems in `leetcode/problems.config.js`; the first ten Hard problems by ascending ID (4, 10, 23, 25, 30, 32, 37, 41, 42, 44) and the original [2916](https://visual.integ.life/leetcode/2916/) are available.
- `lesson-shell.css/js`、`page-provenance.css/json` — 知识页共享样式与版本归因清单
- `specs/` — Reusable lesson authoring and verification guidance. Start with [LeetCode explainers](specs/leetcode-explainers.md) and the problem-local `BRIEF.md`. Batch-specific failure prevention is in [Hard lesson trace specification](specs/leetcode-hard-traces.md).
- `scripts/`、`tests/` — 构建脚本（如 `scripts/build-atlas-data.cjs`）与站点级测试
- `deploy/` — 部署相关：隧道脚本、旧域名跳转页
- `docs/` — 历次评审报告、平台评审截图、早期大纲
- `worklog/` — 工作日志
- `AUTHORSHIP.md` — **作者归属宪法**：每个文件由哪个 Agent 写，怎么声明、怎么查（`node scripts/authorship.cjs <文件>`）；注册表在 `authorship/`
- `AGENTS.md` — Agent 入口：先读什么、硬规则、署名与测试速查
- `WORKFLOW.md`、`UI-I18N-SPEC.md`、`CONCEPT-MAP.md` — 生产约定、界面规范、概念跨页映射

## 开发版本与修复规范

Codex 改进版本在页头显示“Codex 开发”，展开可见改进范围和源码修订。详见 [版本归因规范](specs/visual-page-provenance.md) 与 [来源清单](page-provenance.json)。每次修复必须同步维护对应 spec；尚未核实来源的页面不会自动贴标，未来 Claude Code 独立版本保留双方源码及路径。

## 部署
Pi：`~/projects/visual-site/`，systemd `visual-site.service`（python http.server :18513），
CF Tunnel ingress visual.integ.life → localhost:18513（隧道脚本在 `deploy/cf_tunnel_visual.py`）。

2026-11 起链接格式改为 `/<分类>/<子主题>/<页面>/`，旧 URL 不再保留跳转（已确认可以失效）。部署时用会删除多余文件的同步方式（如 `rsync --delete`），以免 Pi 上残留旧目录。

## LeetCode authoring and checks

The first-ten pages share navigation and trace controls, while each algorithm has
its own model, bilingual derivation, boundary presets, and Python solution.
Author copy in `leetcode/hard-first-ten/lessons.py`, run `build.py` in that folder
from any working directory, then regenerate code bundles with `write_solutions.py`.
`solution.py` remains the canonical displayed/downloaded Python source.

```sh
python3 leetcode/hard-first-ten/build.py
python3 leetcode/hard-first-ten/write_solutions.py
python3 leetcode/tests/test_hard_solutions.py
node leetcode/tests/test_hard_core.cjs
python3 -m http.server 18768 --bind 127.0.0.1
# In another shell, using an existing Playwright installation:
NODE_PATH=/path/to/node_modules node leetcode/tests/test_hard_browser.cjs
```

Browser checks accept `LESSON_BASE_URL` and optional `LESSON_SCREENSHOTS`.
See [review evidence](specs/reviews/leetcode-first-ten-review.md) for scope and
limitations. The site itself has no build-time or runtime package dependency.

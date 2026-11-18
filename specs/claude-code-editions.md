# Claude Code 平行版本 · 任务书与约定

- **目标**：Yangyu 于 2026-11-09 要求，每个课程 topic 都由 Claude Code 独立写一份自己的版本，标明是 Claude 的作品、由哪个模型编写。原版和 Claude 版要能互相跳转，方便对比两边的出品。
- **规则依据**：[visual-page-provenance](visual-page-provenance.md)「Parallel editions」。

## 进度

截至 2026-11-10 已完成全部 201 / 201 页，交接与评审建议见 [claude-code-editions-handover](claude-code-editions-handover.md)。

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

- [`variants/claude-code/`](../variants/claude-code/index.html) 列出所有 Claude 版，逐行给出原版与 Claude 版的链接和编写模型；站点首页「更多入口」一栏有它的入口卡片（2026-11-11 首页改版前在简介下方）。
- 列表数据 `variants/claude-code/editions.js` 由 lead 按 `page-provenance.json` 里的 `cc-*` 条目生成，不手改。

## 新增主题登记

（暂无）

## 2026-11-17：四个平行版本成为正式版本

按 Yangyu 2026-11-17「多 agent 写同一篇的话 默认用更好的那个版本」，对比后把 kepler-orbits、acid-base-equilibrium、
bayes-diagnostics、photosynthesis 的 Claude Code 版本搬到了原版地址（408201ac、b383c6dc、a3a44e7d、5f94f8bc），
power-converters 保留 Codex 原版。理由见 [reviews/lesson-version-choice-20261117.md](reviews/lesson-version-choice-20261117.md)。

- 这四页的 `variants/claude-code/<slug>/` 原样保留，不再改：以后改原版地址的目录。它们的对照链接和
  `variants/claude-code/` 汇总页仍指向原版地址，那里现在是同一课。
- 原版地址上去掉了「对照 Claude Code 版 →」。
- 署名怎么记见 [visual-page-provenance](visual-page-provenance.md)「Promoting a parallel edition」。

## 2026-11-19：默认版本（Claude Code 版作为默认版本）

Yangyu 2026-11-19：「请你做一个配置，让 Claude Code 开发的版本都作为默认版本吧」。

**注意：Claude Code 平行版只做过自查**（编写会话自己跑单元测试、画布扫描、看截图，见上文「自检」），没有独立评审，
也没有人工或跨模型评审；2026-11-17 只有被搬到原版地址的四课经过对比和独立评审。把它们设为默认版本，读者默认看到的
就是这些只经过自查的页面。

### 开关、钉住、解析器

- **开关**：`pages.config.js` 上半部分（手改区）`window.KNOWLEDGE_DEFAULT_EDITION = "claude-code";`。
  合法值 `"claude-code"`、`"original"`，别的值 `build-registry --check` 报错。
- **哪些页有平行版**：`scripts/build-registry.cjs`（经 `scripts/lib/editions.cjs`）逐页检测
  `variants/claude-code/<slug>/index.html`，写进生成的 KNOWLEDGE_PAGES 行
  （`editions: { "claude-code": "variants/claude-code/<slug>/" }`）和 `site-registry.json`（另有 `pinnedBy`、`href`）。
  不手写；新增或删掉一个平行版目录后 `--check` 失败，直到重新生成。
- **钉住**：行里的 `defaultEdition: "original"`，这一页不管开关，始终链到原版地址。两种来源：
  1. `page.json` 写 `"defaultEdition": "original"`（唯一合法值）；
  2. 自动：`page-provenance.json` 里该页（路径在原版目录下）的 `developer` 是 Claude Code，即原版地址上本来就是
     Claude Code 写的课，平行版是同一课的旧副本。
- **解析器**：`pages.config.js` 里的 `window.knowledgeEditionPath(page, edition)`：开关是 `claude-code`、这页有该版本、
  没被钉住时返回平行版路径，否则返回原版 `path`。只写这一处：
  - 首页 `index.html` 直接调用；
  - 构建时 `scripts/lib/editions.cjs` 的 `defaultPath()` 在 vm 里调用同一个函数（`createSite().pageHref`）；
  - `scripts/build-site-nav.cjs` 把函数源码原样写进 `site-nav-data.js`（`editionPath`，连同 `edition` 和每页的版本 id、钉住标记），
    手写页上的 `site-nav.js` 用它。页面上事先设好的 `window.KNOWLEDGE_DEFAULT_EDITION` 优先（测试用）。

### 现在的数字（2026-11-19）

- 登记的课 205 个：201 个有平行版，4 个没有（step-response、vowel-space、signal-detection、veil-of-ignorance，都没有平行版目录）。
- **196 课默认打开 Claude Code 版。**
- **钉住 5 课**：
  - power-converters：`page.json` 钉住。2026-11-17 对比时故意保留 Codex 版，因为图谱有 22 处深链指向它的具体步骤
    （[reviews/lesson-version-choice-20261117.md](reviews/lesson-version-choice-20261117.md)，理由也写在它的 BRIEF.md）。
  - kepler-orbits、acid-base-equilibrium、bayes-diagnostics、photosynthesis：原版地址上就是 2026-11-17 搬过去的 Claude Code 版，
    平行版是同一课。`page.json` 钉住，`page-provenance.json` 规则也会自动钉住（`tests/default-edition.cjs` 两条都查）。
- 长文 49 篇、入口页和演示 4 个没有平行版，不受影响。

### 跟着开关走的（页面级链接）

- 首页：精选、长文区、分类视图、子主题视图、学段视图的卡片；首页搜索的页面结果；不带锚点的概念结果（只有 4 个）。
- `/<分类>/<子主题>/` 目录页：它是跳到首页子主题视图的跳转页，卡片同上。
- 手写页上 `site-nav.js` 生成的《标题》、“Title”、`<cite>` 自动链接。
- 模板页（长文和已迁移的课）里不带锚点的 `[[slug]]`、`[[concept:…]]`（概念没有锚点时），以及「相关页面」。
  构建结果里这类链接写成 `../../../variants/claude-code/<slug>/`；`scanLinks` 把指向平行版的链接仍算作指向这一页，
  所以 `site-registry.json` 的边、「被这些页面引用」不变。

### 不跟开关走的（以及原因）

带锚点的链接始终指向原版：锚点（`#stepN`、`#chN`）和描述都是对着原版的步骤写的，平行版的步骤不同。
下面数的是 196 个跟开关走的课：

- **图谱概念**：214 处概念深链（`atlas/data.js` 各概念 `lessons[]` 里带锚点的条目，212 个概念；首页和图谱的概念搜索结果
  用的是同一批）；另有 4 条不带锚点的，在图谱里也仍指向原版。涉及这些概念的图谱边 447 条（共 921 条）。图谱整个不改。
- **其他页面带锚点的链接**：614 条（按「来源页 + 锚点」去重；`[[slug#anchor]]` 和长文、课里手写的 `href="…#…"`）。
- **「被这些页面引用」**：列出的是引用了本页的原版页面，那些链接写在原版里，所以指向原版。
- **写死的页面级链接**：手写页（含手写长文）里的 `<a href="../x/">`，以及模板正文里直接写的 `<a href>`（不是 `[[slug]]`），
  是静态 HTML，不改课程内容就改不了：57 个课被 91 个（来源页, 目标课）对这样链接，仍指向原版。要让它们跟开关走，
  得把模板正文里的 `<a href>` 改写成 `[[slug]]`（属于内容修改，要走评审），手写页则要转换成模板页。
- **原版地址不重定向**：书签和深链照常可用，原版页上的「对照 Claude Code 版 →」照旧。
- **转换器**：`build-pages.cjs` 把手写页转换成模板时，原来指向原版页首的 `<a href="../x/">` 现在不再自动变成 `[[x]]`
  （重新渲染会变成平行版地址，与原文不一致），保留为原样 HTML；指向平行版地址的链接会变回 `[[x]]`。

### 从平行版回到原版

201 个平行版页头都有「对照另一版本：<原版标题>」链接（`../../../<原版 path>`，见上文「目录与链接」；
`tests/default-edition-browser.cjs` 点过一次 fractions）。平行版不加载 `site-nav.js`，没有面包屑；这次没有改冻结的平行版。

### 怎么切回去

1. `pages.config.js` 把开关改成 `"original"`；
2. 跑 `node scripts/build-registry.cjs`、`node scripts/build-site-nav.cjs`、`node scripts/build-pages.cjs --all`；
3. 把首页 `index.html` 里 `pages.config.js?v=` 的缓存键改新（`site-nav-data.js` 的键按小时变，不用改）；
4. 提交生成的文件。`editions` 照样记录，只是不再用来生成链接。

单独让某一课回到原版：在它的 `page.json` 加 `"defaultEdition": "original"`，然后跑同样的第 2 步。

### 测试

- `node tests/default-edition.cjs`：解析器真值表（开关 × 有无平行版 × 是否钉住）、生成的 `editions` 与钉住、两种钉住来源、
  `--check` 抓到新平行版目录和新钉住、错误取值报错、`[[slug]]` 与 `[[slug#anchor]]`、`site-nav-data.js` 里的解析器与构建一致。
- `EDITION_BASE_URL=http://127.0.0.1:18871/ node tests/default-edition-browser.cjs`：首页卡片打开平行版、平行版能回到原版、
  钉住的课打开原版、子主题目录页和《标题》自动链接跟开关走、带锚点的概念结果打开原版；再在脚本运行前把开关覆盖成
  `"original"`（不改文件）重跑一遍，全部打开原版。
- `tests/home-concept-search.cjs`、`tests/site-nav-browser.cjs` 里原来写死原版地址的断言，改为断言解析器的结果。

### 后续（没做）

把带锚点的链接映射到 Claude Code 版的步骤：每一处都要对照两个版本的步骤内容逐条判断，不能按编号照搬。逐课数量如下
（概念深链 = 图谱与搜索；带锚点的链接 = 其他页面里的，按来源页 + 锚点去重；写死的页面级链接 = 链接它的来源页数）。
页面级 `[[slug]]` 引用旁边的描述（例如「前置知识在《原子结构》（原子核、电子、电子层）」）也是对着原版写的，平行版是否讲到同样内容没有逐条核对。

| 课 | 概念深链（图谱、搜索） | 其他页面带锚点的链接 | 写死的页面级链接（来源页数） |
| --- | ---: | ---: | ---: |
| `biology/body/action-potential/` | 1 | 0 | 0 |
| `chemistry/reactions/activation-energy/` | 1 | 5 | 3 |
| `math/arithmetic/area-model/` | 1 | 9 | 0 |
| `earth/climate/atmospheric-circulation/` | 1 | 0 | 0 |
| `chemistry/matter/atomic-structure/` | 2 | 7 | 1 |
| `computing/ml/attention-mechanism/` | 1 | 7 | 0 |
| `math/applied/auction-basics/` | 1 | 1 | 0 |
| `math/data/averaging-leveling/` | 1 | 1 | 0 |
| `computing/ml/backpropagation/` | 1 | 3 | 0 |
| `probability/stochastic/bandit-arms/` | 1 | 1 | 0 |
| `math/data/bar-charts/` | 1 | 2 | 0 |
| `probability/inference/bayes-updating/` | 2 | 11 | 0 |
| `computing/algorithms/binary-search/` | 1 | 3 | 2 |
| `probability/basics/binomial-normal/` | 1 | 4 | 0 |
| `physics/modern/blackbody-radiation/` | 1 | 3 | 1 |
| `biology/body/blood-circulation/` | 1 | 2 | 0 |
| `chemistry/solutions/buffer-capacity/` | 1 | 3 | 1 |
| `physics/matter/buoyancy-archimedes/` | 1 | 0 | 0 |
| `earth/climate/carbon-cycle/` | 1 | 3 | 0 |
| `physics/thermal/carnot-cycle/` | 1 | 0 | 1 |
| `biology/cells/cell-structure/` | 1 | 4 | 0 |
| `probability/statistics/central-limit-theorem/` | 2 | 13 | 1 |
| `physics/mechanics/chaos-threebody/` | 1 | 0 | 0 |
| `chemistry/reactions/chemical-equilibrium/` | 1 | 10 | 1 |
| `math/arithmetic/chicken-rabbit/` | 1 | 0 | 0 |
| `math/geometry/circle-angles/` | 1 | 4 | 0 |
| `math/geometry/circle-intro/` | 1 | 0 | 0 |
| `earth/climate/climate-energy/` | 1 | 5 | 1 |
| `earth/climate/climate-feedback/` | 1 | 5 | 0 |
| `math/geometry/clock-angles/` | 1 | 0 | 0 |
| `computing/ml/cnn-feature-maps/` | 1 | 0 | 0 |
| `chemistry/reactions/combustion-triangle/` | 1 | 0 | 0 |
| `math/algebra/complex-numbers/` | 1 | 1 | 1 |
| `investment/rates/compound-interest/` | 1 | 8 | 3 |
| `computing/graphics/computer-graphics/` | 1 | 0 | 2 |
| `math/geometry/conic-sections/` | 1 | 2 | 0 |
| `earth/geo/contour-lines/` | 1 | 0 | 0 |
| `signal/systems/convolution/` | 1 | 8 | 0 |
| `math/algebra/coordinate-plane/` | 1 | 6 | 0 |
| `earth/astronomy/cosmology-expansion/` | 1 | 2 | 0 |
| `probability/basics/counting-permutations/` | 1 | 0 | 0 |
| `earth/astronomy/day-night-rotation/` | 1 | 4 | 0 |
| `computing/ml/decision-trees/` | 1 | 2 | 0 |
| `physics/matter/density/` | 1 | 4 | 0 |
| `math/calculus/derivative/` | 1 | 13 | 0 |
| `chemistry/solutions/dissolution-saturation/` | 1 | 0 | 2 |
| `computing/systems/distributed-systems/` | 1 | 1 | 3 |
| `investment/basics/diversification/` | 1 | 1 | 0 |
| `math/arithmetic/division-remainder/` | 1 | 4 | 0 |
| `biology/cells/dna-replication/` | 1 | 1 | 0 |
| `physics/waves/doppler-effect/` | 1 | 2 | 0 |
| `physics/modern/double-slit/` | 1 | 0 | 2 |
| `math/linear-algebra/eigenvectors/` | 2 | 11 | 1 |
| `physics/electromagnetism/electric-fields/` | 1 | 5 | 2 |
| `chemistry/reactions/electrochemistry/` | 1 | 4 | 1 |
| `physics/electromagnetism/electromagnetic-induction/` | 1 | 0 | 0 |
| `computing/ml/embeddings/` | 1 | 4 | 0 |
| `biology/ecology/energy-pyramid/` | 1 | 2 | 0 |
| `probability/stochastic/entropy/` | 2 | 9 | 1 |
| `biology/cells/enzymes/` | 1 | 1 | 2 |
| `chemistry/reactions/equation-balancing/` | 1 | 0 | 0 |
| `math/algebra/equation-scale/` | 1 | 10 | 0 |
| `psychology/ethics/ethics-decisions/` | 1 | 2 | 0 |
| `probability/basics/expected-value/` | 1 | 2 | 0 |
| `math/algebra/exponents-logarithms/` | 1 | 12 | 2 |
| `math/applied/externalities/` | 1 | 0 | 0 |
| `physics/optics/eye-vision/` | 1 | 0 | 1 |
| `investment/rates/fees-compounding/` | 1 | 1 | 0 |
| `physics/matter/float-sink/` | 1 | 0 | 0 |
| `biology/ecology/food-web/` | 1 | 0 | 0 |
| `signal/transforms/fourier/` | 3 | 16 | 1 |
| `math/arithmetic/fractions/` | 1 | 6 | 0 |
| `signal/systems/frequency-response/` | 2 | 5 | 1 |
| `physics/thermal/frozen-bubble/` | 1 | 0 | 0 |
| `math/applied/game-theory/` | 1 | 4 | 0 |
| `probability/basics/genetics-probability/` | 1 | 3 | 0 |
| `computing/ml/gradient-descent/` | 1 | 13 | 0 |
| `computing/algorithms/graph-algorithms/` | 1 | 2 | 0 |
| `earth/astronomy/gravitational-lensing/` | 1 | 2 | 1 |
| `earth/astronomy/gravity-orbits/` | 1 | 5 | 1 |
| `computing/algorithms/hashing/` | 1 | 1 | 2 |
| `probability/inference/hypothesis-testing/` | 1 | 5 | 0 |
| `math/algebra/inequalities/` | 1 | 0 | 0 |
| `math/calculus/integral/` | 1 | 4 | 0 |
| `investment/rates/interest-rates-bonds/` | 1 | 4 | 3 |
| `physics/waves/interference/` | 1 | 13 | 3 |
| `math/arithmetic/intervals-fences/` | 1 | 0 | 0 |
| `math/algebra/inverse-proportion/` | 1 | 0 | 0 |
| `signal/control/inverted-pendulum/` | 1 | 8 | 0 |
| `chemistry/matter/isomers/` | 1 | 0 | 0 |
| `signal/control/kalman/` | 1 | 6 | 0 |
| `physics/thermal/kinetic-theory/` | 1 | 3 | 2 |
| `signal/transforms/laplace/` | 2 | 8 | 0 |
| `earth/geo/latitude-longitude/` | 1 | 1 | 0 |
| `physics/optics/lens/` | 1 | 5 | 1 |
| `physics/mechanics/lever-pulley/` | 1 | 3 | 0 |
| `math/calculus/limits-epsilon/` | 1 | 1 | 0 |
| `math/algebra/linear-functions/` | 1 | 13 | 0 |
| `math/linear-algebra/linear-transform/` | 2 | 4 | 1 |
| `computing/ml/llm-sampling/` | 1 | 4 | 0 |
| `biology/ecology/logistic-growth/` | 1 | 6 | 1 |
| `signal/systems/lti-systems/` | 2 | 6 | 0 |
| `physics/electromagnetism/magnetic-force/` | 1 | 2 | 1 |
| `physics/electromagnetism/magnets/` | 1 | 0 | 0 |
| `math/calculus/mandelbrot/` | 1 | 0 | 0 |
| `probability/stochastic/markov-chains/` | 1 | 1 | 0 |
| `chemistry/reactions/mass-conservation/` | 1 | 6 | 0 |
| `physics/matter/materials-science/` | 1 | 0 | 0 |
| `probability/statistics/mean-median-mode/` | 1 | 2 | 1 |
| `physics/mechanics/mechanical-energy/` | 1 | 0 | 0 |
| `math/applied/mechanism-design/` | 0 | 1 | 0 |
| `biology/cells/meiosis/` | 1 | 0 | 0 |
| `biology/cells/membrane-transport/` | 0 | 0 | 2 |
| `psychology/cognition/memory-attention/` | 1 | 1 | 0 |
| `signal/sampling/modulation/` | 1 | 4 | 0 |
| `chemistry/matter/molecular-shapes/` | 1 | 2 | 0 |
| `chemistry/matter/molecules-atoms/` | 1 | 1 | 0 |
| `physics/mechanics/momentum-collision/` | 1 | 4 | 0 |
| `probability/stochastic/monte-carlo/` | 1 | 14 | 0 |
| `earth/astronomy/moon-phases/` | 1 | 0 | 0 |
| `math/applied/music-theory/` | 2 | 1 | 0 |
| `biology/ecology/natural-selection/` | 1 | 2 | 0 |
| `math/arithmetic/negative-numbers/` | 1 | 3 | 1 |
| `biology/body/neuroscience-basics/` | 2 | 0 | 0 |
| `physics/mechanics/newton-laws/` | 1 | 4 | 0 |
| `math/calculus/newton-method/` | 1 | 0 | 0 |
| `math/arithmetic/number-combinatorics/` | 3 | 2 | 1 |
| `math/calculus/ode-phase-portraits/` | 1 | 1 | 0 |
| `physics/circuits/ohms-law/` | 1 | 4 | 3 |
| `computing/ml/overfitting/` | 1 | 3 | 0 |
| `computing/algorithms/pagerank/` | 1 | 3 | 0 |
| `math/algebra/parabola/` | 1 | 3 | 0 |
| `chemistry/matter/particles-states/` | 1 | 14 | 0 |
| `math/algebra/patterns-sequences/` | 1 | 3 | 0 |
| `math/geometry/perimeter-area/` | 1 | 4 | 0 |
| `chemistry/matter/periodic-trends/` | 1 | 0 | 0 |
| `chemistry/solutions/ph-scale/` | 1 | 2 | 2 |
| `language/phonology/phonemes/` | 1 | 2 | 0 |
| `physics/modern/photoelectric-effect/` | 1 | 4 | 1 |
| `engineering/control/pid-control/` | 1 | 2 | 0 |
| `physics/optics/pinhole-camera/` | 0 | 4 | 0 |
| `math/arithmetic/place-value/` | 1 | 0 | 1 |
| `earth/geo/plate-tectonics/` | 1 | 1 | 0 |
| `probability/stochastic/poisson-process/` | 1 | 1 | 2 |
| `math/geometry/polygon-angles/` | 1 | 0 | 0 |
| `biology/ecology/population-ecology/` | 2 | 3 | 1 |
| `physics/matter/pressure/` | 1 | 3 | 0 |
| `math/applied/prisoners-dilemma/` | 1 | 0 | 1 |
| `probability/basics/probability-distribution/` | 1 | 12 | 0 |
| `probability/basics/probability-frequency/` | 1 | 5 | 1 |
| `physics/mechanics/projectile-circular/` | 1 | 2 | 0 |
| `biology/body/public-health/` | 2 | 2 | 0 |
| `math/geometry/pythagoras/` | 1 | 11 | 0 |
| `physics/modern/quantum-basics/` | 1 | 3 | 3 |
| `physics/modern/quantum-tunneling/` | 1 | 1 | 2 |
| `chemistry/reactions/reaction-rates/` | 1 | 9 | 3 |
| `math/arithmetic/real-number-line/` | 1 | 0 | 0 |
| `computing/algorithms/recursion-divide/` | 1 | 0 | 0 |
| `physics/optics/reflection-refraction/` | 0 | 8 | 0 |
| `probability/statistics/regression-correlation/` | 1 | 2 | 1 |
| `physics/modern/relativity/` | 1 | 2 | 2 |
| `physics/waves/resonance/` | 1 | 2 | 0 |
| `probability/stochastic/risk-pooling/` | 1 | 4 | 0 |
| `investment/basics/risk-return/` | 1 | 1 | 1 |
| `computing/graphics/robot-kinematics/` | 1 | 0 | 0 |
| `computing/systems/rsa-encryption/` | 1 | 0 | 3 |
| `signal/sampling/sampling/` | 1 | 6 | 0 |
| `earth/astronomy/seasons-orbit/` | 1 | 6 | 0 |
| `earth/geo/seismic-waves/` | 1 | 1 | 0 |
| `math/algebra/sequences-series/` | 1 | 0 | 0 |
| `physics/circuits/series-parallel/` | 1 | 0 | 0 |
| `computing/algorithms/shortest-path/` | 1 | 0 | 0 |
| `math/geometry/similarity-scaling/` | 1 | 0 | 0 |
| `physics/circuits/simple-circuits/` | 1 | 2 | 0 |
| `math/algebra/simultaneous-equations/` | 1 | 0 | 0 |
| `math/geometry/solid-geometry/` | 1 | 0 | 0 |
| `computing/algorithms/sorting/` | 2 | 1 | 0 |
| `physics/waves/sound-vibration/` | 1 | 2 | 0 |
| `physics/waves/sound-waves/` | 1 | 0 | 0 |
| `math/geometry/space-diagonal/` | 1 | 0 | 0 |
| `physics/waves/standing-wave/` | 1 | 5 | 0 |
| `probability/inference/statistical-inference/` | 2 | 2 | 0 |
| `investment/basics/stocks-bonds/` | 1 | 1 | 2 |
| `math/applied/supply-demand/` | 1 | 3 | 0 |
| `math/geometry/symmetry-rotation/` | 1 | 5 | 0 |
| `math/calculus/taylor-series/` | 1 | 0 | 0 |
| `computing/systems/tcp-congestion/` | 2 | 3 | 2 |
| `physics/thermal/thermodynamics/` | 1 | 3 | 1 |
| `math/geometry/three-views/` | 1 | 1 | 0 |
| `chemistry/solutions/titration-curves/` | 2 | 1 | 1 |
| `math/geometry/trigonometry/` | 2 | 9 | 0 |
| `math/linear-algebra/vectors/` | 1 | 1 | 0 |
| `physics/mechanics/velocity-vt/` | 1 | 7 | 0 |
| `earth/climate/water-cycle/` | 1 | 0 | 0 |
| `signal/transforms/wavelets/` | 1 | 0 | 0 |
| `signal/transforms/z-transform/` | 1 | 5 | 0 |

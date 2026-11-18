# AGENTS.md — 给在本仓库干活的 Agent

适用于所有 Agent（Codex、Claude Code、Alberto/Muse 及其子 Agent）。本文只是入口和速查，细则以下列文件为准；冲突时 **AUTHORSHIP.md 优先**。

## 先读

0. [HANDOFF.md](HANDOFF.md) — **开工前第一个读**：Yangyu 与 Claude Code team lead 的工作约定，以及当前进展和下一步。
1. [AUTHORSHIP.md](AUTHORSHIP.md) — 作者归属宪法：提交怎么署名、页面怎么贴标、谁写了什么怎么查。
2. [WORKFLOW.md](WORKFLOW.md) — 生产流水线、分工、交叉评审、质量红线。
3. [UI-I18N-SPEC.md](UI-I18N-SPEC.md) — 界面与双语规范（规则 1–12）。
4. [specs/visual-page-provenance.md](specs/visual-page-provenance.md) — 页头「开发版本」标注契约。
5. 要动的页面：它目录里的 `BRIEF.md`、`specs/<slug>.md`，以及 `CONCEPT-MAP.md` 里相关的深链。

目录与 URL 规则见 [README.md](README.md)：页面在 `<分类>/<子主题>/<slug>/`。

## 硬规则

- **分支**：在自己的分支上提交，不在 main 上直接改；不碰别人的分支。例外：Claude Code 主会话这条线按 [HANDOFF.md](HANDOFF.md) 第 2 条在 main 上工作并可直接推送部署。
- **每个提交的 trailer**（格式见 AUTHORSHIP.md）：
  ```
  Built-By: <Agent> (<精确模型 id，或 model unavailable>)
  Verified-By: <实际检查者 + 检查范围；自查写 self-check，未评审写 pending>
  Authorship-Impact: authored | mechanical
  ```
  不要替别人预填背书。
- **不猜作者**。没有 `Built-By`，也没有 `authorship/overrides.json` 里的人工确认，就当作 unattributed。`overrides.json` 只记 Yangyu（或经他确认的人）确认过的事实，并写明 `source`。
- **每次修复都要同步更新对应的 spec**（缺了就新建）。只在 worklog 里记一笔不算完成。
- **AUTHORSHIP.md 的修改需要 Yangyu 同意**，并在它的 §9 记一笔。

## 登记页面：写 page.json，不手改 pages.config.js（2026-11-16 起）

- `pages.config.js` 里 `window.KNOWLEDGE_PAGES` 那一段夹在 `GENERATED` 标记之间，由 `node scripts/build-registry.cjs` 从各页目录里的 `page.json` 生成。**不要往里加行、也不要改行**：`--check` 会失败，下一次生成会把手改丢掉。
- 登记一个页面：
  1. 在页面目录建 `page.json`（有 `"status": "live"` 才算登记；手写页面不要写 `"layout"`），字段与示例见 [specs/essays.md](specs/essays.md)「Registering an essay」第 4 步；
  2. 跑 `node scripts/build-registry.cjs`，把它改写的 `pages.config.js`、`site-registry.json`、`CONCEPT-MAP.md`、`specs/atlas-edge-todo.md` 和 `page.json` 一起提交。
- 新分类、新子主题、`KNOWLEDGE_FEATURED`、`KNOWLEDGE_ESSAYS` 的顺序仍在 `pages.config.js` 上半部分手改。
- 已经手贴了一行？跑 `node scripts/build-registry.cjs --adopt`，它会把这一行搬进对应目录的 `page.json`。
- 默认版本（2026-11-19）：`pages.config.js` 上半部分的 `KNOWLEDGE_DEFAULT_EDITION = "claude-code"` 让有 `variants/claude-code/<slug>/` 平行版的课，页面级链接默认指向平行版。生成的行里的 `editions` 是脚本检测的，不手写。某页要留在原版地址：在它的 `page.json` 加 `"defaultEdition": "original"`（唯一合法值），再跑 `build-registry`。细则见 [specs/claude-code-editions.md](specs/claude-code-editions.md)「默认版本」。
- 细则：[specs/site-template.md](specs/site-template.md) §3b。

## 页面署名标注（page-provenance）

- 改了某页目录里的文件，就把该页在 `page-provenance.json` 里的 `sourceRevision` 更新为新提交（完整 40 位 SHA）。页头标签里的 `data-source-revision`、提交链接和短 SHA 要一起改。
- 旧值的去处（定义见 specs/visual-page-provenance.md「Revision fields」）：
  - `originalSourceRevision` = 本版本所依据的原始来源（原创版本就是建页提交），**一旦写入就不覆盖**；
  - 被替换的旧 `sourceRevision` 写进 `previousSourceRevision`，每次重指都更新它。
- `page-provenance.json` 的键用短 slug（如 `linear-transform`），完整路径写在 `path`。
- 提交缺 `Built-By` 时，只有两种证据可用：
  - `provenanceEvidence` 指向 `specs/reviews/*.md`；
  - `provenanceEvidence: "authorship/overrides.json"`，且该提交在里面有匹配的 `authored` 条目。
- 来源没核实的页面不贴标。
- 新的 Agent 先在 `authorship/agents.json` 登记，再在 `tests/page-provenance-core.cjs` 的 `DEVELOPERS` / `AGENT_IDS` 里加上它的显示名。

## 测试

```sh
node tests/page-provenance-core.cjs
node <页面目录>/tests/*.cjs                       # 各页自带测试
node scripts/authorship.cjs <文件>                # 查归属
node tests/authorship-derived-from.cjs            # Derived-From trailer（改了 scripts/authorship.cjs 时跑）
python3 -m http.server 18871 --bind 127.0.0.1     # 浏览器测试用的本地服务器，用完要停
PROVENANCE_BASE_URL=http://127.0.0.1:18871 node tests/page-provenance-browser.cjs
# 知识地图与搜索（改了 atlas/graph、atlas/、search/、首页搜索时跑）
node scripts/build-atlas-data.cjs --check         # 图谱生成物漂移 + 首屏索引体积上限
node scripts/build-search-index.cjs --check       # 独立搜索分片漂移 + 单分片体积上限
node atlas/tests/data-quality.cjs
node tests/concept-search.cjs                     # 匹配规则 + 十个日常词的落点
node atlas/tests/registry-import.cjs              # 文章 REGISTRY.json → 图谱片段 + 搜索分片
HOME_TEST_URL=http://127.0.0.1:18871/ node tests/home-concept-search.cjs   # 浏览器
# 站点模板（改了 scripts/build-pages.cjs、scripts/lib/template.cjs、scripts/convert-essay.cjs、templates/ 或任何带 "layout" 的 page.json 的页面时跑）
node scripts/build-pages.cjs --all --check        # 已迁移页面的生成物与源文件一致 + 双语对齐 + [[引用]] + 数字绑定
node tests/site-template.cjs                      # 夹具构建、失败模式、转换器 round trip
# 站点登记表（page.json → pages.config.js KNOWLEDGE_PAGES、site-registry.json、CONCEPT-MAP 页面概念表、specs/atlas-edge-todo.md）
node scripts/build-registry.cjs --check
node tests/build-registry.cjs
node tests/default-edition.cjs                    # 默认版本开关、解析器、editions / defaultEdition
EDITION_BASE_URL=http://127.0.0.1:18871/ node tests/default-edition-browser.cjs   # 浏览器
# 站内导航（面包屑、子主题视图、自动链接；登记新页面后先跑 node scripts/build-site-nav.cjs）
node scripts/build-site-nav.cjs --check
node tests/site-nav.cjs
SITE_NAV_BASE_URL=http://127.0.0.1:18871/ node tests/site-nav-browser.cjs   # 浏览器
```

- **已迁移到站点模板的页面**（目录里的 `page.json` 有 `"layout"`；只有登记字段、没有 `layout` 的 `page.json` 是手写页面的登记行）：改 `content.zh.md` / `content.en.md` / `figures/` / `page.json`，再跑 `node scripts/build-pages.cjs <页面目录>`；不要手改生成的 `index.html`、`copy.*.js`、`refs.json`。细则见 [specs/site-template.md](specs/site-template.md)。
  - 已迁移页面的「被这些页面引用」是生成的：任何页面（迁移与否）新加、删掉或改了指向已迁移页面的链接，被指向的页面就会漂移，`--all --check` 和 Pages 工作流会失败，直到跑一次 `node scripts/build-pages.cjs --all` 并把重建的页面一起提交。
  - 页面测试读 `index.html` 时用 `scripts/lib/prefill.cjs` 的 `unprefill(html, Z)` 去掉预填的中文（只去掉预填的，手写的仍会被查出来）；按 copy 表数链接时跳过生成的 `site.*` 键。
- 新增长文（一篇讲透一个领域）：标准、文件布局与登记步骤见 [specs/essays.md](specs/essays.md)。
- 站内导航（面包屑、`/<分类>/<子主题>/` 目录页、正文里《页面标题》自动变链接）：见 [specs/site-navigation.md](specs/site-navigation.md)。每个上线页面都引入 `site-nav.css` / `site-nav.js`，由 `scripts/build-site-nav.cjs` 生成，不手写。
- 给文章页加概念、加分区：`node scripts/atlas-import-registry.cjs <页面目录>`、`--add-region`，细则见 [specs/atlas-search-index.md](specs/atlas-search-index.md)。

- Playwright 不在本仓库，运行时加上 `NODE_PATH=~/fast/integ-life/integ-games/node_modules`。
- **浏览器测试串行跑**，不要并行。
- 大批测试会改写 `leetcode/*/tests/evidence`。每跑完一次就 `git checkout` 这一处，除非这次就是要更新证据。（`biology/cells/photosynthesis/tests/evidence` 随 2026-11-17 换版删掉的 `tests/browser.cjs` 一起没了。）
- 数值结论（如「误差在 ±X% 以内」）要用细扫测试钉住。**不要为了让测试通过而放宽容差或加粗网格**：先查结论本身对不对。
- 视觉检查至少要覆盖 1280 / 390 / 320 宽、中英文、减弱动态。DOM 溢出检查看不到 canvas 上的文字，改了 canvas 的页面要跑：
  ```sh
  CANVAS_BASE_URL=http://127.0.0.1:18871 node tests/canvas-text-overlap.cjs --sweep <页面路径/>
  ```
  `--sweep` 在 1280/390/320 三种宽度下都跑。它会：
  - 把每个滑杆拖过 11 个位置（同时触发 input 和 change）；
  - 把同一节内的两个滑杆按 6×6 网格组合；
  - 点遍复选框、单选按钮和普通按钮。

  很多重叠只在某些参数组合下才出现。它报告文字框相交和文字伸出画布，但看不出文字压在线条上，最后仍要看截图。

  只在屏幕上才画的画布（IntersectionObserver 门控的长文、`demos/scarcity-moves/`）会被自动识别：工具把它们逐块滚进视口，再按控件就近滚动、等重绘后扫描，输出里会写明哪些运行进入了这种模式。普通页面的行为和状态数不变。细则见 [specs/canvas-label-guard.md](specs/canvas-label-guard.md)。
- 新页面的画布标注要自己排好版。[`canvas-label-guard.js`](canvas-label-guard.js) 只是老页面的补救手段，见 [specs/canvas-label-guard.md](specs/canvas-label-guard.md)。

## 工作区卫生

- 临时脚本和日志放在 `/tmp/agent-tasks/<任务名>/`，或仓库内的 `.agent/`、`.runs/`，用完清理。
- 不要往 `~`、`~/Documents/`、`~/Documents/projects/` 的根目录放文件。
- 需要长期保留的大文件（如全量截图）归档到 `~/Documents/archive/knowledge-vis/`，仓库里只提交挑选过的少量证据。

## 需要明确授权才做

push、部署、同步 GitHub、更新外部项目记录，都要等 Yangyu 或 Alberto 明确授权才做。具体步骤不写在这里。

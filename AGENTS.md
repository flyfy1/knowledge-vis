# AGENTS.md — 给在本仓库干活的 Agent

适用于所有 Agent（Codex、Claude Code、Alberto/Muse 及其子 Agent）。本文只是入口和速查，细则以下列文件为准；冲突时 **AUTHORSHIP.md 优先**。

## 先读

1. [AUTHORSHIP.md](AUTHORSHIP.md) — 作者归属宪法：提交怎么署名、页面怎么贴标、谁写了什么怎么查。
2. [WORKFLOW.md](WORKFLOW.md) — 生产流水线、分工、交叉评审、质量红线。
3. [UI-I18N-SPEC.md](UI-I18N-SPEC.md) — 界面与双语规范（规则 1–12）。
4. [specs/visual-page-provenance.md](specs/visual-page-provenance.md) — 页头「开发版本」标注契约。
5. 要动的页面：它目录里的 `BRIEF.md`、`specs/<slug>.md`，以及 `CONCEPT-MAP.md` 里相关的深链。

目录与 URL 规则见 [README.md](README.md)：页面在 `<分类>/<子主题>/<slug>/`。

## 硬规则

- **分支**：在自己的分支上提交，不在 main 上直接改；不碰别人的分支。
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
python3 -m http.server 18871 --bind 127.0.0.1     # 浏览器测试用的本地服务器，用完要停
PROVENANCE_BASE_URL=http://127.0.0.1:18871 node tests/page-provenance-browser.cjs
# 知识地图与搜索（改了 atlas/graph、atlas/、首页搜索时跑）
node scripts/build-atlas-data.cjs --check         # 生成物漂移 + 首屏/搜索索引体积上限
node atlas/tests/data-quality.cjs
node tests/concept-search.cjs                     # 匹配规则 + 十个日常词的落点
node atlas/tests/registry-import.cjs              # 文章 REGISTRY.json → 图谱片段
HOME_TEST_URL=http://127.0.0.1:18871/ node tests/home-concept-search.cjs   # 浏览器
```

- 新增长文（一篇讲透一个领域）：标准、文件布局与登记步骤见 [specs/essays.md](specs/essays.md)。
- 给文章页加概念、加分区：`node scripts/atlas-import-registry.cjs <页面目录>`、`--add-region`，细则见 [specs/atlas-search-index.md](specs/atlas-search-index.md)。

- Playwright 不在本仓库，运行时加上 `NODE_PATH=~/Documents/integ-life/integ-games/node_modules`。
- **浏览器测试串行跑**，不要并行。
- 大批测试会改写 `leetcode/*/tests/evidence` 和 `biology/cells/photosynthesis/tests/evidence`。每跑完一次就 `git checkout` 这两处，除非这次就是要更新证据。
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

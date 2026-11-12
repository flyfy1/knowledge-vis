# 作者归属宪法（AUTHORSHIP）

本仓库的每一个文件，都必须能回答「是哪个 Agent 写的」。本文件是这件事的最高约定：其他文档（WORKFLOW.md、specs/visual-page-provenance.md、各页 BRIEF）与本文冲突时，以本文为准。修改本文需要 Yangyu 同意，并在 §9 记一笔。

- 制定：Claude Code（claude-opus-5-5），2026-11-08，应 Yangyu 要求起草
- 状态：生效

## 1. 原则

1. **git 历史是唯一事实来源。** 作者信息只从提交记录推导，不在文件里另存一份会过期的副本。
2. **不猜。** 推导不出来就标 `unattributed`（未归属），不按文风、时间或「大概是谁」去补。
3. **每次提交都要声明。** 自 2026-11-08 起，没有 `Built-By` 的提交视为违反本宪法。
4. **只有写作才算作者。** 纯搬迁、批量改路径、重新生成产物属于机械变更（mechanical），会被记录，但不会让执行者成为文件作者。
5. **更正只能追加，不能改写历史。** 不得为了补归属去 rebase、amend 已推送的提交；补充事实写进 `authorship/overrides.json`，并注明是谁、何时确认的。
6. **可见标注要与历史一致。** 页面上显示的「谁开发」（page-provenance）必须和本文推导的结果一致，不能多写，也不能漏写。

## 2. Agent 注册表

Agent 是「执行者」，模型是它当时用的具体模型。两者分开记录。注册表的机器可读版本在 [`authorship/agents.json`](authorship/agents.json)；新 Agent 必须先登记，再提交第一份作品。

| id | 是谁 | 常见模型 id |
| --- | --- | --- |
| `claude-code` | Claude Code（Anthropic），包括 Mini Claude Code 等派生运行 | `claude-opus-5-5`、`claude-sonnet-5-5`、`claude-fable-5-1` |
| `codex` | Codex（OpenAI），包括 Pi 上的 campaign author/reviewer/dispatcher | `gpt-6.1-sol` |
| `alberto` | Alberto（Muse）编排者及其派出的子 Agent | `muse-wonder`、`muse-spark` |
| `antigravity` | Antigravity（Google DeepMind）及其派出的子 Agent | `gemini-4-hydrogen`、`gemini-pro`、`gemini-flash` |
| `script` | 确定性脚本，没有模型参与 | `none` |
| `human` | Yangyu 亲手写的 | — |
| `unattributed` | 历史里没有可用声明（保留值，不得用于新提交） | — |

## 3. 提交声明格式

每个提交的说明末尾必须带以下 trailer：

```
Built-By: <agent-id 或可被注册表识别的名字> (<精确模型 id，或 "model unavailable">)[; 角色说明]
Verified-By: <实际检查者 + 检查范围>，未经独立评审写 "self-check"，评审待做写 "independent review pending"
Authorship-Impact: authored | mechanical
```

- `Built-By` 写**实际动手的那一个**；多个 Agent 合写时，主要作者写在最前面，其余写进角色说明。
- 精确模型拿不到时，要明说 `model unavailable`，不能空着，也不能填「应该是」的模型。
- `Authorship-Impact` 不写时默认为 `authored`；合并提交（merge）默认为 `mechanical`（集成），除非它自己另外声明。
- Claude Code 的提交另外保留 `Co-Authored-By: Claude …` 行；仅有 `Co-Authored-By`、没有 `Built-By` 的提交也能被识别，但不合规。
- 署名他人（如 Alberto）只能在他实际审核后写，不得预填背书（沿用 WORKFLOW.md 的规定）。

## 4. 单个文件的归属怎么推导

[`scripts/authorship.cjs`](scripts/authorship.cjs) 按时间顺序走完整个历史，并跟随重命名。对每个现存文件给出：

| 字段 | 含义 |
| --- | --- |
| `created` | 第一次把这个文件加进仓库的提交、Agent 与模型 |
| `agents` | 每个 Agent 以「写作」身份改过它多少次、加了多少行 |
| `primary` | **主要作者**：`agents` 里新增行数最多的那个；若没有任何「写作」提交：首次加入就是写作则取 `created` 的 Agent，首次加入也是机械变更则记 `unattributed`（机械执行者永远不算作者） |
| `mechanical` | 只做过机械变更的 Agent（不算作者） |
| `lastAuthored` | 最后一次「写作」性质的修改 |
| `renamedFrom` | 历史上用过的路径（搬目录不会丢失作者） |

一个提交按以下顺序归属，先命中的为准：

1. `authorship/overrides.json` 里人工确认的条目；
2. 正文或 trailer 中的 `Built-By:` 行，用注册表匹配；
3. 指向已登记 Agent 的 `Co-Authored-By:` 行；
4. 以上都没有，记为 `unattributed`。

## 5. 未归属文件与更正

截至 2026-11-08（HEAD 49272857）的推导结果：

| | Codex | Claude Code | Alberto | 脚本 | 未归属 |
| --- | --- | --- | --- | --- | --- |
| 提交数 | 585 | 9 | 121 | 149 | 256 |
| 文件数（按主要作者） | 15719 | 743 | 425 | 3 | 3423 |

未归属的文件主要来自 2026-10-17 至 10-31 之间、没写 `Built-By` 的集成和证据提交，多数在 `leetcode/`、`specs/reviews/` 下。补救方式：

- 由 Yangyu（或经他确认的知情者）在 `authorship/overrides.json` 的 `commits` 里按提交补记 Agent，并写明 `source`（谁确认、何时）。
- 单个文件确有特殊情况（例如提交 A 名义上是集成，实际是某 Agent 手写的），写进 `files`。
- 不得通过推测批量补记。

## 6. 怎么查询

```sh
node scripts/authorship.cjs physics/circuits/ohms-law/index.html   # 看一个或多个文件
node scripts/authorship.cjs --summary                               # 每个顶层目录各 Agent 的文件数
node scripts/authorship.cjs --commits                               # 每个提交的归属（审计用）
node scripts/authorship.cjs --write                                 # 生成完整清单 authorship/inventory.json
```

`authorship/inventory.json` 是生成物（约 7MB，每次提交都会变），已被 `.gitignore` 排除，需要时随时重新生成，不入库。

## 7. 页面上的可见标注

知识页页头的「开发版本」标注（`page-provenance.json` + `page-provenance.css`）是本宪法在页面上的投影：

- 适用于所有 Agent，不只 Codex。`developer` 填注册表里的显示名（如 `Codex`、`Claude Code`）。
- `kind: "revised"` 表示在已有页面上改进，`kind: "original"` 表示该 Agent 从零写的新页。
- `sourceRevision` 必须是真实存在、且确实改动了该页的提交。
- 未核实来源的页面不贴标（沿用 specs/visual-page-provenance.md）。

## 8. 新文件与新页面的义务

- Agent 新建的每个文件，都必须在带合规 `Built-By` 的提交里首次出现。
- 新知识页还要：在 `BRIEF.md` 开头写明作者 Agent 与模型；页面贴上 §7 的可见标注；在 `page-provenance.json` 登记。
- 用确定性脚本批量生成的文件，`Built-By` 写 `script`，并在角色说明里注明脚本路径。

## 9. 修订记录

| 日期 | 修订 | 执行 | 同意 |
| --- | --- | --- | --- |
| 2026-11-08 | 初版 | Claude Code（claude-opus-5-5） | Yangyu（口头要求起草） |
| 2026-11-13 | §2 注册 `antigravity` Agent | Antigravity | Yangyu（对话同意） |

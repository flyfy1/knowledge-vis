# atlas/graph/ — 知识图谱数据源（P0，2026-10-30）

`atlas/data.js` 是生成物，不要手改。改这里，再跑生成脚本。

## 文件

- `groups.json`：10 个编辑分区（顺序即地图列序）。
- `types.json`：4 种边类型（不变）。
- `core.json`：2026-10-30 当天 `data.js` 的 nodes/edges/trails 原文转储
  （39 节点 / 51 边 / 14 路线）。核心节点的 `lessons[]` 与 `stage`
  由生成脚本从其 `source` 深链反推。
- `lessons/<slug>.json`：每课一个片段（v1 格式：conceptId/group/title/
  description/formula/source/edges/routes；v2 格式见设计报告 §5.5）。
  2026-10-30 夜班 103 个片段已迁入此处。
- `decisions.json`：近义裁决表。当前两条：`resonance-mechanical` 与
  `vectors-lesson` 挂靠既有节点（不新建）；resonance 的 source 按设计
  改为新页入门步，freqresp#step5 保留在 `lessons[]`。
- `partition-overrides.json`：v1 里 `group: OTHER/optics/uncertainty`
  的 26 个片段的人工分区（按主题，不是按注册表分类硬推）。
- `merge-report.json`：每次生成后写出（不部署，仅工作用）。

## 生成

```sh
node scripts/build-atlas-data.cjs            # 写出 atlas/data.js + merge-report.json
node scripts/build-atlas-data.cjs --check    # 只比对不写，漂移即失败
```

生成规则（设计报告 §5.6）：节点 id 冲突不覆盖（无裁决则跳过并报告）；
边同 `from:to` 内容相同去重、不同则 `owner === to` 的胜出；端点不存在
的边暂挂；问题链相邻站必须有边、目标节点须在链内、目标锚点须存在，
否则该问题暂挂。暂挂项只进报告，不中断生成、不进入 `data.js`。

## 当前状态（2026-10-30 P0）

- 140 节点 / 220 边 / 14 路线 / 89 问题，`data.js` 286,129 字节
 （400KB 门内，不用拆 `questions.js`）。
- 暂挂：17 条边、14 个问题。原因分两类：① 引用了尚无节点的概念
  （game-theory、climate-energy、gradient-descent、photosynthesis、
  supply-demand、binary-search、exp-log、graph-algorithms、hashing、
  estimate、velocity-vt）——等这些概念建节点后重跑即自动接入；
  ② 已有节点之间缺一条边（gaussian–probability、convolution–
  derivative、interference–superposition、probability–variance、
  eigen–probability 等 6 处）——需人工补边，不自动编造。
- 覆盖缺口 73 页：live 页中尚无节点挂靠的页（含全部老页中非节点
  来源页与 hashing、limits-epsilon 等无片段新页）。P0 的校验器不
  把覆盖缺口当失败；缺口清单在 `merge-report.json` 里逐项可查。
- 7 个 legacy 步骤锚点：power-converters 节点的旧 `source`
  （#step0–#step5）在该页内并无对应 stepN id（老页结构不同），
  生成时已把这 7 个 lesson 的 step 置空并记入报告，不再断言
  未经验证的步骤号。
- 校验器升级（`atlas/tests/data-quality.cjs`）：formula 可省略
  （存在则非空）；新增 stage 合法、lesson slug live 与步骤锚点、
  questions 四项必填与链连通、aliases 双语检查。
- 7 处写死 39/51/14 的测试已解耦为“≥ 基线且被测 id 仍存在”。
- app.js P0：10 分区自动渲染、学段筛选（`?stage=`，无 stage 的
  legacy 节点视为不限学段）、问题层最小 UI（`?question=`，链上
  各站按钮 + 揭晓 `<details>` + “打开这一步”落点链接）、无公式时
  不渲染空公式框。
- 未做（P1/P2）：`?lesson=` 反查入口、CONCEPT-MAP 生成附录、
  galaxy 分区色、逐站提问与揭晓文案补齐、浏览器级实测。

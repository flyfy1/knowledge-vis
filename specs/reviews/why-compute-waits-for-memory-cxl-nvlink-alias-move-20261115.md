# why-compute-waits-for-memory — Antigravity (gemini-4-hydrogen) original edition; registrar alias move and one link 2026-11-15 (B3/B4)

The essay `computing/systems/why-compute-waits-for-memory/` was written from scratch in zh and en by Antigravity
(gemini-4-hydrogen) in e975710b809d0fe16d35a09db8d12ea686ecc6e8 (reviewed by Antigravity itself; no independent review by
another developer). Its page label stays `Antigravity 开发 · 原创版本`.

On 2026-11-15 the registrar for the bus series B3 (`computing/systems/how-memory-talks/`) and B4
(`computing/systems/coherent-interconnects/`), Claude Code (claude-opus-5-5), made these mechanical changes in that directory
(team-lead decisions in the registrar's task; one word, one owner):

- `REGISTRY.json`, concept `data-movement-energy-hbm` (#ch9): NVLink 带宽 and NVLink vs PCIe are removed; they move to
  coherent-interconnects #ch8 (NVLink and NVSwitch, which compares NVLink 5 with PCIe 5.0 ×16). Concept
  `memory-wall-frontier-2026` (#ch10): CXL 内存池 and CXL memory pooling are removed; they move to coherent-interconnects #ch6
  (memory pooling and CXL switches, with a pooling model). Both chapters keep their other aliases (HBM 高带宽内存, CoWoS, HBM4,
  HBM3e, 共封装光学 CPO / co-packaged optics, 存算一体 PIM, …). Titles, descriptions and anchors are unchanged. The atlas fragment
  `atlas/graph/lessons/why-compute-waits-for-memory.json` was re-imported (14 hand-written edges kept).
- `copy.zh.js` / `copy.en.js`, key `ch5.p2`: the existing words "DDR 内存通道" / "DDR channels" become a link to
  how-memory-talks #ch5 (DDR5 bursts and subchannels, peak bandwidth per channel). No other text changed.
- `index.html`: the four scripts move from `?v=20261115` (deployed) to `?v=20261115b`, because the copy changed.
- `tests/models.cjs` checks that the four aliases are gone, that the kept ones stay, and that ch5.p2 links how-memory-talks #ch5
  in both languages with an existing anchor. `tests/concept-search.cjs` pins the moved queries to coherent-interconnects.

As with the earlier repoints (specs/reviews/why-compute-waits-for-memory-fetch-decode-alias-20261115.md,
specs/reviews/why-compute-waits-for-memory-alias-move-20261115.md), the commit that carries this note is the label's repoint
target: the authored content is still Antigravity's (originalSourceRevision = e975710b); the commit's own `Built-By: Claude Code`
covers only the alias move, the one link, the cache keys and the test.

# why-compute-waits-for-memory — Antigravity (gemini-4-hydrogen) original edition; registrar alias removal 2026-11-15 (取指 译码 执行)

The essay `computing/systems/why-compute-waits-for-memory/` was written from scratch in zh and en by Antigravity
(gemini-4-hydrogen) in e975710b809d0fe16d35a09db8d12ea686ecc6e8 (reviewed by Antigravity itself; no independent review by
another developer). Its page label stays `Antigravity 开发 · 原创版本`.

On 2026-11-15 the registrar for the computer architecture series A4 (`computing/systems/how-a-cpu-guesses-ahead/`) and A5
(`computing/systems/how-cores-share-memory/`), Claude Code (claude-opus-5-5), made one mechanical change in that directory,
closing the search collision recorded in HANDOFF.md and `specs/essay-briefs/TASK-arch-series.md`:

- `REGISTRY.json`, concept `pipeline-memory-stall` (#ch1): the search alias 取指 译码 执行 is removed. switches-that-compute
  #ch9 carries the same alias and teaches fetch-decode-execute on its stored-program machine; with both carrying it the zh
  query tied and landed here, on a chapter about pipeline stalls. The chapter keeps 流水线气泡, CPU 为什么会等内存, 数据旁路, CPI,
  AI 芯片为什么大部分时间都在等, pipeline stall, instruction pipeline, load-use hazard, forwarding and the other English aliases.
  Title, description and anchor are unchanged. The atlas fragment `atlas/graph/lessons/why-compute-waits-for-memory.json` was
  re-imported (14 hand-written edges kept).
- `tests/models.cjs` checks that 取指 译码 执行 is gone and that the kept pipeline aliases stay. `tests/concept-search.cjs` pins
  the query to switches-that-compute #ch9.
- No copy, model or script changed, so the script cache keys stay at `?v=20261115`.

As with the earlier repoints (specs/reviews/why-compute-waits-for-memory-alias-move-20261115.md,
specs/reviews/why-nvme-is-fast-alias-move-20261114.md), the commit that carries this note is the label's repoint target: the
authored content is still Antigravity's (originalSourceRevision = e975710b); the commit's own `Built-By: Claude Code` covers
only the alias removal and the test.

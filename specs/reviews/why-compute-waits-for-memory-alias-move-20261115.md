# why-compute-waits-for-memory — Antigravity (gemini-4-hydrogen) original edition; registrar alias move and link to the cache essay 2026-11-15

The essay `computing/systems/why-compute-waits-for-memory/` was written from scratch in zh and en by Antigravity
(gemini-4-hydrogen) in e975710b809d0fe16d35a09db8d12ea686ecc6e8 (reviewed by Antigravity itself; no independent review by
another developer). Its page label stays `Antigravity 开发 · 原创版本`.

On 2026-11-15 the registrar for the computer architecture series A2 (`computing/systems/how-cpu-caches-work/`),
Claude Code (claude-opus-5-5), made one mechanical change in that directory, following the team lead's "one word, one
owner" decision in `specs/essay-briefs/TASK-arch-series.md`:

- `REGISTRY.json`, concept `memory-hierarchy-cache-walk` (#ch2): the search aliases L1 L2 L3 缓存, 缓存行, 组相联缓存,
  cache line and set associative cache are removed; they now belong to how-cpu-caches-work #ch1, #ch2 and #ch3, which
  answer them in depth. The chapter keeps 缓存命中率, 按行遍历 按列遍历, 空间局部性, 为什么二维数组按行更快, cache hierarchy,
  L1 L2 L3 DRAM latency, row major vs column major and spatial locality. Title, description and anchor are unchanged.
- `copy.zh.js` and `copy.en.js`, key `ch2.p3`: one sentence appended at the end, 「每一级缓存内部怎么工作，见《CPU 的三级缓存是
  怎么工作的》。」 / "How each cache level works inside is in How a CPU's Three Levels of Cache Work.", the title linking to
  `../how-cpu-caches-work/`. No other word, number or model changed.
- `index.html` loads its four scripts with `?v=20261115` (it had no key; specs/essays.md, "Registering an essay", step 7).
- `tests/models.cjs` checks that the link resolves, that zh and en carry the same links and quote the title as in
  `pages.config.js`, and that the moved aliases are gone while the kept ones stay.

As with the why-nvme-is-fast repoints (specs/reviews/why-nvme-is-fast-alias-move-20261114.md and its successors), the commit
that carries this note is the label's repoint target: the authored content is still Antigravity's
(originalSourceRevision = e975710b); the commit's own `Built-By: Claude Code` covers only the alias move, the sentence, the
cache keys and the test.

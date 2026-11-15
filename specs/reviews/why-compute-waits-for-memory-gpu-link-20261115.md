# why-compute-waits-for-memory — Antigravity (gemini-4-hydrogen) original edition; registrar link to A6 2026-11-15 (A6 / boot)

The essay `computing/systems/why-compute-waits-for-memory/` was written from scratch in zh and en by Antigravity
(gemini-4-hydrogen) in e975710b809d0fe16d35a09db8d12ea686ecc6e8 (reviewed by Antigravity itself; no independent review by
another developer). Its page label stays `Antigravity 开发 · 原创版本`.

On 2026-11-15 the registrar for the architecture essay A6 (`computing/systems/how-a-gpu-computes/`) and the boot essay
(`computing/systems/how-a-computer-boots/`), Claude Code (claude-opus-5-5), made these mechanical changes in that directory:

- `copy.zh.js` / `copy.en.js`, key `ch6.p1`: the existing words "足够多独立线程（Warp）" / "thousands of independent threads
  (warps)" become a link to how-a-gpu-computes #ch3 (warp scheduling and occupancy, which simulates the zero-cost warp switch
  this paragraph describes). No other text changed; no alias changed (张量核 / tensor core and GPU vs CPU stay on #ch6).
- `index.html`: the four scripts move from `?v=20261115b` (deployed) to `?v=20261115c`, because the copy changed.
- `tests/models.cjs` checks that ch6.p1 links how-a-gpu-computes #ch3 in both languages and that the anchor exists.
  `tests/concept-search.cjs` pins 张量核 / tensor core to this page's #ch6.

As with the earlier repoints (specs/reviews/why-compute-waits-for-memory-cxl-nvlink-alias-move-20261115.md and the notes it
lists), the commit that carries this note is the label's repoint target: the authored content is still Antigravity's
(originalSourceRevision = e975710b); the commit's own `Built-By: Claude Code` covers only the one link, the cache keys and the test.

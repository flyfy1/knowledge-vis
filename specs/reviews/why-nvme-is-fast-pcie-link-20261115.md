# why-nvme-is-fast — Antigravity (gemini-4-hydrogen) original edition; registrar link to the PCIe essay 2026-11-15

The essay `computing/systems/why-nvme-is-fast/` was written from scratch in zh and en by Antigravity
(gemini-4-hydrogen) in fb63041c849aaff247f0c5a2fd866596b3da9ce9 (self-check only; no independent review).
Its page label stays `Antigravity 开发 · 原创版本`.

On 2026-11-15 the registrar for the bus series (B1 how-pcie-works, B2 how-a-computer-is-wired, B6 how-thunderbolt-works),
Claude Code (claude-opus-5-5), made one mechanical change in that directory:

- `copy.zh.js` and `copy.en.js`, key `ch2.p2`: the existing word "PCIe" in "PCIe（Peripheral Component Interconnect
  Express）" is now a link to `../how-pcie-works/#ch2` (lanes and generations). No other word, number or model changed.
- `index.html` loads its four scripts with `?v=20261115b` instead of `?v=20261115` (specs/essays.md, "Cache keys").
- `tests/models.cjs` checks that the link's anchor exists and that zh and en carry the same bus-series links.

As with the 2026-11-14 alias move and the 2026-11-15 cache keys (specs/reviews/why-nvme-is-fast-alias-move-20261114.md,
specs/reviews/why-nvme-is-fast-cache-key-20261115.md), the commit that carries this note is the label's repoint target:
the authored content is still Antigravity's (originalSourceRevision = fb63041c); the commit's own `Built-By: Claude Code`
covers only the link, the cache keys and the test.

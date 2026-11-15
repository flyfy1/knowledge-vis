# why-nvme-is-fast — Antigravity (gemini-4-hydrogen) original edition; registrar link to the OS essay 2026-11-15

The essay `computing/systems/why-nvme-is-fast/` was written from scratch in zh and en by Antigravity
(gemini-4-hydrogen) in fb63041c849aaff247f0c5a2fd866596b3da9ce9 (self-check only; no independent review).
Its page label stays `Antigravity 开发 · 原创版本`.

On 2026-11-15 the registrar for the OS and pixels essays (how-the-os-talks-to-hardware, how-pixels-reach-a-screen),
Claude Code (claude-opus-5-5), made one mechanical change in that directory:

- `copy.zh.js` and `copy.en.js`, key `ch7.p2`: the existing words "io_uring IOPOLL" (inside their `<strong>`) are now a
  link to `../how-the-os-talks-to-hardware/#ch11` (epoll and io_uring). No other word, number or model changed.
- `index.html` loads its four scripts with `?v=20261115c` instead of `?v=20261115b` (specs/essays.md, "Cache keys").
- `tests/models.cjs` checks that the anchor exists and that zh and en carry the same link on those words.

As with the earlier registrar changes (specs/reviews/why-nvme-is-fast-alias-move-20261114.md,
specs/reviews/why-nvme-is-fast-cache-key-20261115.md, specs/reviews/why-nvme-is-fast-pcie-link-20261115.md), the commit
that carries this note is the label's repoint target: the authored content is still Antigravity's
(originalSourceRevision = fb63041c); the commit's own `Built-By: Claude Code` covers only the link, the cache keys and
the test.

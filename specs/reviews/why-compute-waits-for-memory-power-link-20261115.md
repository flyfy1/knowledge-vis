# why-compute-waits-for-memory — Antigravity (gemini-4-hydrogen) original edition; registrar link to the power essay 2026-11-15 (power / NIC)

The essay `computing/systems/why-compute-waits-for-memory/` was written from scratch in zh and en by Antigravity
(gemini-4-hydrogen) in e975710b809d0fe16d35a09db8d12ea686ecc6e8 (reviewed by Antigravity itself; no independent review by
another developer). Its page label stays `Antigravity 开发 · 原创版本`.

On 2026-11-15 the registrar for `computing/systems/how-power-reaches-the-cpu/` and `computing/systems/how-a-nic-moves-packets/`,
Claude Code (claude-opus-5-5), made these mechanical changes in that directory:

- `copy.zh.js` / `copy.en.js`, key `ch5.p1`: the existing words "动态功耗公式" / "dynamic power formula" become a link to
  how-power-reaches-the-cpu #ch2 (dynamic power C·V²·f plus leakage on a V/f curve, and why the core runs near one volt). No other
  text changed. The power essay already links this chapter (ch2.p4 → #ch5) and leaves Dennard scaling / 登纳德缩放 here.
- `REGISTRY.json`, #ch10: the en aliases gain `CPO` (the zh list already had 共封装光学 CPO). Without it the bare query CPO opened the
  power essay's #ch2 by a one-letter match on "CPU power formula"; with it, it opens #ch10 again (pinned in tests/concept-search.cjs).
- `index.html`: the four scripts move from `?v=20261115c` (deployed) to `?v=20261115d`, because the copy changed.
- `tests/models.cjs` checks that ch5.p1 links how-power-reaches-the-cpu #ch2 in both languages, on the existing words, and that the
  anchor exists.

Not changed: ch5.p1 still links `tech/semiconductors/why-chips-are-hard/#ch4`, an unregistered draft (the atlas build warns that
`relatedPages` names it); it stays for that draft's registrar.

As with the earlier repoints (specs/reviews/why-compute-waits-for-memory-gpu-link-20261115.md and the notes it lists), the commit that
carries this note is the label's repoint target: the authored content is still Antigravity's (originalSourceRevision = e975710b); the
commit's own `Built-By: Claude Code` covers only the one link, the alias, the cache keys and the test.

# Attribution preparation verification — 2026-10-26

Status: scoped implementation checked locally; worker integration and deployment **not performed**. Source baseline1d90150cf9c1db194769dff92dc4178ce7779fb0. Isolated branch `codex/visual-attribution-20261026` in the existing clean delivery worktree; original dirty checkout and concurrent LeetCode work remain untouched.

## Behavior verified

All14 evidenced revised pages show exactly one static header label and the correct source link. English and Chinese both render at1280px and320px without component/page horizontal overflow; disclosure toggles and its source link is usable. Unknown Fourier and all three worker pages remain unmodified/unlabelled by this batch.

Real Chrome keyboard Enter/Space opens/closes native details; Tab reaches source; source focus and open state survive programmatic language activation. Atlas, trig, derivative and complex-numbers disclosures were checked at320px with200% root font size. An additional Chinese atlas200% screenshot confirms wrapping. No-JavaScript atlas/trig labels still show and expand. Forced-color focus is3px; reduced-motion mode adds no animation.

Existing-state checks: changing trig angle89.9°, opening attribution and switching language preserve angle and#step4; atlas query survives language, navigation to trig, Back and reload. No application errors or failed requests observed. This is scoped attribution/state verification, not certification of every course or the workers' future changes.

Viewed actual desktop and200% narrow screenshots. The first run exposed an unattractive two-column source link at200%; changed only that anchor to an inline block and reran the affected browser suite against final CSS. No clipping remains. Native title/control text retains line wrapping.

Text contrast on the component's solid#121a24 background: body#e8edf4=14.89:1; link/summary#67d7f9=10.56:1; border#596d85=3.30:1. Palette is inherited from the site's approved dark colors; styles are namespaced and no global selector/controller was added.

## Reproduce

```sh
node tests/page-provenance-core.cjs
python3 -m http.server 18789 --bind 127.0.0.1
# separate shell, existing Playwright installation
NODE_PATH=/path/to/node_modules PROVENANCE_BASE_URL=http://127.0.0.1:18789 node tests/page-provenance-browser.cjs
git diff --check
```

Core checks bind static markup to JSON, actual Codex source changes and immutable source evidence, plus negative controls. Browser evidence: [browser.json](browser.json); screenshots adjacent. Final runtime fingerprints: [runtime-hashes.json](runtime-hashes.json). No repository-wide test rerun because models/controllers did not change.

## Integration handover

1. Parent delivers each worker's local commit. Inspect exact parent/base and changed paths; select only its page and scoped spec/tests, not unrelated/uncommitted files.
2. Integrate onto this isolated branch. Keep existing source/contributors; add truthful Codex revised-edition records with each worker's real accepted source revision. Replace/reconcile duplicate labels only after handover. Photosynthesis has known mixed Codex/Alberto/Claude history; do not claim Codex-exclusive creation.
3. Merge required worker spec links into the existing index without importing unrelated policy drafts. Update scoped attribution checks to cover newly integrated pages (the initial14/worker-negative expectations describe preparation only), run each worker's affected acceptance plus shared header/state checks, and review visible mobile scroll/process behavior.
4. Only then prepare an exact release manifest with source commit(s), fresh production fingerprints/backups and scoped runtime files. Push source commits, deploy through the existing Pi static flow and verify actual production mobile behavior, identifier, HTTPS and release/resources. No production write in this preparation.

Limits: no physical Android device, screen-reader speech, real-user learning/quality comparison or final integrated production checks. Future Claude Code variant convention is documented, not a fabricated hosted alternative. Unverified pages and concurrent LeetCode page labels remain explicitly outside this preparation.

Independent bounded implementation review: **PASS, zero remaining must-fix**. [Report](implementation-review.md) and [machine record](implementation-review.json). Reviewer independently checked core/data, stripped-component equivalence to baseline, no worker/LeetCode tracked changes, document links and selected actual screenshots; browser interaction evidence remains attributed to root, not relabelled an independent browser run.
